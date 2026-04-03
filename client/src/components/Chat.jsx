import { useEffect, useState } from "react";
import socket from "../socket";
import { API_BASE } from "../apiBase.js";
import ChatInput from "./ChatInput";
import MessageList from "./MessageList";

export default function Chat({ room, name, onLeave, initialMessages = [] }) {
  const [messages, setMessages] = useState(() =>
    initialMessages.map((m) => ({ ...m, isOwn: m.name === name }))
  );
  const [feedback, setFeedback] = useState("");

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

    socket.on("chat-message", onChatMessage);
    socket.on("feedback", onFeedback);
    socket.on("message-deleted", onDeleted);
    socket.on("delete-failed", onDeleteFailed);

    return () => {
      socket.off("chat-message", onChatMessage);
      socket.off("feedback", onFeedback);
      socket.off("message-deleted", onDeleted);
      socket.off("delete-failed", onDeleteFailed);
    };
  }, [name, room]);

  const sendMessage = (msg) => {
    if (!msg.trim()) return;
    socket.emit("message", { password: room, message: msg });
  };

  const deleteMessage = (messageId) => {
    if (!messageId) return;
    if (!window.confirm("Delete this message for everyone in the room?")) return;
    socket.emit("delete-message", { password: room, messageId });
  };

  // FIX: Forward typing feedback through the room channel
  const sendFeedback = (fb) => {
    socket.emit("feedback", { password: room, feedback: fb });
  };

  return (
    <div>
      <button type="button" onClick={onLeave}>
        ← Back
      </button>
      <h2>Room: {room}</h2>
      <MessageList
        messages={messages}
        feedback={feedback}
        apiBase={API_BASE}
        onDeleteMessage={deleteMessage}
      />
      <ChatInput
        sendMessage={sendMessage}
        sendFeedback={sendFeedback}
        name={name}
        room={room}
        apiBase={API_BASE}
      />
    </div>
  );
}