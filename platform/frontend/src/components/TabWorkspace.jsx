import TerminalComponent from "./Xterm";
import IDE from "./IDE";
import React from "react";
import { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import AuthContext from "../context/AuthContext";


const TabWorkspace = () => {
    const [status, setStatus] = useState();
    const { authTokens, logoutUser } = useContext(AuthContext);
    const { id } = useParams();

    useEffect(() => {
        const interval = setInterval(function start() {
            fetch(`/api/task/status/${id}`, {
                headers: {
                    'Authorization': 'Bearer ' + String(authTokens.access)
                }
            })
                .then((res) => res.text())
                .then((status) => {
                    setStatus(status);
                    if (status === "Running") {
                        clearInterval(interval); // optional poll deactivation
                    } else if (status === "") {
                        const url = `${import.meta.env.VITE_API_URL}/task/run/${id}`
                        fetch(url)
                            .then((res) => res.text())
                            .then((data) => {
                                console.log(data);
                            })
                            .catch((err) => {
                                console.log(err.message);
                            });
                    }
                });
            return start;
        }(), 1000);
    });

    // If page is in loading state, display
    // loading message. Modify it as per your
    // requirement.

    if (status != "Running") {
        return (
            <div className="flex flex-col items-center justify-center h-full skeleton">
                <span className="loading loading-spinner loading-lg"></span>
                <p>Loading the workspace</p>
            </div>
        )
    }
    // If page is not in loading state, display page.
    else {
        return (
            <div role="tablist" className="tabs tabs-lifted tabs-xs">
                <input type="radio" name="my_tabs_1" checked="checked" role="tab" className="tab" aria-label="Terminal" />
                <div role="tabpanel" className="tab-content">
                    <TerminalComponent
                        id={id}
                    />
                </div>
                <input type="radio" name="my_tabs_1" role="tab" className="tab" aria-label="IDE" />
                <div role="tabpanel" className="tab-content">
                    <IDE />
                </div>
            </div>
        );
    }

}
export default TabWorkspace;