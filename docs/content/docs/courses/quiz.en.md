---
title: Quizzes
prev: tasks
weight: 3
---
Tests are created in YAML format and consist of multiple-choice questions.
## Quiz structure

```yaml {filename=quiz.yml}
- type: choice
  text: What is the main ingredient in porridge?
  options:
    - option: Grains
      is_right: true
    - option: Salt
    - option: Water
    - option: Milk

- type: choice
  text: What should you do to avoid burning the pot?
  options:
    - option: Keep an eye on the stove
      is_right: true
    - option: Add more water
    - option: Cook on maximum heat
    - option: Leave the porridge cooking and walk away
```

{{< callout type="info" >}}
  The file must have the extension `.yml`.
{{< /callout >}}

## Field Description

- `type`: The type of question (e.g. `choice` to select one answer).
- `text`: The text of the question.
- `options`: List of answer choices.
  - `option`: The text of the option.
  - `is_right`: Indicates if this is the correct answer (mandatory for one choice).
