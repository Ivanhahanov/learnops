import TerminalComponent from "./Xterm";
import IDE from "./IDE";
import React from "react";
import { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";
import { useAuth } from "../context/OAuthContext";





const Workspace = () => {
    const {user} = useAuth()
    const { id } = useParams();
    const [sandboxUri, setSandboxUri] = useState(null); // URI для подключения
    const [sandboxStatus, setSandboxStatus] = useState("initial"); // initial, pending, ready, error

    const [error, setError] = useState(null);

    const startSandbox = async (taskId) => {
        const response = await fetch(`/api/task/run/${taskId}`, {
            headers: {
                'Authorization': 'Bearer ' + String(user.id_token)
            }
        });
        if (!response.ok) {
            throw new Error("Failed to start sandbox");
        }
        return response.json(); // Например, { sandboxId: "12345" }
    };

    const checkSandboxStatus = async (taskId) => {
        // Запрашиваем статус песочницы
        const response = await fetch(`/api/task/status/${taskId}`, {
            headers: {
                'Authorization': 'Bearer ' + String(user.id_token)
            }
        });
        if (!response.ok) {
            throw new Error("Failed to check sandbox status");
        }
        return response.json(); // Например, { status: "ready" }
    };



    // Функция проверки статуса песочницы
    const checkStatus = useCallback(async () => {
        setError(null);
        try {
            const { uri, status } = await checkSandboxStatus(id);
            setSandboxUri(uri);
            const normalizedStatus = status.toLowerCase();
            setSandboxStatus(normalizedStatus);
            return normalizedStatus; // Возвращаем статус для синхронной проверки
        } catch (err) {
            setError("Ошибка проверки статуса песочницы");
            setSandboxStatus("error");
        }
    }, [id]);

    const launchSandbox = useCallback(async () => {
        setError(null);
        setSandboxStatus("pending");
        try {
            const { uri, status } = await startSandbox(id);
            setSandboxUri(uri);
            setSandboxStatus(status.toLowerCase());
        } catch (err) {
            setError("Ошибка запуска песочницы");
            setSandboxStatus("error");
        }
    }, [id]);

    // // Основной эффект: сначала проверяем статус, затем запускаем при необходимости
    useEffect(() => {
        const initializeSandbox = async () => {
            const status = await checkStatus();
            if (status !== "ready") {
                launchSandbox();
            }
        };
        initializeSandbox();
    }, []);

    // Повторная проверка статуса, если песочница запущена

    useEffect(() => {
        if (sandboxStatus != "ready") {
            const interval = setInterval(async () => {
                const status = await checkStatus();
                if (status === "ready") {
                    clearInterval(interval);
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [sandboxStatus, checkStatus]);

    // If page is in loading state, display
    // loading message. Modify it as per your
    // requirement.

    const tabs = ["Terminal", "IDE"];
    const tabsComponents = {
        "Terminal": <TerminalComponent id={id} uri={sandboxUri} />,
        "IDE": <IDE />
    };

    const [active, setActive] = useState(tabs[0]);

    if (sandboxStatus != "ready") {
        return (
            <div className="flex flex-col items-center justify-center h-full skeleton">
                <span className="loading loading-spinner loading-lg"></span>
                <p>Loading the workspace</p>
                <p>{sandboxStatus}</p>
            </div>
        )
    }
    // If page is not in loading state, display page.
    else {
        // return (
        //     <div role="tablist" className="tabs tabs-lifted tabs-xs">
        //         <input type="radio" name="my_tabs_1" checked="checked" role="tab" className="tab" aria-label="Terminal" />
        //         <div role="tabpanel" className="tab-content">
        //             <TerminalComponent
        //                 id={id}
        //             />
        //         </div>
        //         <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="IDE" />
        //         <div role="tabpanel" className="tab-content">
        //             <IDE />
        //         </div>
        //     </div>
        // );
        const btnBaseClassName = "join-item btn btn-xs hover:bg-base-content hover:text-base-100"
        return (
            <>
                <div className="join p-1 pl-3">
                    {tabs.map((type) => (
                        <div
                            className={active === type ? `${btnBaseClassName} bg-base-content text-base-100` : btnBaseClassName}
                            active={active === type}
                            onClick={() => setActive(type)}
                        >
                            {type}
                        </div>
                    ))}
                </div>
                {tabsComponents[active]}
            </>
        );
    }

}
export default Workspace;