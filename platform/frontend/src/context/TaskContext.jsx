import React, { createContext, useContext, useState, useEffect } from "react";

// Создаём контекст
const TaskContext = createContext();

// Провайдер контекста
export const TaskProvider = ({ children }) => {
    const loadTaskFromStorage = () => {
        const storedTask = localStorage.getItem("currentTask");
        if (storedTask) {
            const task = JSON.parse(storedTask);
            const remainingTime = task.expiredAt - Math.floor(Date.now() / 1000)
            if (remainingTime > 0) {
                return { ...task, expiresIn: remainingTime };
            }
        }
        return null;
    };

    const [taskInfo, setTaskInfo] = useState(loadTaskFromStorage);


    useEffect(() => {
        if (taskInfo) {
            localStorage.setItem("currentTask", JSON.stringify(taskInfo));
        } else {
            localStorage.removeItem("currentTask");
        }
    }, [taskInfo]);

    useEffect(() => {
        if (!taskInfo || !taskInfo.expiresIn) return;

        const timer = setInterval(() => {
            setTaskInfo((prev) => {
                if (!prev) return null;
                const newExpiresIn = prev.expiresIn - 1;
                return newExpiresIn > 0
                    ? { ...prev, expiresIn: newExpiresIn }
                    : null;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [taskInfo]);
    // Обновить информацию о задании
    const startTask = (task) => setTaskInfo(task);

    // Остановить задание
    const stopTask = () => setTaskInfo(null);

    // Объект, который будет доступен глобально
    const value = {
        taskInfo,
        startTask,
        stopTask,
    };

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

// Хук для удобного использования контекста
export const useTask = () => useContext(TaskContext);