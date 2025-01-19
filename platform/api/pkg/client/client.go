package client

import (
	"path/filepath"
	"platform/pkg/utils"

	"k8s.io/client-go/kubernetes"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
	"k8s.io/client-go/util/homedir"
)

type Client struct {
	UserConfig  *rest.Config
	AdminConfig *rest.Config
	UserClient  *kubernetes.Clientset
	AdminClient *kubernetes.Clientset
}

func Init(clientToken string) *Client {
	var client Client
	var err error
	if utils.IsRunningInCluster() {
		client.AdminConfig, err = rest.InClusterConfig()
		if err != nil {
			panic(err.Error())
		}
	} else {
		kubeconfig := filepath.Join(homedir.HomeDir(), ".kube", "config")
		client.AdminConfig, err = clientcmd.BuildConfigFromFlags("", kubeconfig)
		if err != nil {
			panic(err)
		}
	}
	// creates the clientset
	client.AdminClient, err = kubernetes.NewForConfig(client.AdminConfig)
	if err != nil {
		panic(err.Error())
	}

	config := &rest.Config{
		Host:        client.AdminConfig.Host,
		BearerToken: clientToken,
	}

	if utils.IsRunningInCluster() {
		config.CAFile = "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
	} else {
		config.TLSClientConfig = rest.TLSClientConfig{
			CAData: config.CAData,
		}
	}
	client.UserConfig = config
	client.UserClient, err = kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	return &client
}
