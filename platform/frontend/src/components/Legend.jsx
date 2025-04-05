import React from 'react'
import ReactMarkdown from 'react-markdown'
import { createPortal } from 'react-dom';
import 'font-awesome/css/font-awesome.min.css';
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import "../index.css"
import { useAuth } from '../context/OAuthContext'
import { useTask } from '../context/TaskContext'
import confetti from "canvas-confetti";
import { MdClose, MdOutlineKeyboardArrowUp } from 'react-icons/md';
import { FiCopy, FiCheck } from 'react-icons/fi';


const Pre = ({ children }) => (
    <div className="relative ">
        <pre className="font-mono text-sm p-4 pr-12 rounded-lg overflow-x-auto bg-neutral text-neutral-content">
            {children}
        </pre>
        <CodeCopyBtn>{children}</CodeCopyBtn>
    </div>
);

function CodeCopyBtn({ children }) {
    const [copyOk, setCopyOk] = useState(false);

    const handleClick = () => {
        navigator.clipboard.writeText(children.props.children);
        setCopyOk(true);
        setTimeout(() => setCopyOk(false), 1000);
    };

    return (
        <button
            onClick={handleClick}
            className="absolute right-4 top-4 rounded-md bg-neutral/70 hover:bg-neutral/90 
               transition-all shadow-sm border border-neutral/50 text-neutral-content"
            aria-label="Copy code"
        >
            {copyOk ? (
                <FiCheck className="text-success text-base" />
            ) : (
                <FiCopy className="text-base-content text-base" />
            )}
        </button>
    );
}
const Legend = ({ onClose, isMobile }) => {
    const { name } = useParams()
    const { user } = useAuth()
    const [text, setText] = useState(String);
    const { stopTask } = useTask()
    useEffect(() => {
        fetch(`/api/task/readme/${name}`, {
            headers: {
                'Authorization': 'Bearer ' + String(user.id_token)
            }
        })
            .then((res) => res.text())
            .then((data) => {
                setText(data);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, []);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        fetch("/api/task/stop", {
            headers: {
                'Authorization': 'Bearer ' + String(user.id_token)
            }
        })
            .then((res) => res.text())
            .then((data) => {
                stopTask()
                console.log(data);
                navigate(-1, { state: { message: "message" }, replace: true });
            })
            .catch((err) => {
                console.log(err.message);
            });
    };

    return (
        <div className="h-full flex flex-col bg-base-100">
            <div className="overflow-y-auto p-4 flex-1">
                <div className="max-w-3xl mx-auto prose prose-sm md:prose-lg"> {/* Добавлен контейнер с ограничением ширины */}
                    <ReactMarkdown
                        components={{
                            pre: Pre,
                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold mb-4 mt-2 text-primary" {...props} />,
                            h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mb-3 mt-4 text-secondary" {...props} />,
                            p: ({ node, ...props }) => <p className="leading-relaxed text-base-content/90 text-base mb-3" {...props} />,
                            ul: ({ node, ...props }) => <ul className="pl-6 mb-4 list-disc space-y-1" {...props} />,
                            ol: ({ node, ...props }) => <ol className="pl-6 mb-4 list-decimal space-y-1" {...props} />
                        }}
                    >

                        {text}
                    </ReactMarkdown>
                </div>
            </div>

            {/* Fixed Bottom Bar */}
            <div className="sticky bottom-0 bg-base-100 border-t border-base-200 p-4 shadow-lg">
                <div className="flex gap-2 items-center min-h-[1rem]" >
                    <VerifyButton name={name} user={user} />

                    <button
                        onClick={handleSubmit}
                        className="btn btn-error btn-sm gap-2"
                    >
                        {/* <MdClose className="" /> */}
                        <span>Close Session</span>
                    </button>

                    {isMobile && (
                        <button
                            onClick={onClose}
                            className="btn btn-ghost btn-square btn-sm"
                            aria-label="Hide legend"
                        >
                            <MdOutlineKeyboardArrowUp className="text-xl" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function VerifyButton({ name, user }) {
    const [verifyStatus, setVerifyStatus] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");
    const [loading, setLoading] = useState(false)
    const verifyChallenge = async () => {
        setLoading(true)
        try {
            const response = await fetch(`/api/task/verify/${name}`, {
                headers: {
                    Authorization: `Bearer ${user.id_token}`,
                },
            });

            const data = await response.json();
            setLoading(false)
            if (data.status === "success") {
                setVerifyStatus("success");
                setAlertMessage("");
                confetti({
                    particleCount: 100,
                    spread: 70,
                    origin: { y: 0.6 }
                });
            } else if (data.status === "failed") {
                setAlertMessage(data.answer || "Verification failed.");
                setVerifyStatus("failed");
            }
        } catch (error) {
            console.error("Error verifying challenge:", error.message);
            setAlertMessage("An error occurred while verifying.");
        }
    };

    // Для автоматического скрытия алерта через несколько секунд
    useEffect(() => {
        if (alertMessage) {
            const timer = setTimeout(() => {
                setAlertMessage(""); // Скрыть alert через 5 секунд
            }, 5000); // 5000 миллисекунд = 5 секунд

            return () => clearTimeout(timer); // Очистить таймер, если компонент размонтируется
        }
    }, [alertMessage]);

    return (
        <div className='flex-1'>
            {loading ? (
                <button className="btn btn-sm btn-outline btn-success mx-2" disabled>
                    Checking...
                </button>
            ) : verifyStatus === "success" ? (
                <button className="btn btn-sm btn-success mx-2">Success!</button>
            ) : (
                <button
                    className="btn btn-sm btn-outline btn-success mx-2"
                    onClick={verifyChallenge}
                >
                    Verify Challenge
                </button>
            )}

            {/* Alert */}
            {alertMessage && (
                <AlertPortal>
                    <div className="flex items-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current flex-shrink-0 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M13 16h-1v-4h-1m0-4h.01M12 19a7 7 0 110-14 7 7 0 010 14z"
                            />
                        </svg>
                        <span>{alertMessage}</span>
                    </div>
                </AlertPortal>
            )}
        </div>
    );
}

export default Legend;


const AlertPortal = ({ children }) => {
    return createPortal(
        <div className="alert alert-warning shadow-lg fixed top-4 left-0 md:left-1/2 w-full md:w-1/3 md:transform md:-translate-x-1/2 z-50" role="alert">
            {children}
        </div>,
        document.body
    );
};