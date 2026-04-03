import { useState } from "react";
import CreateRoom from "../components/CreateRoom";
import JoinRoom from "../components/JoinRoom";
import { FiMessageCircle } from "react-icons/fi";

export default function Home({ onRoomJoined }) {
  const [page, setPage] = useState("");

  
  const goHome = () => setPage("");

  if (page === "create") {
    return <CreateRoom onRoomJoined={onRoomJoined} onBack={goHome} />;
  }

  if (page === "join") {
    return <JoinRoom onRoomJoined={onRoomJoined} onBack={goHome} />;
  }

return (
  <div className="h-screen grid place-items-center bg-gray-100">
    
    <div className="w-[420px] bg-white p-8 rounded-2xl shadow-lg text-center">

      {/* Header */}
      <div className="mb-6">
        <div className="text-3xl flex justify-center mb-2 text-black">
          <FiMessageCircle />
        </div>
        <h1 className="text-2xl font-semibold">Chat Room</h1>
        <p className="text-gray-500 text-sm">
          Connect instantly with friends
        </p>
      </div>

      {/* Create Room Card */}
      <div
        onClick={() => setPage("create")}
        className="flex justify-between items-center p-4 mb-3 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition hover:shadow"
      >
        <div className="text-left">
          <h3 className="font-medium">Create Room</h3>
          <p className="text-sm text-gray-500">
            Start a new conversation
          </p>
        </div>
        <span className="text-lg">→</span>
      </div>

      {/* Join Room Card */}
      <div
        onClick={() => setPage("join")}
        className="flex justify-between items-center p-4 rounded-xl border border-gray-200 bg-gray-50 cursor-pointer hover:bg-gray-100 transition hover:shadow"
      >
        <div className="text-left">
          <h3 className="font-medium">Join Room</h3>
          <p className="text-sm text-gray-500">
            Enter with a room code
          </p>
        </div>
        <span className="text-lg">→</span>
      </div>

      {/* Footer */}
      <p className="text-xs text-gray-400 mt-6">
        🔒 End-to-end encrypted
      </p>

    </div>
  </div>
);
}