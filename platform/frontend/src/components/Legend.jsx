import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { atomDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import 'font-awesome/css/font-awesome.min.css';
import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import "../index.css"
import { useAuth } from '../context/OAuthContext'
import { useTask } from '../context/TaskContext'
import confetti from "canvas-confetti";

const Legend = () => {
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
        fetch(`/api/task/stop/${name}`, {
            headers: {
                'Authorization': 'Bearer ' + String(user.id_token)
            }
        })
            .then((res) => res.text())
            .then((data) => {
                stopTask()
                console.log(data);
                navigate(-1, { state: { message: "message" },  replace: true });
            })
            .catch((err) => {
                console.log(err.message);
            });
    };

    const Pre = ({ children }) => <pre className="blog-pre relative p-0">
        <CodeCopyBtn>{children}</CodeCopyBtn>
        {children}
    </pre>



    return (
        <div className="bg-base-200 shadow p-2 rounded-xl overflow-y-auto h-[calc(100vh-5rem)]">
            <ReactMarkdown
                className='prose pt-3 mx-auto'
                //linkTarget='_blank'
                //rehypePlugins={[rehypeHighlight]}
                remarkPlugins={[remarkGfm]}
                components={{
                    pre: Pre,
                    code({ node, inline, className = "code", children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '')
                        return !inline && match ? (
                            <SyntaxHighlighter
                                language={match[1]}
                                style={atomDark}
                                customStyle={{ backgroundColor: "var(--tw-prose-pre-bg)" }}
                                className="bg-base"
                                PreTag="div"
                                {...props}
                            >
                                {String(children).replace(/\n$/, '')}
                            </SyntaxHighlighter>
                        ) : (
                            <code className={className} {...props}>
                                {children}
                            </code>
                        )
                    }
                }}
            >
                {text}
            </ReactMarkdown>

            <div className="divider px-4"></div>
            <div className="pb-3 px-4 flex justify-between w-full">
                <VerifyButton name={name} user={user} />
                <button onClick={() => handleSubmit()} className="btn btn-sm btn-outline btn-error">Close Session</button>
            </div>
        </div>
    )
}

function VerifyButton({ name, user }) {
    const [verifyStatus, setVerifyStatus] = useState(null);
    const [alertMessage, setAlertMessage] = useState("");

    const verifyChallenge = async () => {
        try {
            const response = await fetch(`/api/task/verify/${name}`, {
                headers: {
                    Authorization: `Bearer ${user.id_token}`,
                },
            });

            const data = await response.json(); // Предполагается, что ответ в формате JSON
            console.log(data);

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
        <div>
            {verifyStatus === "success" ? (
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
                <div
                    role="alert"
                    className="alert alert-warning shadow-lg fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-1/3"
                >
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
                </div>
            )}
        </div>
    );
}


function CodeCopyBtn({ children }) {
    const [copyOk, setCopyOk] = React.useState(false);

    const iconColor = copyOk ? 'oklch(var(--su))' : 'oklch(var(--bc))';
    const icon = copyOk ? 'fa-check' : 'fa-copy';

    const handleClick = (e) => {
        navigator.clipboard.writeText(children.props.children);
        setCopyOk(true);
        setTimeout(() => {
            setCopyOk(false);
        }, 1000);
    }

    return (
        <div className="code-copy-btn">
            <i className={`fa ${icon}`} onClick={e => handleClick(e)} style={{ color: iconColor }} />
        </div>
    )
}

export default Legend;