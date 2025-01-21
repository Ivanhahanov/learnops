# Создание веток

## Создайте ветку
Создайте новую ветку `my-branch`:

```bash
$ git branch my-branch
$ git checkout my-branch
```

## Добавьте изменения
Измените файл и сохраните изменения:

```bash
$ echo "Branching is fun!" >> diary.txt
$ git commit -am "Добавлено сообщение о ветках"
```

## Объедините изменения
Вернитесь в ветку `master` и объедините изменения:

```bash
$ git checkout master
$ git merge my-branch
```