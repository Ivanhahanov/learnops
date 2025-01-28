
---
title: Configuration
next: lectures
weight: 1
---

The course configuration is defined in YAML format. It defines the overall course structure, including modules, lectures, assignments, and tests.

## Course Structure

All course materials are stored as files organized into modules. Assignments are located in directories that are named accordingly.

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
  The name of the materials can be any.Identification is based on file extension.
{{< /callout >}}

## Course configuration
Example of course configuration
```yaml { filename="course.yml" }
title: "Course name"
name: my-course # Unique name 
description: "Course Short Description" # Short description of the course
category: "Example" # Course category
difficulty: "Beginner" # Course difficulty level
modules: 
  - title: "First module"
    name: module # Module directory name
    description: "Module Short Description"
    lectures: # List of module lectures
      - title: First lecture
        name: lecture # lecture name without .md
    tasks:
      - title: First task
        name: task # task directory name
    - title: First task
        name: task2
    quizzes: # List of module tests
      - title: First quiz
        name: quiz # test name without .yml
```


