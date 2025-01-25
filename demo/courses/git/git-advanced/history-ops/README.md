# Задание: Сложные операции с историей

1. Создай новую ветку `history-test`:
   ```bash
   git checkout -b history-test
   ```

2. Добавь файл `test1.txt` с текстом "Первый тест" и сделай коммит:
   ```bash
   echo "Первый тест" > test1.txt
   git add test1.txt
   git commit -m "Добавил test1.txt"
   ```

3. Добавь файл `test2.txt` с текстом "Второй тест" и сделай коммит:
   ```bash
   echo "Второй тест" > test2.txt
   git add test2.txt
   git commit -m "Добавил test2.txt"
   ```

4. Переключись на ветку `main` и выполни rebase:
   ```bash
   git checkout main
   git rebase history-test
   ```

5. Теперь выбери только второй коммит для ветки `new-feature`:
   ```bash
   git checkout -b new-feature
   git cherry-pick <хэш_второго_коммита>
   ```

6. Убедись, что файл `test2.txt` появился в новой ветке, но `test1.txt` отсутствует:
   ```bash
   ls
   ```

**Проверка:**
В ветке `new-feature` должен быть только `test2.txt`.