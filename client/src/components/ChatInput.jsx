import { useRef, useState } from "react";

export default function ChatInput({
  sendMessage,
  sendFeedback,
  name,
  room,
  apiBase,
}) {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    sendMessage(input.replace(/\r\n/g, "\n"));
    setInput("");
    sendFeedback("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (!input.trim()) return;
      sendMessage(input.replace(/\r\n/g, "\n"));
      setInput("");
      sendFeedback("");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !room) return;

    setUploading(true);
    sendFeedback("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("room", room);
      fd.append("userName", name || "Anonymous");
      const caption = input.trim();
      if (caption) fd.append("caption", caption);

      const res = await fetch(`${apiBase}/api/upload`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Upload failed");
      if (caption) setInput("");
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="chat-input-wrap">
      <form className="message-form" onSubmit={handleSubmit}>
        <textarea
          className="message-input message-textarea"
          value={input}
          rows={3}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => sendFeedback(`${name} is typing a message`)}
          onKeyDown={(e) => {
            sendFeedback(`✍ ${name} is typing a message`);
            handleKeyDown(e);
          }}
          onBlur={() => sendFeedback("")}
          placeholder="Message or paste code — Ctrl+Enter to send (optional caption for files)"
        />
        <button type="submit" className="send-button" disabled={uploading}>
          send <span>➤</span>
        </button>
      </form>

      <div className="file-upload-row">
        <input
          ref={fileRef}
          type="file"
          className="file-input-hidden"
          id="chat-file"
          accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.webp"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <label htmlFor="chat-file" className="file-upload-label">
          {uploading ? "Uploading…" : "Attach file (PDF, Word, PPT, images…)"}
        </label>
      </div>
      <p className="input-hint">Tip: Ctrl+Enter to send multiline text</p>
    </div>
  );
}
