import React, { useState } from "react";
import { RefreshCw, ExternalLink, Lock, Eye, EyeOff } from "lucide-react";

const ServiceCard = ({ service }) => {
    const [loading, setLoading] = useState(false);
    const [authVisible, setAuthVisible] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    const handleRestart = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 2000);
    };

    return (
        <div className="p-4 max-w-md bg-base-100 shadow-lg rounded-xl border relative">
            <button
                className="absolute top-1 right-1 text-gray-500 hover:text-gray-800"
                onClick={handleRestart}
                disabled={loading}
            >
                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            </button>

            <div className="flex pr-10">
                <h2 className="text-xl font-bold">{service.name}</h2>

                <div className="px-1">
                    <span className={`badge badge-xs ${service.status == "Running" ? 'badge-success' : 'badge-error'}`} />
                    <div className="absolute left-1/2 transform -translate-x-1/2 mt-2 hidden group-hover:block bg-gray-700 text-white text-xs rounded p-1">
                        {service.active ? "Активен" : "Отключен"}
                    </div>
                </div>
            </div>

            <p className="text-gray-500">{service.description}</p>

            {service.auth && (
                <div className="dropdown border rounded-md mt-3">
                    <button
                        className="flex p-2"
                        onClick={() => setAuthOpen(!authOpen)}
                    >
                        <span className="flex items-center gap-2 px-1"><Lock size={16} />Авторизация
                        </span>
                        <span>{authOpen ? "▲" : "▼"}</span>
                    </button>
                    {authOpen && (
                        <div className="p-2">
                            {service.auth?.map((row, index) => (
                                <div key={index} className="">
                                    <p className="label">{row.name}</p>
                                    <label className="input input-bordered flex items-center gap-2">
                                        <input
                                            readOnly
                                            type={authVisible ? "text" : "password"}
                                            value={row.value}
                                        />
                                    </label>

                                </div>

                            ))}
                            <button className="absolute top-2 p-1 right-2" onClick={() => setAuthVisible(!authVisible)}>
                                {authVisible ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    )}
                </div>
            )}

            {service.ingress && (
                <div className="mt-3">
                    {service.ingress.map(({ name, url }) => (
                        <a key={name} href={url} target="_blank" rel="noopener noreferrer" className="block mb-2">
                            <button className="w-full flex items-center justify-center gap-2 bg-blue-500 text-white p-2 rounded">
                                <ExternalLink size={16} /> {name}
                            </button>
                        </a>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ServiceCard;
