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
  <div className="w-[420px] mx-auto mt-3">

    {/* Message Form */}
    <form
      onSubmit={handleSubmit}
      className="flex items-end gap-2 bg-white border border-gray-200 rounded-xl p-2 shadow-sm"
    >
      <textarea
        value={input}
        rows={3}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => sendFeedback(`${name} is typing a message`)}
        onKeyDown={(e) => {
          sendFeedback(`✍ ${name} is typing a message`);
          handleKeyDown(e);
        }}
        onBlur={() => sendFeedback("")}
        placeholder="Message or paste code — Ctrl+Enter to send"
        className="flex-1 resize-none border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:border-black"
      />

      <button
        type="submit"
        disabled={uploading}
        className="bg-black text-white px-4 py-2 rounded-lg text-sm hover:bg-gray-800 transition disabled:opacity-50"
      >
        ➤
      </button>
    </form>

    {/* File Upload */}
    <div className="mt-2">
      <input
        ref={fileRef}
        type="file"
        id="chat-file"
        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.png,.jpg,.jpeg,.gif,.webp"
        onChange={handleFileChange}
        disabled={uploading}
        className="hidden"
      />

      <label
        htmlFor="chat-file"
        className="block text-center text-sm text-gray-600 border border-dashed border-gray-300 rounded-lg p-2 cursor-pointer hover:bg-gray-50"
      >
        {uploading
          ? "Uploading…"
          : "Attach file (PDF, Word, PPT, images…)"}
      </label>
    </div>

    {/* Hint */}
    <p className="text-xs text-gray-400 mt-1">
      Tip: Ctrl+Enter to send multiline text
    </p>

  </div>
);
}
