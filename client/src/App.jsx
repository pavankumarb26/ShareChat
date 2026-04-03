import { useEffect, useState } from "react";
import Home from "./pages/Home.jsx";
import Chat from "./components/Chat.jsx";
import socket, { parseRoomJoined } from "./socket";

const SESSION_KEY = "chat_websocket_session";

function loadSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw);
    if (o && typeof o.room === "string" && typeof o.name === "string") return o;
  } catch {
    /* ignore */
  }
  return null;
}

function saveSession(room, name) {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ room, name }));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const [room, setRoom] = useState(null);
  const [name, setName] = useState("");
  const [initialMessages, setInitialMessages] = useState([]);
  const [restoring, setRestoring] = useState(() => !!loadSession());

  const handleRoomJoined = ({ roomId, messages, name: displayName }) => {
    setName(displayName);
    setRoom(roomId);
    setInitialMessages(messages ?? []);
    saveSession(roomId, displayName);
  };

  useEffect(() => {
    const onConnect = () => console.log("Socket connected:", socket.id);
    const onErr = (err) => console.log("Socket error:", err.message);
    socket.on("connect", onConnect);
    socket.on("connect_error", onErr);
    return () => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onErr);
    };
  }, []);

  useEffect(() => {
    const saved = loadSession();
    if (!saved) return;

    function onErr() {
      socket.off("room-joined", onJoined);
      socket.off("error-message", onErr);
      clearSession();
      setRestoring(false);
    }

    function onJoined(payload) {
      socket.off("room-joined", onJoined);
      socket.off("error-message", onErr);
      const { roomId, messages } = parseRoomJoined(payload);
      setName(saved.name);
      setRoom(roomId);
      setInitialMessages(messages);
      saveSession(roomId, saved.name);
      setRestoring(false);
    }

    socket.on("room-joined", onJoined);
    socket.on("error-message", onErr);

    const join = () => {
      socket.emit("join-room", { password: saved.room, name: saved.name });
    };

    const onSocketConnect = () => {
      socket.off("connect", onSocketConnect);
      join();
    };

    if (socket.connected) join();
    else socket.on("connect", onSocketConnect);

    return () => {
      socket.off("connect", onSocketConnect);
      socket.off("room-joined", onJoined);
      socket.off("error-message", onErr);
    };
  }, []);

  if (restoring) {
    return (
      <div style={{ padding: 24 }}>
        <p>Restoring your chat…</p>
      </div>
    );
  }

  if (!room) {
    return <Home onRoomJoined={handleRoomJoined} />;
  }

  return (
    <Chat
      key={room}
      room={room}
      name={name}
      initialMessages={initialMessages}
      onLeave={() => {
        socket.emit("leave-room", { password: room });
        clearSession();
        setRoom(null);
        setName("");
        setInitialMessages([]);
      }}
    />
  );
}
