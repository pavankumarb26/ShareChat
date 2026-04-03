import { useState } from "react";
import socket, { parseRoomJoined } from "../socket";

export default function JoinRoom({ onRoomJoined, onBack }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = () => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required");
      return;
    }

    setError("");
    const displayName = username.trim();

    socket.off("room-joined");
    socket.off("error-message");

    socket.once("room-joined", (payload) => {
      const { roomId, messages } = parseRoomJoined(payload);
      onRoomJoined({ roomId, messages, name: displayName });
    });
    socket.once("error-message", (msg) => setError(msg));

    socket.emit("join-room", { password: password.trim(), name: displayName });
  };

  return (
    <div>
      <button type="button" onClick={onBack}>
        ← Back
      </button>
      <h2>Join room</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input
        type="password"
        placeholder="Room password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="button" onClick={handleSubmit}>
        Join room
      </button>
    </div>
  );
}