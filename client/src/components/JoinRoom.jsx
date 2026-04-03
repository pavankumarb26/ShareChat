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
  <div className="h-screen grid place-items-center bg-gray-100">

    <div className="w-[420px] bg-white p-7 rounded-2xl shadow-lg">

      {/* Back Button */}
      <button
        onClick={onBack}
        className="text-sm text-gray-600 mb-3 hover:text-black"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="text-center mb-5">
        <div className="w-12 h-12 bg-black text-white grid place-items-center rounded-xl mx-auto mb-2 text-xl">
          →
        </div>

        <h2 className="text-xl font-semibold">Join Room</h2>
        <p className="text-gray-500 text-sm">
          Enter a room using password
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-red-500 text-sm mb-2">{error}</p>
      )}

      {/* Username */}
      <div className="mb-4">
        <label className="text-sm text-gray-700 block mb-1">
          Your Name
        </label>
        <input
          className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-black"
          placeholder="Enter your display name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      {/* Password */}
      <div className="mb-4">
        <label className="text-sm text-gray-700 block mb-1">
          Room Password
        </label>
        <input
          type="password"
          className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:border-black"
          placeholder="Enter room password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>

      {/* Button */}
      <button
        onClick={handleSubmit}
        className="w-full bg-black text-white p-3 rounded-xl mt-3 hover:bg-gray-800 transition"
      >
        Join Room
      </button>

    </div>
  </div>
);
}