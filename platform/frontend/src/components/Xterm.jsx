import React, { useEffect, useRef, useState } from 'react';
import { Terminal } from '@xterm/xterm';
import { AttachAddon } from '@xterm/addon-attach'
import { FitAddon } from '@xterm/addon-fit'
import { WebglAddon } from '@xterm/addon-webgl'
import '@xterm/xterm/css/xterm.css'


const TerminalComponent = ({ uri }) => {
  const [webSocket, setWebSocket] = useState(null); // Хранит объект WebSocket
  const [error, setError] = useState(null); // Хранит ошибку подключения
  const [isConnected, setIsConnected] = useState(false); // Статус подключения
  const timeoutRef = useRef(null); // Сохраняем таймер
  const terminalRef = useRef(null);

  const timeout = 10000; // 5 секунд

  useEffect(() => {


    const ws = new WebSocket(uri);

    // Обработчик успешного подключения
    ws.onopen = () => {
      clearTimeout(timeoutRef.current); // Очищаем таймер
      setWebSocket(ws);
      setIsConnected(true);
      const attachAddon = new AttachAddon(ws);
      const fitAddon = new FitAddon();
      const webglAddon = new WebglAddon();
      const terminal = new Terminal({
        cursorBlink: "block",
        // theme: { background: "dimgrey", cursor: "magenta", selectionBackground: "red" },
        cursorStyle: "block",
        // rows: 47,
        // cols: 118,
      });
      // Todo: 
      // add this commands on start terminal
      // stty rows 49
      // stty cols 119


      terminal.loadAddon(fitAddon);
      terminal.loadAddon(webglAddon);
      terminal.loadAddon(attachAddon);
      terminal.open(terminalRef.current);

      fitAddon.fit();
    };

    // Обработчик ошибок
    ws.onerror = (err) => {
      clearTimeout(timeoutRef.current); // Очищаем таймер
      setError("WebSocket error occurred");
    };

    // Обработчик закрытия
    ws.onclose = () => {
      clearTimeout(timeoutRef.current);
      if (!isConnected) {
        setError("WebSocket connection was closed before it was established");
      }
    };

    // Очистка при размонтировании компонента
    return () => {
      clearTimeout(timeoutRef.current);
      if (ws) {
        ws.close();
      }
    };
  }, [uri, timeout]);


  return (
    <div className="card bg-black p-2 rounded-xl">
      <div className="h-[calc(100vh-8rem)] overflow-y-auto" ref={terminalRef}></div>
    </div>
  );
}

export default TerminalComponent;
