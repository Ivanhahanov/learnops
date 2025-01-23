import ReactMarkdown from 'react-markdown'
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { a11yDark, dark, atomDark, materialDark } from 'react-syntax-highlighter/dist/cjs/styles/prism'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import 'font-awesome/css/font-awesome.min.css';


import { useState, useEffect, useContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import React from 'react'
import "../index.css"
import { useAuth } from '../context/OAuthContext'
import { useTask } from '../context/TaskContext'

const Legend = () => {
    const {name} = useParams()
    const {user} = useAuth()
    const [text, setText] = useState(String);
    const {stopTask} = useTask()
    useEffect(() => {
        fetch(`/api/task/readme/${name}`, {
            headers: {
                'Authorization': 'Bearer ' + String(user.id_token)
            }
        })
            .then((res) => res.text())
            .then((data) => {
                console.log(data);
                setText(data);
            })
            .catch((err) => {
                console.log(err.message);
            });
    }, []);
    const navigate = useNavigate();

    const handleSubmit = async () => {
        fetch(`/api/task/stop/${name}`,{
            headers: {
                'Authorization': 'Bearer ' + String(user.id_token)
            }
        })
            .then((res) => res.text())
            .then((data) => {
                stopTask()
                console.log(data);
                navigate(-1);
            })
            .catch((err) => {
                console.log(err.message);
            });
    };

    const [verifyStatus, setVerifyStatus] = useState(String);

    const verifyChallenge = async () => {
        fetch(`/api/task/verify/${name}`,{
            headers: {
                'Authorization': 'Bearer ' + String(user.id_token)
            }
        })
            .then((res) => res.text())
            .then((data) => {
                console.log(data);
                setVerifyStatus(data);
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
            <div className="pb-3 pr-4 place-self-end">
                <VerifyButton verifyStatus={verifyStatus} verifyChallenge={verifyChallenge} />
                    <button onClick={() => handleSubmit()} className="btn btn-sm btn-outline btn-error">Close Session</button>
            </div>
        </div>
    )
}

function VerifyButton({ verifyStatus, verifyChallenge }) {
    if (verifyStatus != "") {
        return <button className="btn btn-sm btn-success mx-2">Success!</button>
    }
    return <button className="btn btn-sm btn-outline btn-success mx-2" onClick={verifyChallenge}>Verify Challenge</button>
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