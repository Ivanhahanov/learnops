
# Работа с удаленным репозиторием

## Клонируйте репозиторий
Склонируйте репозиторий по адресу `https://github.com/example/remote-repo.git`:

```bash
$ git clone https://github.com/example/remote-repo.git
```

## Отправьте изменения
Добавьте файл `collaboration.txt`:

```bash
$ echo "Working together!" > collaboration.txt
$ git add collaboration.txt
$ git commit -m "Добавлен файл collaboration.txt"
$ git push origin master
```