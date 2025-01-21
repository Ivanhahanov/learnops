
# Дневника проекта

## Создаем файл
Добавьте файл в ваш проект:

```bash
$ echo "Hello, Git!" > diary.txt
```

## Отслеживание изменений
Теперь добавим файл в отслеживание:

```bash
$ git add diary.txt
$ git status
On branch master

No commits yet

Changes to be committed:
  (use "git rm --cached <file>..." to unstage)
        new file:   diary.txt
```

## Сохранение изменений
Сделаем первый коммит:

```bash
$ git commit -m "Добавлен файл diary.txt"
[master (root-commit) a1b2c3d] Добавлен файл diary.txt
 1 file changed, 1 insertion(+)
 create mode 100644 diary.txt
```

Теперь ваш дневник сохранен! Посмотрите историю изменений:

```bash
$ git log
commit a1b2c3d (HEAD -> master)
Author: Ваше Имя <ваш.email@example.com>
Date:   Mon Jan 21 10:00:00 2025 +0000

    Добавлен файл diary.txt
```
