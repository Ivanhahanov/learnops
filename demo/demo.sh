#!/bin/sh
set -e

DOMAIN="learnops.local"
KEYCLOAK_HOSTNAME="auth.$DOMAIN"
TEMP_SSL_DIR=".ssl"
CLUSTER_NAME="kind"


echo "# do some clean up"
rm -rf ${TEMP_SSL_DIR}

echo "# create a folder to store certificates"
mkdir -p ${TEMP_SSL_DIR}

echo "# generate an rsa key"
openssl genrsa -out .ssl/root-ca-key.pem 2048

echo "# generate root certificate"
openssl req -x509 -new -nodes -key .ssl/root-ca-key.pem \
  -days 3650 -sha256 -out .ssl/root-ca.pem -subj "/CN=kube-ca"

if kind get clusters | grep -q "$CLUSTER_NAME"; then
  echo "Kind cluster $CLUSTER_NAME exists. Deleting..."

  # Delete the kind cluster
  kind delete cluster --name "$CLUSTER_NAME"

  echo "Kind cluster $CLUSTER_NAME deleted."
fi

kind create cluster --name $CLUSTER_NAME --config  - <<EOF
kind: Cluster
apiVersion: kind.x-k8s.io/v1alpha4
nodes:
- role: control-plane
  kubeadmConfigPatches:
  - |
    kind: InitConfiguration
    nodeRegistration:
      kubeletExtraArgs:
        node-labels: "ingress-ready=true"

    kind: ClusterConfiguration
    apiServer:
      extraArgs:
        oidc-client-id: kube
        oidc-issuer-url: https://${KEYCLOAK_HOSTNAME}/realms/master
        oidc-username-claim: preferred_username
        oidc-groups-claim: groups
        oidc-username-prefix: "-"
        oidc-ca-file: /etc/ca-certificates/dex/root-ca.pem
  extraMounts:
  - hostPath: $PWD/.ssl/root-ca.pem
    containerPath: /etc/ca-certificates/dex/root-ca.pem
    readOnly: true
  extraPortMappings:
  - containerPort: 80
    hostPort: 80
    protocol: TCP
    listenAddress: "0.0.0.0"
  - containerPort: 443
    hostPort: 443
    protocol: TCP
    listenAddress: "0.0.0.0"
EOF

echo "# Create a kubernetes secret containing the Root CA certificate and its key"
kubectl create ns cert-manager
kubectl create secret tls -n cert-manager ca-key-pair \
  --cert=.ssl/root-ca.pem \
  --key=.ssl/root-ca-key.pem

echo "# Deploy the certificate manager"
helm repo add jetstack https://charts.jetstack.io
helm install \
  cert-manager jetstack/cert-manager \
  --namespace cert-manager \
  --create-namespace \
  --set installCRDs=true

cat <<EOF | kubectl apply -f -
---
apiVersion: cert-manager.io/v1
kind: ClusterIssuer
metadata:
  name: ca-issuer
spec:
  ca:
    secretName: ca-key-pair
EOF
kubectl apply -f https://kind.sigs.k8s.io/examples/ingress/deploy-ingress-nginx.yaml

# kubectl apply -f sa.yml
# kubectl apply -f https://github.com/fluxcd/flux2/releases/latest/download/install.yaml
# export KUBERNETES_SERVICE_ACCOUNT_TOKEN=$(kubectl create token terminal-account --duration 24h)

# install capsule
helm install capsule oci://ghcr.io/projectcapsule/charts/capsule --version 0.7.0  -n capsule-system --create-namespace
# helm install capsule-proxy oci://ghcr.io/projectcapsule/charts/capsule-proxy -n capsule-system

kubectl wait --for=condition=Ready pod -n capsule-system  -l app.kubernetes.io/instance=capsule --timeout=100s

helm upgrade --install keycloak --wait --timeout 15m \
  --namespace keycloak --create-namespace \
  oci://registry-1.docker.io/bitnamicharts/keycloak \
  --reuse-values --values - <<EOF
auth:
  createAdminUser: true
  adminUser: admin
  adminPassword: admin
  managementUser: manager
  managementPassword: manager
proxy: edge # Needed to avoid https -> http redirect
ingress:
  enabled: true
  annotations:
    cert-manager.io/cluster-issuer: ca-issuer
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
  hostname: ${KEYCLOAK_HOSTNAME}
  ingressClassName: nginx
  tls: true
  extraTls:
  - hosts:
    - ${KEYCLOAK_HOSTNAME}
