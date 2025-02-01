import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import '@xterm/xterm/css/xterm.css'


const TerminalComponent = ({ uri }) => {
  const terminalRef = useRef(null);
  const wsRef = useRef(null);        // WebSocket
  const fitAddonRef = useRef(null);  // FitAddon
  const reconnectAttempts = useRef(0);
  const maxRetries = 5;
  const retryDelay = 1000;
  const isUnmounted = useRef(false);
  const [isConnected, setIsConnected] = useState(false);

  const connectWebSocket = () => {
    if (!uri || reconnectAttempts.current >= maxRetries || isUnmounted.current) return;

    const schema = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${schema}://${uri}`;

    console.log(`try to reconnect ${reconnectAttempts.current + 1}/${maxRetries} to ${wsUrl}`);

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log("websocket connected");
      setIsConnected(true);
      reconnectAttempts.current = 0;

      const terminal = new Terminal({
        cursorBlink: true,
        cursorStyle: "block",
        fontSize: 14,
      });

      const fitAddon = new FitAddon();
      terminal.loadAddon(fitAddon);
      fitAddonRef.current = fitAddon;

      terminal.open(terminalRef.current);
      fitAddon.fit();

      const attachAddon = new AttachAddon(ws);
      terminal.loadAddon(attachAddon);
    };

    ws.onclose = () => {
      console.log("websocket closed");
      setIsConnected(false);

      if (reconnectAttempts.current < maxRetries && !isUnmounted.current) {
        reconnectAttempts.current += 1;
        setTimeout(connectWebSocket, retryDelay);
      }
    };

    ws.onerror = () => {
      console.log("websocket error");
    };
  };

  useEffect(() => {
    isUnmounted.current = false; // Сбрасываем флаг при монтировании
    connectWebSocket();

    return () => {
      isUnmounted.current = true; // Фиксируем, что компонент размонтирован
      wsRef.current?.close();
    };
  }, [uri]);




  return (
    <div className="card bg-black p-2 rounded-xl">
      <div className="h-[calc(100vh-8rem)] overflow-y-auto" ref={terminalRef}></div>
    </div>
  );
}

export default TerminalComponent;
