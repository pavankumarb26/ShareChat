import { useState } from "react";
import socket, { parseRoomJoined } from "../socket";

export default function CreateRoom({ onRoomJoined, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    setStatus("Creating room...");
    setError("");

    const displayName = username.trim();

    socket.off("room-created");
    socket.off("error-message");

    const onCreated = (roomId) => {
      setStatus("Joining room...");
      socket.emit("join-room", { password: roomId, name: displayName });
      socket.once("room-joined", (payload) => {
        const { roomId: id, messages } = parseRoomJoined(payload);
        onRoomJoined({ roomId: id, messages, name: displayName });
      });
    };

    const onErr = (msg) => {
      setError(msg);
      setStatus("");
    };

    socket.once("room-created", onCreated);
    socket.once("error-message", onErr);

    socket.emit("create-room", { password: password.trim() });
  };

  return (
    <div>
      <button type="button" onClick={onBack}>
        ← Back
      </button>
      <h2>Create Room</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {status && <p style={{ color: "blue" }}>{status}</p>}

      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Room password (unique)"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="button" onClick={handleSubmit}>
        Create room
      </button>
    </div>
  );
}