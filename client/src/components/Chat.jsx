import { useEffect, useState } from "react";
import socket from "../socket";
import { API_BASE } from "../apiBase.js";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";
import Header from "./Header";

export default function Chat({ room, name, onLeave, initialMessages = [] }) {

  const [messages, setMessages] = useState(() =>
    initialMessages.map((m) => ({ ...m, isOwn: m.name === name }))
  );

  const [feedback, setFeedback] = useState("");
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const onChatMessage = (data) => {
      setMessages((prev) => [
        ...prev,
        { ...data, isOwn: data.name === name },
      ]);
      setFeedback("");
    };

    const onFeedback = ({ feedback: fb }) => setFeedback(fb);

    const onDeleted = ({ messageId }) => {
      setMessages((prev) =>
        prev.filter((m) => String(m._id) !== String(messageId))
      );
    };

    const onDeleteFailed = (msg) => alert(msg);

    const onActiveUsers = (usersList) => {
      setUsers(usersList);
    };

    socket.on("chat-message", onChatMessage);
    socket.on("feedback", onFeedback);
    socket.on("message-deleted", onDeleted);
    socket.on("delete-failed", onDeleteFailed);
    socket.on("active-users", onActiveUsers);

    return () => {
      socket.off("chat-message", onChatMessage);
      socket.off("feedback", onFeedback);
      socket.off("message-deleted", onDeleted);
      socket.off("delete-failed", onDeleteFailed);
      socket.off("active-users", onActiveUsers);
    };
  }, [name, room]);

  const sendMessage = (msg) => {
    if (!msg.trim()) return;
    socket.emit("message", { password: room, message: msg });
  };

  const deleteMessage = (messageId) => {
    if (!messageId) return;
    if (!window.confirm("Delete this message?")) return;
    socket.emit("delete-message", { password: room, messageId });
  };

  const sendFeedback = (fb) => {
    socket.emit("feedback", { password: room, feedback: fb });
  };

  // ✅ RETURN MUST BE HERE
  return (
    <div className="h-screen flex flex-col bg-gray-100">

      <Header room={room} users={users} onLeave={onLeave} />

      <div className="flex-1 overflow-hidden p-2">
        <MessageList
          messages={messages}
          feedback={feedback}
          apiBase={API_BASE}
          onDeleteMessage={deleteMessage}
        />
      </div>

      <div className="bg-white border-t p-2">
        <ChatInput
          sendMessage={sendMessage}
          sendFeedback={sendFeedback}
          name={name}
          room={room}
          apiBase={API_BASE}
        />
      </div>

    </div>
  );
}