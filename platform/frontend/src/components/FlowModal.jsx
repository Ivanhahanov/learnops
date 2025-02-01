import React, { useEffect, useRef, useState } from 'react';
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

                if (reactFlowWrapper.current) {
                    const { clientWidth, clientHeight } = reactFlowWrapper.current;
                    const centerX = clientWidth / 2;
                    const centerY = clientHeight / 2;
                    const radius = 250; // Радиус окружности

                    const newNodes = enrichedNodes.map((node, index) => {
                        if (index === 0) {
                            return {
                                ...node,
                                position: { x: centerX, y: centerY }, // Центр для первого узла
                            };
                        } else {
                            // Размещаем остальные по кругу
                            const angle = ((index - 1) / (enrichedNodes.length - 1)) * 2 * Math.PI;
                            return {
                                ...node,
                                position: {
                                    x: centerX + radius * Math.cos(angle),
                                    y: centerY + radius * Math.sin(angle),
                                },
                            };
                        }
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