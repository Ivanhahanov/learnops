import TerminalComponent from "./Xterm";
import IDE from "./IDE";
import React from "react";
import { useState, useEffect, useContext, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/OAuthContext";
import { useTask } from "../context/TaskContext";
import FlowModal from "./FlowModal";


const Workspace = () => {
    const { user } = useAuth()
    const { taskInfo, startTask } = useTask()
    const { name } = useParams();
    const [sandboxUri, setSandboxUri] = useState(null); // URI для подключения
    const [sandboxStatus, setSandboxStatus] = useState("initial"); // initial, pending, ready, error

    const startSandbox = async (name) => {
        const response = await fetch(`/api/task/run/${name}`, {
            headers: {
                'Authorization': 'Bearer ' + String(user.id_token)
            }
        });
        if (!response.ok) {
            throw new Error("Failed to start sandbox");
        }
        return response.json(); // Например, { sandboxId: "12345" }
    };

    const launchSandbox = useCallback(async () => {
        setSandboxStatus("pending");
        try {
            const { uri, status } = await startSandbox(name);
            setSandboxUri(uri);
            //setSandboxStatus(status.toLowerCase());
        } catch (err) {
            console.log(err)
        }
    }, [name]);


    // Повторная проверка статуса, если песочница запущена

    useEffect(() => {
        if (taskInfo && taskInfo.name === name) {
            setSandboxUri(taskInfo.uri);
            setSandboxStatus(taskInfo.status)
            return
        } else {
            launchSandbox();
            // wait for task
            let schema = (location.protocol == "https:" ? "wss:" : "ws:")
            let uri = `${schema}//${location.host}/api/status/${name}?token=${user.id_token}`
            const socket = new WebSocket(uri);

            socket.onmessage = (e) => {
                const msg = JSON.parse(e.data)
                console.log("here", msg)
                startTask({
                    name: name,
                    link: `/task/${name}`,
                    expiredAt: Number(msg.expired_at), // 10 min
                    expiresIn: Number(msg.expired_at) - Math.floor(Date.now() / 1000),
                    startedAt: Math.floor(Date.now() / 1000),
                    uri: msg.uri,
                    status: msg.status
                });
                setSandboxUri(msg.uri);
                setSandboxStatus(msg.status)
                if (msg.status === "ready") {
                    socket.close();
                }
            };

            return () => {
                socket.close();
            };
        }
    }, []);

    const tabs = ["Terminal", "IDE"];
    const tabsComponents = {
        "Terminal": <TerminalComponent uri={sandboxUri} />,
        "IDE": <IDE />
    };

    const [active, setActive] = useState(tabs[0]);

    if (sandboxStatus !== "ready") {
        return (
            <div className="flex flex-col items-center justify-center h-[calc(100vh-5em)] skeleton">
                <span className="loading loading-spinner loading-lg"></span>
                <p>Loading the workspace</p>
                <p>{sandboxStatus}</p>
            </div>
        )
    }
    // If page is not in loading state, display page.
    else {
        const btnBaseClassName = "join-item btn btn-xs hover:bg-base-content hover:text-base-100"
        return (
            <>
                <div className="flex justify-between">
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
                    <FlowModal />
                </div>
                {tabsComponents[active]}
            </>
        );
    }

}
export default Workspace;