postgresql:
  enabled: true
  auth:
   username: admin
   password: admin
EOF


echo "Creating the keycloak terraform config file"
cat <<EOF > .tofurc
provider_installation {
  network_mirror {
    url = "https://terraform-mirror.yandexcloud.net/"
    include = ["registry.opentofu.org/*/*"]
  }
  direct {
    exclude = ["registry.opentofu.org/*/*"]
  }
}
EOF
cat <<'EOF' > keycloak.tf
terraform {
  required_providers {
    keycloak = {
      source  = "mrparkers/keycloak"
      version = ">=4.0.0"
    }
  }
}
# configure keycloak provider
provider "keycloak" {
  client_id                = "admin-cli"
  username                 = "admin"
  password                 = "admin"
  url                      = "https://KEYCLOAK_HOSTNAME"
  tls_insecure_skip_verify = true
}
locals {
  realm_id = "master"
  groups   = ["kube-dev", "projectcapsule.dev"]
  user_groups = {
    user   = ["kube-dev", "projectcapsule.dev"]
  }
}
# create groups
resource "keycloak_group" "groups" {
  for_each = toset(local.groups)
  realm_id = local.realm_id
  name     = each.key
}
# create users
resource "keycloak_user" "users" {
  for_each       = local.user_groups
  realm_id       = local.realm_id
  username       = each.key
  enabled        = true
  email          = "${each.key}@domain.com"
  email_verified = true
  first_name     = each.key
  last_name      = each.key
  initial_password {
    value = each.key
  }
}
# configure use groups membership
resource "keycloak_user_groups" "user_groups" {
  for_each  = local.user_groups
  realm_id  = local.realm_id
  user_id   = keycloak_user.users[each.key].id
  group_ids = [for g in each.value : keycloak_group.groups[g].id]
}
# create groups openid client scope
resource "keycloak_openid_client_scope" "groups" {
  realm_id               = local.realm_id
  name                   = "groups"
  include_in_token_scope = true
  gui_order              = 1
}
resource "keycloak_openid_group_membership_protocol_mapper" "groups" {
  realm_id        = local.realm_id
  client_scope_id = keycloak_openid_client_scope.groups.id
  name            = "groups"
  claim_name      = "groups"
  full_path       = false
}
# create kube openid client
resource "keycloak_openid_client" "kube" {
  realm_id                     = local.realm_id
  client_id                    = "kube"
  name                         = "kube"
  enabled                      = true
  access_type                  = "PUBLIC"
  valid_redirect_uris          = [
    "https://learnops.local/oauth/callback", 
    "https://learnops.local", 
    "http://localhost:8888/callback",
  ]
  standard_flow_enabled        = true
  implicit_flow_enabled        = false
  direct_access_grants_enabled = true
  access_token_lifespan = "1800"
}
# configure kube openid client default scopes
resource "keycloak_openid_client_default_scopes" "kube" {
  realm_id  = local.realm_id
  client_id = keycloak_openid_client.kube.id
  default_scopes = [
    "email",
    "profile",
    "openid",
    keycloak_openid_client_scope.groups.name,
  ]
}
EOF
sed -i.bak "s/KEYCLOAK_HOSTNAME/$KEYCLOAK_HOSTNAME/g" keycloak.tf
sed -i.bak "s/DOMAIN/$DOMAIN/g" keycloak.tf

echo "# Apply the terraform config"
TF_CLI_CONFIG_FILE=".tofurc" tofu init && tofu apply -auto-approve
kubectl label namespaces default trust=enabled
echo "# Setup platform"
kubectl apply -f ../deploy/cockroachdb-statefulset.yaml -f ../deploy/k8s

kubectl wait --for=condition=Ready pod -l app=api --timeout=30s

echo """
# Next steps

# Add cert to trust (MacOS)
sudo security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain .ssl/root-ca.pem

# Login as learnops-admin:learnops-admin
learnops login

# Upload courses
learnops upload -c courses/linux-basic/course.yml 
learnops upload -c demo/courses/git/course.yml

# Open https://learnops.local in private mode (or logout from keycloak learnops-admin)

# Login as user:user

# Assign course for user
learnops assign -u user -c linux-basic -c git-basic

# Done!
"""