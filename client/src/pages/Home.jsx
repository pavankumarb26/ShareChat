import { useState } from "react";
import CreateRoom from "../components/CreateRoom";
import JoinRoom from "../components/JoinRoom";

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
    <div>
      <h1>Welcome</h1>
      {/* setPage here is Home's own internal state — this is correct */}
      <button onClick={() => setPage("create")}>Create Room</button>
      <button onClick={() => setPage("join")}>Join Room</button>
    </div>
  );
}