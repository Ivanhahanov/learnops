import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTask } from '../context/TaskContext';


function TaskAlert({ isOpen, onClose, message }) {
    if (!isOpen) return null;
    return (
        <div className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg">Предупреждение</h3>
                <p className="py-4">
                    {message}
                </p>
                <div className="modal-action">
                    <button onClick={onClose} className="btn btn-primary">
                        OK
                    </button>
                </div>
            </div>
        </div>
    )
}


function TaskLink({ id, name, children, ...props }) {
    const { taskInfo, stopTask } = useTask()

    const navigate = useNavigate();
    const [isAlertOpen, setIsAlertOpen] = useState(false);

    const closeAlert = () => {
        setIsAlertOpen(false); // Закрываем alert
    };

    const handleClick = (e) => {
        if (taskInfo && taskInfo.id != id) {
            e.preventDefault(); // Отменяем переход
            setIsAlertOpen(true);
        } else {
            navigate(to); // Выполняем переход
        }
    };
    return (
        <>
            <Link to={`/task/${name}`} onClick={handleClick} {...props}>
                {children}
            </Link>
            <TaskAlert
                isOpen={isAlertOpen}
                onClose={closeAlert}
                message={`Вы уже выполняете задание ${taskInfo?.name}! Завершите его, чтобы перейти к другому.`}
            />
        </>
    );
}

export default TaskLink