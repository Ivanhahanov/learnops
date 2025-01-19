package tasks

import (
	"context"
	"fmt"
	"time"

	apiextensionsv1 "k8s.io/apiextensions-apiserver/pkg/apis/apiextensions/v1"

	helmv2 "github.com/fluxcd/helm-controller/api/v2"
	sourcev1 "github.com/fluxcd/source-controller/api/v1"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	ctrl "sigs.k8s.io/controller-runtime"
	"sigs.k8s.io/controller-runtime/pkg/client"
)

func generateRelease(name string) *helmv2.HelmRelease {
	return &helmv2.HelmRelease{
		ObjectMeta: metav1.ObjectMeta{
			Name:      "podinfo",
			Namespace: "default",
		},
		Spec: helmv2.HelmReleaseSpec{
			ReleaseName: "podinfo",
			Interval: metav1.Duration{
				Duration: 5 * time.Minute,
			},
			Chart: &helmv2.HelmChartTemplate{
				Spec: helmv2.HelmChartTemplateSpec{
					Chart:   "podinfo",
					Version: "6.5.*",
					SourceRef: helmv2.CrossNamespaceObjectReference{
						Kind: sourcev1.HelmRepositoryKind,
						Name: "podinfo",
					},
				},
			},
			Values: &apiextensionsv1.JSON{Raw: []byte(`{"service": {"type": "ClusterIP"}}`)},
		},
	}
}

func CreateHelmRelease() {
	scheme := runtime.NewScheme()
	_ = sourcev1.AddToScheme(scheme)
	_ = helmv2.AddToScheme(scheme)

	// init Kubernetes client
	kubeClient, err := client.New(ctrl.GetConfigOrDie(), client.Options{Scheme: scheme})
	if err != nil {
		panic(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	if err := kubeClient.Create(ctx, generateRelease("")); err != nil {
		fmt.Println(err)
	} else {
		fmt.Println("HelmRelease nginx created")
	}
}

func UninstallRelease() {
	scheme := runtime.NewScheme()
	_ = sourcev1.AddToScheme(scheme)
	_ = helmv2.AddToScheme(scheme)

	// init Kubernetes client
	kubeClient, err := client.New(ctrl.GetConfigOrDie(), client.Options{Scheme: scheme})
	if err != nil {
		panic(err)
	}
	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()
	if err := kubeClient.Delete(ctx, generateRelease("")); err != nil {
		fmt.Println(err)
	}
}
