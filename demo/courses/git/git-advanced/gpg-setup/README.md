# Задание: Настройка GPG подписи

1. Сгенерируй новый GPG-ключ:
```bash
gpg --full-generate-key
```

2. Посмотри список своих секретных ключей и скопируй ID:
```bash
gpg --list-secret-keys --keyid-format LONG
```

3. Привяжи ключ к Git:
```bash
git config --global user.signingkey <ID_ключа>
```

4. Создай новый файл `signed.txt`, добавь в него текст "Этот коммит подписан!".
5. Сделай подписанный коммит:
```bash
git add signed.txt
git commit -S -m "Добавил подписанный коммит"
```

6. Убедись, что подпись отображается:
```bash
git log --show-signature
```

**Проверка:**
Подпись должна отображаться в истории коммитов.