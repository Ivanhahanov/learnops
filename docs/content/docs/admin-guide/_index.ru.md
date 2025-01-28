---
title: Руководство Админа
prev: courses
next: cli
weight: 4
---
Here will be the Administrator's guide
## Installation
Installation with Helm Chart
```
helm install learnops oci://registry-1.docker.io/explabs/learnops
```
## Конфигурация
Настройка `values.yml`
```yaml
global:
  domain: "learnops.local"
  # cert-manager issuer name for tasks ingress
  ca_issuer: ca-issuer
  oidc:
    issuer: https://auth.learnops.local/realms/master
    client_id: kube
```

## OIDC Integration
Integration with different OIDC providers
{{< tabs items="Keycloak,Другой провайдер" >}}
{{< tab >}}
There will be a description here, but in the meantime you can see how Keycloak is configured in demo.sh
{{< /tab >}}
{{< tab >}}
We need to test, dex is not suitable, there are no groups there, but you can connect via LDAP, then it should work
{{< /tab >}}
{{< /tabs >}}

## Multi-tenancy
An important part of the platform is [Capsule](https://capsule.clastix.io/).

This provides network isolation, user permission management and resource limits.

