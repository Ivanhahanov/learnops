import React from "react";
import { useTask } from "../context/TaskContext";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/OAuthContext";


const TaskStatusIndicator = () => {
    const { taskInfo, stopTask } = useTask();
    const { user } = useAuth()
    const handleStop = async () => {
        fetch(`/api/task/stop/${taskInfo.id}`, {
            headers: {
                'Authorization': `Bearer ${user.id_token}`
            }
        })
            .then((res) => res.text())
            .then((data) => {
                stopTask()
                console.log(data);
            })
            .catch((err) => {
                console.log(err.message);
            });
    };
    const formatTime = (seconds) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
      
        let formattedTime = '';
        if (hours > 0) {
          formattedTime += `${hours}h`;
        }
        if (minutes > 0) {
          formattedTime += `${minutes}m`;
        }
      
        return formattedTime || '0m';
      }
    let navigate = useNavigate();
    const routeChange = () => {
        navigate(taskInfo.link);
    }
    return (
        <>
            {taskInfo &&
                <ul class="menu p-0 bg-base-100 menu-horizontal rounded-lg mx-2">
                    <li>
                        <a onClick={routeChange}>
                            <span className={`badge badge-xs ${taskInfo.status === 'ready' ? 'badge-success' :
                                taskInfo.status === 'pending' ? 'badge-warning' :
                                    'badge-error'
                                }`}></span>
                            <svg
                                role="img"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                className="h-5 w-5"
                                fill="none"
                            >
                                <g

                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                >
                                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                                    <path d="m3.3 7l8.7 5l8.7-5M12 22V12" />
                                </g>
                            </svg>
                            {taskInfo.name}
                            <svg
                                role="img"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 384 512"
                                className="h-4 w-4"
                                fill="currentColor"
                            >
                                <path
                                    d="M32 0C14.3 0 0 14.3 0 32s14.3 32 32 32v11c0 42.4 16.9 83.1 46.9 113.1l67.8 67.9l-67.8 67.9C48.9 353.9 32 394.6 32 437v11c-17.7 0-32 14.3-32 32s14.3 32 32 32h320c17.7 0 32-14.3 32-32s-14.3-32-32-32v-11c0-42.4-16.9-83.1-46.9-113.1L237.3 256l67.9-67.9c30-30 46.9-70.7 46.9-113.1V64c17.7 0 32-14.3 32-32s-14.3-32-32-32H64zm64 75V64h192v11c0 19-5.6 37.4-16 53H112c-10.3-15.6-16-34-16-53m16 309c3.5-5.3 7.6-10.3 12.1-14.9l67.9-67.8l67.9 67.9c4.6 4.6 8.6 9.6 12.1 14.9H112z"
                                />
                            </svg>
                            {formatTime(taskInfo.expiresIn)}
                        </a>
                    </li>
                    <li>
                        <a className="p-2" onClick={handleStop}>
                            <svg
                                role="img"
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 512 512"
                                className="h-5 w-5 fill-error"
                            >
                                <path

                                    d="M288 32c0-17.7-14.3-32-32-32s-32 14.3-32 32v224c0 17.7 14.3 32 32 32s32-14.3 32-32zm-144.5 88.6c13.6-11.3 15.4-31.5 4.1-45.1s-31.5-15.4-45.1-4.1C49.7 115.4 16 181.8 16 256c0 132.5 107.5 240 240 240s240-107.5 240-240c0-74.2-33.8-140.6-86.6-184.6c-13.6-11.3-33.8-9.4-45.1 4.1s-9.4 33.8 4.1 45.1c38.9 32.3 63.5 81 63.5 135.4c0 97.2-78.8 176-176 176s-176-78.8-176-176c0-54.4 24.7-103.1 63.5-135.4z"
                                />
                            </svg>
                        </a>
                    </li>
                </ul>
            }
        </>
    );
};

export default TaskStatusIndicator;