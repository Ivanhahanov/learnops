
---
title: Конфигурация
next: lectures
weight: 1
---

Конфигурация курса задается в формате YAML. Она определяет общую структуру курса, включая модули, лекции, задания и тесты.

## Структура курса

Все материалы курса хранятся в виде файлов объединённых в модули. Задания находятся в директориях с соответствующим названием.
{{< filetree/container >}}
    {{< filetree/folder name="my-course" >}}
        {{< filetree/folder name="module" >}}
            {{< filetree/folder name="task" >}}
                {{< filetree/file name="README.md" >}}
                {{< filetree/file name="validation.sh" >}}
            {{< /filetree/folder >}}
            {{< filetree/folder name="task2" state="closed" >}}
                {{< filetree/file name="README.md" >}}
                {{< filetree/file name="validation.sh" >}}
            {{< /filetree/folder >}}
            {{< filetree/file name="lecture.md" >}}
            {{< filetree/file name="quiz.yml" >}}
        {{< /filetree/folder >}}
        {{< filetree/folder name="module2" state="closed" >}}
            {{< filetree/folder name="task" >}}
                {{< filetree/file name="README.md" >}}
                {{< filetree/file name="validation.sh" >}}
            {{< /filetree/folder >}}
            {{< filetree/file name="lecture.md" >}}
            {{< filetree/file name="quiz.yml" >}}
        {{< /filetree/folder >}}
        {{< filetree/file name="course.yml" >}}
    {{< /filetree/folder >}}
{{< /filetree/container >}}

{{< callout type="info" >}}
  Название материалов могут быть любыми. Идентификация основана на расширении файлов.
{{< /callout >}}

## Конфигурация курса
Пример конфигурации курса
```yaml { filename="course.yml" }
title: "Название курса"
name: my-course # Уникальное имя 
description: "Короткое описание курса" # Краткое описание курса
category: "Example" # Категория курса
difficulty: "Beginner" # Уровень сложности курса
modules: 
  - title: "Первый модуль"
    name: module # Имя директории модуля
    description: "Короткое описание модуля"
    lectures: # Список лекций модуля
      - title: Первая лекция
        name: lecture # имя лекции без .md
    tasks:
      - title: Первое задание
        name: task # имя директории задания
    - title: Первое задание
        name: task2
    quizzes: # Список тестов модуля
      - title: Первый тест
        name: quiz # имя теста без .yml
```


