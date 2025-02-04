package provider

import (
	"context"
	"fmt"
	"log"
	k8s_client "platform/pkg/client"
	"platform/pkg/database"
	"strings"
	"time"

	capsulev1beta2 "github.com/projectcapsule/capsule/api/v1beta2"
	corev1 "k8s.io/api/core/v1"
	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/util/yaml"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

type Capsule struct {
	User         *database.User
	Namespace    string
	Client       client.Client
	ClientSet    *kubernetes.Clientset
	ClientConfig *rest.Config
}

func InitCapsule(user *database.User, token string) *Capsule {
	var err error
	var capsule = &Capsule{}

	if user != nil {
		// init capsule struct
		capsule = &Capsule{
			User:      user,
			Namespace: user.ID.String(),
		}
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
		capsule.ClientConfig = c.UserConfig
	}
	return capsule
}

func (capsule *Capsule) createTenant() error {
	var quota int32 = 2
	tenant := &capsulev1beta2.Tenant{
		ObjectMeta: metav1.ObjectMeta{
			Name: capsule.User.ID.String(),
		},
		Spec: capsulev1beta2.TenantSpec{
			Owners: capsulev1beta2.OwnerListSpec{
				capsulev1beta2.OwnerSpec{
					Name: capsule.User.Name,
					Kind: "User",
					ClusterRoles: []string{
						"tenant-admin",
					},
				},
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
			Name: capsule.Namespace,
		},
	}
	if _, err := capsule.ClientSet.CoreV1().Namespaces().Create(context.TODO(), namespace, metav1.CreateOptions{}); err != nil {
		return err
	}
	return nil
}

func getGVR(discoveryClient discovery.DiscoveryInterface, gvk schema.GroupVersionKind) (schema.GroupVersionResource, error) {
	// Получаем список всех API-ресурсов
	apiResourceList, err := discoveryClient.ServerPreferredResources()
	if err != nil {
		if meta.IsNoMatchError(err) {
			return schema.GroupVersionResource{}, fmt.Errorf("ресурс %s не найден в API", gvk.Kind)
		}
		return schema.GroupVersionResource{}, err
	}

	// Перебираем ресурсы, ищем нужный Kind
	for _, apiGroup := range apiResourceList {
		gv, err := schema.ParseGroupVersion(apiGroup.GroupVersion)
		if err != nil {
			continue
		}

		for _, resource := range apiGroup.APIResources {
			if resource.Kind == gvk.Kind {
				return schema.GroupVersionResource{
					Group:    gv.Group,
					Version:  gv.Version,
					Resource: resource.Name,
				}, nil
			}
		}
	}

	return schema.GroupVersionResource{}, fmt.Errorf("cant'find gvr %s", gvk.Kind)
}

func (capsule *Capsule) runManifest(manifest string) error {
	// Создаем dynamic client
	dynClient, err := dynamic.NewForConfig(capsule.ClientConfig)
	if err != nil {
		return fmt.Errorf("can't create client: %v", err)
	}

	// Создаем Discovery API клиент
	discoveryClient, err := discovery.NewDiscoveryClientForConfig(capsule.ClientConfig)
	if err != nil {
		return fmt.Errorf("can't create discovery client: %v", err)
	}

	// Разделяем файл на отдельные манифесты
	yamlDecoder := yaml.NewYAMLOrJSONDecoder(strings.NewReader(manifest), 4096)

	for {
		obj := &unstructured.Unstructured{}
		err = yamlDecoder.Decode(obj)
		if err != nil {
			break // конец файла
		}

		// Получаем GVK объекта
		gvk := obj.GroupVersionKind()

		// Получаем GVR (динамически через Discovery API)
		gvr, err := getGVR(discoveryClient, gvk)
		if err != nil {
			log.Printf("can't find %s: %v\n", gvk.Kind, err)
			continue
		}

		// Проверяем, существует ли ресурс
		_, err = dynClient.Resource(gvr).Namespace(capsule.Namespace).Get(context.TODO(), obj.GetName(), metav1.GetOptions{})
		if err == nil {
			// Если ресурс уже есть — обновляем (patch)
			patchData, _ := obj.MarshalJSON()
			_, err = dynClient.Resource(gvr).Namespace(capsule.Namespace).Patch(context.TODO(), obj.GetName(), types.MergePatchType, patchData, metav1.PatchOptions{})
			if err != nil {
				log.Printf("update error %s/%s: %v\n", gvr.Resource, obj.GetName(), err)
			} else {
				log.Printf("success update: %s/%s\n", gvr.Resource, obj.GetName())
			}
		} else {
			// Если ресурса нет — создаем
			_, err = dynClient.Resource(gvr).Namespace(capsule.Namespace).Create(context.TODO(), obj, metav1.CreateOptions{})
			if err != nil {
				fmt.Printf("create error %s/%s: %v\n", gvr.Resource, obj.GetName(), err)
			} else {
				log.Printf("success create: %s/%s\n", gvr.Resource, obj.GetName())
			}
		}
	}
	return nil
}

func (capsule *Capsule) Deploy(manifest string) error {
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
	err = capsule.WaitForNamespaceInTenant(capsule.Namespace, 5*time.Second)
	if err != nil {
		return fmt.Errorf("wait for namespace in tenant err: %v", err)
	}
	if err := capsule.runManifest(manifest); err != nil {
		return fmt.Errorf("deploy err: %v", err)
	}
	return nil
}

func (capsule *Capsule) deleteTenant(name string) error {
	tenant := &capsulev1beta2.Tenant{
		ObjectMeta: metav1.ObjectMeta{
			Name: name,
		},
	}
	if err := capsule.Client.Delete(context.TODO(), tenant); err != nil {
		return err
	}
	return nil
}

func (capsule *Capsule) Destroy(name string) error {
	if err := capsule.deleteTenant(name); err != nil {
		return err
	}
	return nil
}

func (capsule *Capsule) TenantList() (*capsulev1beta2.TenantList, error) {
	tenants := &capsulev1beta2.TenantList{}
	err := capsule.Client.List(context.Background(), tenants)
	if err != nil {
		return nil, fmt.Errorf("failed to list tenants: %v", err)
	}
	return tenants, nil
}

func (capsule *Capsule) WaitForNamespaceInTenant(namespace string, timeout time.Duration) error {

	var tenant capsulev1beta2.Tenant
	tenantKey := client.ObjectKey{Name: capsule.User.ID.String()}

	// Устанавливаем контекст с таймаутом
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	// Начинаем цикл ожидания
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return fmt.Errorf("timeout exceeded while waiting for namespace '%s' in tenant '%s'", namespace, capsule.User.ID.String())
		case <-ticker.C:
			// Получаем Tenant из кластера
			err := capsule.Client.Get(ctx, tenantKey, &tenant)
			if err != nil {
				return fmt.Errorf("failed to get tenant '%s': %v", capsule.User.ID.String(), err)
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
	tenantKey := client.ObjectKey{Name: capsule.User.ID.String()}

	// Устанавливаем контекст с таймаутом
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	// Начинаем цикл ожидания
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-ctx.Done():
			return fmt.Errorf("timeout exceeded while waiting for tenant '%s'", capsule.User.ID.String())
		case <-ticker.C:
			// Получаем Tenant из кластера
			err := capsule.Client.Get(ctx, tenantKey, &tenant)
			if err != nil {
				return fmt.Errorf("failed to get tenant '%s': %v", capsule.User.ID.String(), err)
			}
			if tenant.Status.State == "Active" {
				return nil
			}
		}
	}
}
