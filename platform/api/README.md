## Upload Task Description
```
kubectl create cm task --from-file test/task.md \
    --from-literal=name="[Docker] First Steps" \
    --from-literal=description="Example task for beginners in docker and container technology"
kubectl label cm task "platform=task"
```

```
kubectl create cm task-ghost-train --from-file test/welcome/task.md \
    --from-literal=name="[Welcome] Поезд призрак" \
    --from-literal=description="Чтобы охотится на призраков поможет bash"
kubectl label cm task-ghost-train "platform=task"
```