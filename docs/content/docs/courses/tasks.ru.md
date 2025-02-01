---
title: Задания
prev: lectures
next: quiz
weight: 4
---

## Написание заданий

Задания представляют собой директорию, содержащую:

1. `README.md` — описание задания.
2. `manifest.yml` — k8s манифесты для развёртывания.
3. `validation.sh` — скрипт для автоматической проверки решения.

### Пример структуры задания

```
tasks/
└── init-repo/
    ├── README.md
    ├── manifest.yml
    └── validation.sh
```

### Пример `README.md`

```markdown
# Первая инициализация репозитория

## Задача

1. Создайте новый пустой репозиторий с помощью команды `git init`.
2. Создайте файл `README.md` с текстом "Hello, Git!".
3. Добавьте файл в индекс и зафиксируйте изменения с комментарием "Initial commit".

## Критерии выполнения

- Репозиторий инициализирован.
- Файл `README.md` добавлен и зафиксирован в истории.
- Комментарий коммита: "Initial commit".
```
### Пример `manifest.yml`
```yaml
apiVersion: kro.run/v1alpha1
kind: Terminal
metadata:
  name: users-terminal
spec:
  name: terminal

---
apiVersion: kro.run/v1alpha1
kind: Gitea
metadata:
  name: users-gitea
spec:
  name: gitea
  ingress:
    enabled: true
```
Для описания заданий рекомендуется использовать [kro](https://kro.run/).
{{< cards >}}
  {{< card link="../../admin-guide/kro" title="Шаблоны заданий" icon="cog" >}}
{{< /cards >}}


### Пример `validation.sh`

```bash
#!/bin/bash

# Проверка, что репозиторий инициализирован
if [ ! -d ".git" ]; then
  echo "Репозиторий не инициализирован"
  exit 1
fi

# Проверка наличия файла README.md
if [ ! -f "README.md" ]; then
  echo "Файл README.md не найден"
  exit 1
fi

# Проверка содержимого файла README.md
if ! grep -q "Hello, Git!" "README.md"; then
  echo "Неверное содержимое README.md"
  exit 1
fi

# Проверка истории коммитов
if ! git log --oneline | grep -q "Initial commit"; then
  echo "Коммит с сообщением 'Initial commit' не найден"
  exit 1
fi

echo "Задание выполнено успешно!"
exit 0
```