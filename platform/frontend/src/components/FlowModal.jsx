import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
    ReactFlow,
    ReactFlowProvider,
    Controls,
    Background,
    useNodesState,
    useReactFlow,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import ServiceCard from '../components/ServiceCard';
import { useAuth } from '../context/OAuthContext';
import { useParams } from 'react-router-dom';


const CustomNode = ({ data }) => {
    return (
        <ServiceCard service={data} />
    );
};


const nodeTypes = { custom: CustomNode };

const initialNodes = [
    { id: "2", type: "custom", data: { name: "Kubernetes", description: "Типо прод", active: true, } }, {
        id: "3", type: "custom", data: {
            name: "Gitlab",
            description: "Здесь лежат исходники",
            ingress: [
                { name: "Gitlab", url: "http://ingress" }
            ],
            auth: {
                username: "admin",
                password: "admin",
            },
            active: true,
        }
    },
    { id: "1", type: "custom", data: { name: "Terminal", description: "Вы здесь", active: true } },

    { id: "4", type: "custom", data: { name: "Registry", description: "Здесь лежат образы", active: true, } },


];

const FlowChart = () => {
    return (
        <ReactFlowProvider>
            <InnerFlow />
        </ReactFlowProvider>
    );
};

const InnerFlow = () => {
    const { user } = useAuth()
    const { name } = useParams()
    const reactFlowWrapper = useRef(null);
    const { fitView } = useReactFlow();
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [rawNodes, setRawNodes] = useNodesState([]);

    useEffect(() => {
        async function fetchAndArrangeNodes() {
            try {
                const response = await fetch(`/api/task/map/${name}`, {
                    headers: {
                        'Authorization': 'Bearer ' + user.id_token
                    }
                }) // Замените на ваш API
                const data = await response.json();
                const enrichedNodes = data.map((data, index) => ({
                    id: String(index + 1),
                    type: "custom",
                    data: data

                }));
                setRawNodes(enrichedNodes)


                if (reactFlowWrapper.current) {
                    const { clientWidth, clientHeight } = reactFlowWrapper.current;

                    const centerX = clientWidth / 2;
                    const centerY = clientHeight / 2;
                    const radius = 200;

                    const newNodes = enrichedNodes.map((node, index) => {
                        const angle = (index / enrichedNodes.length) * 2 * Math.PI;
                        return {
                            ...node,
                            position: {
                                x: centerX + radius * Math.cos(angle) - 50,
                                y: centerY + radius * Math.sin(angle) - 25,
                            },
                        };
                    });

                    setNodes(newNodes);
                    setTimeout(() => fitView(), 100);
                }
            } catch (error) {
                console.error("Ошибка при загрузке данных:", error);
            }
        }
        fetchAndArrangeNodes();
    }, []);

    const styles = {
        background: 'bg-base-100',
    };

    return (
        <div ref={reactFlowWrapper} style={{ width: "100%", height: "100%" }}>
            <ReactFlow
                nodes={nodes}
                onNodesChange={onNodesChange}
                nodeTypes={nodeTypes}>
                <Background />
                <Controls />
            </ReactFlow>
        </div>
    );
};



const FlowModal = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-1 pr-3">
            <button
                className="btn btn-xs btn-info"
                onClick={() => setIsModalOpen(true)}
            >
                Service Map
            </button>

            {isModalOpen && (
                <div className="modal modal-open">
                    <div className="modal-box w-11/12 max-w-5xl h-5/6 flex flex-col">
                        <h2 className="text-xl font-bold mb-4">Карта инфраструктуры</h2>

                        <FlowChart />
                        <button className="absolute top-2 right-2 btn btn-gray-300 btn-sm btn-circle btn-outline" onClick={() => setIsModalOpen(false)}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-6 w-6"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor">
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FlowModal;