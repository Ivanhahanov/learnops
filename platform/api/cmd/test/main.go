package main

import (
	"context"
	"fmt"
	"log"
	"platform/pkg/client"
	"strings"

	"k8s.io/apimachinery/pkg/api/meta"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/types"
	"k8s.io/apimachinery/pkg/util/yaml"
	"k8s.io/client-go/discovery"
	"k8s.io/client-go/dynamic"
)

// getGVR получает GroupVersionResource (GVR) из Kind, используя Discovery API.
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

	return schema.GroupVersionResource{}, fmt.Errorf("не удалось найти GVR для %s", gvk.Kind)
}

// applyManifest применяет YAML-манифест в Kubernetes.
func applyManifest(manifest string) error {
	// Загружаем kubeconfig
	c := client.Init("")

	// Создаем dynamic client
	dynClient, err := dynamic.NewForConfig(c.AdminConfig)
	if err != nil {
		return fmt.Errorf("ошибка создания клиента: %v", err)
	}

	// Создаем Discovery API клиент
	discoveryClient, err := discovery.NewDiscoveryClientForConfig(c.AdminConfig)
	if err != nil {
		return fmt.Errorf("ошибка создания discovery клиента: %v", err)
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
			fmt.Printf("❌ Ошибка поиска GVR для %s: %v\n", gvk.Kind, err)
			continue
		}

		// Определяем namespace (если пустой — default)
		namespace := obj.GetNamespace()
		if namespace == "" {
			namespace = "default"
		}
		// Проверяем, существует ли ресурс
		_, err = dynClient.Resource(gvr).Namespace(namespace).Get(context.TODO(), obj.GetName(), metav1.GetOptions{})
		if err == nil {
			// Если ресурс уже есть — обновляем (patch)
			patchData, _ := obj.MarshalJSON()
			_, err = dynClient.Resource(gvr).Namespace(namespace).Patch(context.TODO(), obj.GetName(), types.MergePatchType, patchData, metav1.PatchOptions{})
			if err != nil {
				fmt.Printf("❌ Ошибка обновления %s/%s: %v\n", gvr.Resource, obj.GetName(), err)
			} else {
				fmt.Printf("✅ Обновлен ресурс: %s/%s\n", gvr.Resource, obj.GetName())
			}
		} else {
			// Если ресурса нет — создаем
			_, err = dynClient.Resource(gvr).Namespace(namespace).Create(context.TODO(), obj, metav1.CreateOptions{})
			if err != nil {
				fmt.Printf("❌ Ошибка создания %s/%s: %v\n", gvr.Resource, obj.GetName(), err)
			} else {
				fmt.Printf("create: %s/%s\n", gvr.Resource, obj.GetName())
			}
		}
	}
	return nil
}

func main() {
	// Принимаем путь к файлу как аргумент
	manifests := `
apiVersion: kro.run/v1alpha1
kind: Gitea
metadata:
  name: my-gitea
spec:
  name: gitea
  ingress:
    enabled: true
    suffix: user-task
---
apiVersion: kro.run/v1alpha1
kind: App
metadata:
  name: my-app
spec:
  name: app
  user: user
  task: task
  ingress:
    enabled: true
`
	if err := applyManifest(manifests); err != nil {
		log.Fatalf("Ошибка: %v", err)
	}
}
