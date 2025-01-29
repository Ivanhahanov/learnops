package provider

import (
	"context"
	"fmt"
	"log"
	k8s_client "platform/pkg/client"
	"platform/pkg/config"
	"platform/pkg/utils"
	"time"

	capsulev1beta2 "github.com/projectcapsule/capsule/api/v1beta2"
	corev1 "k8s.io/api/core/v1"
	networkingv1 "k8s.io/api/networking/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/util/intstr"
	"k8s.io/client-go/kubernetes"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type Capsule struct {
	Tenant    string
	User      string
	Client    client.Client
	ClientSet *kubernetes.Clientset
}

func InitCapsule(tenant, user, token string) *Capsule {
	var err error
	// init capsule struct
	capsule := &Capsule{
		Tenant: tenant,
		User:   user,
	}

	scheme := runtime.NewScheme()
	_ = capsulev1beta2.AddToScheme(scheme)
	_ = corev1.AddToScheme(scheme)
	capsule.Client, err = client.New(ctrl.GetConfigOrDie(), client.Options{Scheme: scheme})
	if err != nil {
		log.Fatalf("Ошибка создания клиента Capsule: %v", err)
	}
	if token != "" {
		c := k8s_client.Init(token)
		capsule.ClientSet = c.UserClient
	}
	return capsule
}

func (capsule *Capsule) createTenant() error {
	var quota int32 = 2
	tenant := &capsulev1beta2.Tenant{
		ObjectMeta: metav1.ObjectMeta{
			Name: capsule.Tenant,
		},
		Spec: capsulev1beta2.TenantSpec{
			Owners: capsulev1beta2.OwnerListSpec{
				capsulev1beta2.OwnerSpec{Name: capsule.User, Kind: "User"},
			},
			NamespaceOptions: &capsulev1beta2.NamespaceOptions{
				Quota: &quota,
			},
		},
	}
	if err := capsule.Client.Create(context.TODO(), tenant); err != nil {
		return err
	}
	return nil
}

func (capsule *Capsule) createNamespace() error {
	namespace := &corev1.Namespace{
		ObjectMeta: metav1.ObjectMeta{
			Name: capsule.Tenant,
		},
	}
	if _, err := capsule.ClientSet.CoreV1().Namespaces().Create(context.TODO(), namespace, metav1.CreateOptions{}); err != nil {
		return err
	}
	return nil
}

func (capsule *Capsule) runTerminal() error {
	// if local
	arg := []string{
		// fmt.Sprintf("--path-xtermjs=/xterm.js", capsule.User),
		fmt.Sprintf("--allowed-hostnames=%s", utils.GenHostName("terminal", capsule.Tenant, capsule.User)),
	}
	pod := &corev1.Pod{
		ObjectMeta: metav1.ObjectMeta{
			Annotations: map[string]string{
				"learnops/description": "You're here",
			},
			Name:      "terminal",
			Namespace: capsule.Tenant,
			Labels: map[string]string{
				"app": "terminal",
			},
		},
		Spec: corev1.PodSpec{
			Containers: []corev1.Container{
				{
					Name:  "terminal",
					Image: "explabs/terminal-agent",
					Args:  arg,
				},
			},
		},
	}

	if _, err := capsule.ClientSet.CoreV1().Pods(capsule.Tenant).Create(context.TODO(), pod, metav1.CreateOptions{}); err != nil {
		return err
	}
	return nil
}

func (capsule *Capsule) createService() error {
	service := &corev1.Service{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "terminal",
			Namespace: capsule.Tenant,
		},
		Spec: corev1.ServiceSpec{
			Selector: map[string]string{
				"app": "terminal",
			},
			Ports: []corev1.ServicePort{
				{
					Port:       8376,
					TargetPort: intstr.IntOrString{IntVal: 8376},
				},
			},
		},
	}
	if _, err := capsule.ClientSet.CoreV1().Services(capsule.Tenant).Create(context.TODO(), service, metav1.CreateOptions{}); err != nil {
		return err
	}
	return nil
}

