package main

import (
	"fmt"
	"os"
	"path"
	"platform/pkg/models"

	"sigs.k8s.io/yaml"
)

const (
	taskText       = "task.md"
	validateScript = "validate.sh"
	hints          = "hint.md"
)

type Config struct {
	Courses []models.Course `yaml:"courses"`
}

// type Course struct {
// 	Name        string  `yaml:"name"`
// 	Description string  `yaml:"description"`
// 	Id          string  `yaml:"id"`
// 	Tasks       []*Task `yaml:"tasks"`
// 	ConfigMap   *corev1.ConfigMap
// }

// type Task struct {
// 	Name        string `yaml:"name"`
// 	Description string `yaml:"description"`
// 	Id          string `yaml:"id"`
// 	ConfigMap   *corev1.ConfigMap
// }

func ParseConfig(path string) *Config {
	var config Config
	yamlFile, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}

	err = yaml.Unmarshal(yamlFile, &config)
	if err != nil {
		panic(err)
	}
	return &config
}

// func (c *Config) GenConfigMaps(base string) {
// 	for _, course := range c.Courses {
// 		course.genConfigMap()
// 		for _, task := range course.Tasks {
// 			task.genConfigMap(base, course.Id)
// 		}
// 	}
// }
// func (c *Course) genConfigMap() error {
// 	cmData := map[string]string{
// 		"name":        c.Name,
// 		"description": c.Description,
// 	}

// 	c.ConfigMap = &corev1.ConfigMap{
// 		TypeMeta: metav1.TypeMeta{
// 			Kind:       "ConfigMap",
// 			APIVersion: "v1",
// 		},
// 		ObjectMeta: metav1.ObjectMeta{
// 			Name: c.Id,
// 			// Namespace: "my-namespace",
// 			Labels: map[string]string{
// 				"type": "course",
// 			},
// 		},
// 		Data: cmData,
// 	}
// 	return nil
// }

// func (t *Task) genConfigMap(basePath, courseId string) error {
// 	basePath = path.Join(basePath, courseId, t.Id)
// 	cmData := map[string]string{
// 		"name":         t.Name,
// 		"description":  t.Description,
// 		taskText:       getTaskText(basePath),
// 		validateScript: getTaskValidationScript(basePath),
// 	}

// 	t.ConfigMap = &corev1.ConfigMap{
// 		TypeMeta: metav1.TypeMeta{
// 			Kind:       "ConfigMap",
// 			APIVersion: "v1",
// 		},
// 		ObjectMeta: metav1.ObjectMeta{
// 			Name: t.Id,
// 			// Namespace: "my-namespace",
// 			Labels: map[string]string{
// 				"course": courseId,
// 				"type":   "task",
// 			},
// 		},
// 		Data: cmData,
// 	}
// 	return nil
// }

func getTaskText(base string) string {
	return readFile(path.Join(base, taskText))
}
func getLectureText(base string) string {
	return readFile(fmt.Sprintf("%s.md", base))
}
func getTaskValidationScript(base string) string {
	return readFile(path.Join(base, validateScript))
}
func getTaskHints() string { return "" }

func readFile(path string) string {
	data, err := os.ReadFile(path)
	if err != nil {
		panic(err)
	}
	return string(data)
}

// func (c *Config) SaveManifests(base string) {
// 	for _, course := range c.Courses {
// 		course.toFile(base)
// 		for _, task := range course.Tasks {
// 			task.toFile(base)
// 		}
// 	}
// }

// func (t *Task) toFile(base string) {
// 	data, err := yaml.Marshal(t.ConfigMap)
// 	if err != nil {
// 		panic(err)
// 	}
// 	fullname := fmt.Sprintf("%s.yml", path.Join(base, t.Id))
// 	err = os.WriteFile(fullname, data, os.ModePerm)
// 	if err != nil {
// 		panic(err)
// 	}
// }

// func (c *Course) toFile(base string) {
// 	data, err := yaml.Marshal(c.ConfigMap)
// 	if err != nil {
// 		panic(err)
// 	}
// 	fullname := fmt.Sprintf("%s.yml", path.Join(base, c.Id))
// 	err = os.WriteFile(fullname, data, fs.ModePerm)
// 	if err != nil {
// 		panic(err)
// 	}
// }