func (capsule *Capsule) createIngress() error {
	//pathType := networkingv1.PathTypePrefix
	pathType := networkingv1.PathTypeImplementationSpecific
	//pathType := networkingv1.PathTypeExact
	annotations := map[string]string{
		"nginx.ingress.kubernetes.io/proxy-read-timeout": "3600",
		"nginx.ingress.kubernetes.io/proxy-send-timeout": "3600",
		"cert-manager.io/cluster-issuer":                 config.GetConfig().CAIssuer,
	}
	host := utils.GenHostName("terminal", capsule.Tenant, capsule.User)
	path := "/xterm.js"
	ingressClass := "nginx"

	ingress := &networkingv1.Ingress{
		ObjectMeta: metav1.ObjectMeta{
			Name:        "terminal",
			Namespace:   capsule.Tenant,
			Annotations: annotations,
		},
		Spec: networkingv1.IngressSpec{
			IngressClassName: &ingressClass,
			Rules: []networkingv1.IngressRule{
				{
					Host: host,
					IngressRuleValue: networkingv1.IngressRuleValue{
						HTTP: &networkingv1.HTTPIngressRuleValue{
							Paths: []networkingv1.HTTPIngressPath{
								{
									Path:     path,
									PathType: &pathType,
									Backend: networkingv1.IngressBackend{
										Service: &networkingv1.IngressServiceBackend{
											Name: "terminal",
											Port: networkingv1.ServiceBackendPort{
												Number: 8376,
											},
										},
									},
								},
							},
						},
					},
				},
			},
			TLS: []networkingv1.IngressTLS{
				{
					Hosts:      []string{host},
					SecretName: "terminal-tls",
				},
			},
		},
	}

	if _, err := capsule.ClientSet.NetworkingV1().Ingresses(capsule.Tenant).Create(context.TODO(), ingress, metav1.CreateOptions{}); err != nil {
		return err
	}
	return nil
}

func (capsule *Capsule) Deploy() error {
	if err := capsule.createTenant(); err != nil {
		return fmt.Errorf("create tenant err: %v", err)
	}
	err := capsule.WaitForTenantActive(5 * time.Second)
	if err != nil {
		return fmt.Errorf("wait for tenant state active err: %v", err)
	}
	if err := capsule.createNamespace(); err != nil {
		return fmt.Errorf("create namespace err: %v", err)
	}
	err = capsule.WaitForNamespaceInTenant(capsule.Tenant, 5*time.Second)
	if err != nil {
		return fmt.Errorf("wait for namespace in tenant err: %v", err)
	}
	if err := capsule.runTerminal(); err != nil {
		return fmt.Errorf("run terminal err: %v", err)
	}
	if err := capsule.createService(); err != nil {
		return fmt.Errorf("create service err: %v", err)
	}
	if err := capsule.createIngress(); err != nil {
		return fmt.Errorf("create ingress err:  %v", err)
	}
	return nil
}

func (capsule *Capsule) deleteTenant() error {
	tenant := &capsulev1beta2.Tenant{
		ObjectMeta: metav1.ObjectMeta{
			Name: capsule.Tenant,
		},
	}
	if err := capsule.Client.Delete(context.TODO(), tenant); err != nil {
		return err
	}
	return nil
}

func (capsule *Capsule) Destroy() error {
	if err := capsule.deleteTenant(); err != nil {
		return err
	}
	return nil
}

func (capsule *Capsule) List() (*capsulev1beta2.TenantList, error) {
	tenants := &capsulev1beta2.TenantList{}
	err := capsule.Client.List(context.Background(), tenants)
	if err != nil {
		return nil, fmt.Errorf("failed to list tenants: %v", err)
	}
	return tenants, nil
}

func (capsule *Capsule) WaitForNamespaceInTenant(namespace string, timeout time.Duration) error {

	var tenant capsulev1beta2.Tenant
	tenantKey := client.ObjectKey{Name: capsule.Tenant}

	// Устанавливаем контекст с таймаутом
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	// Начинаем цикл ожидания
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return fmt.Errorf("timeout exceeded while waiting for namespace '%s' in tenant '%s'", namespace, capsule.Tenant)
		case <-ticker.C:
			// Получаем Tenant из кластера
			err := capsule.Client.Get(ctx, tenantKey, &tenant)
			if err != nil {
				return fmt.Errorf("failed to get tenant '%s': %v", capsule.Tenant, err)
			}

			// Проверяем, появился ли ожидаемый namespace
			for _, ns := range tenant.Status.Namespaces {
				if ns == namespace {
					return nil
				}
			}
		}
	}
}

func (capsule *Capsule) WaitForTenantActive(timeout time.Duration) error {

	var tenant capsulev1beta2.Tenant
	tenantKey := client.ObjectKey{Name: capsule.Tenant}

	// Устанавливаем контекст с таймаутом
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	// Начинаем цикл ожидания
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return fmt.Errorf("timeout exceeded while waiting for tenant '%s'", capsule.Tenant)
		case <-ticker.C:
			// Получаем Tenant из кластера
			err := capsule.Client.Get(ctx, tenantKey, &tenant)
			if err != nil {
				return fmt.Errorf("failed to get tenant '%s': %v", capsule.Tenant, err)
			}
			if tenant.Status.State == "Active" {
				return nil
			}
		}
	}
}
