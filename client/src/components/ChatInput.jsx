import { useRef, useState } from "react";

export default function ChatInput({
  sendMessage,
  sendFeedback,
  name,
  room,
  apiBase,
  disabled = false,
}) {
  const [input, setInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (!input.trim()) return;
    sendMessage(input.replace(/\r\n/g, "\n"));
    setInput("");
    sendFeedback("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      if (disabled) return;
      if (!input.trim()) return;
      sendMessage(input.replace(/\r\n/g, "\n"));
      setInput("");
      sendFeedback("");
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (disabled || !file || !room) return;

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
      const fallback =
        err?.message === "Failed to fetch"
          ? "Upload failed: backend unreachable or blocked by CORS. Check server URL and CORS settings."
          : err?.message || "Upload failed";
      alert(fallback);
    } finally {
      setUploading(false);
    }
  };

return (
  <div className="w-full max-w-full">

    {/* Message Form */}
    <form
      onSubmit={handleSubmit}
      className={`flex items-end gap-2 rounded-xl border border-gray-200 bg-white p-2 shadow-sm ${disabled ? "opacity-60" : ""}`}
    >
      <textarea
        value={input}
        rows={3}
        disabled={disabled}
        onChange={(e) => setInput(e.target.value)}
        onFocus={() => !disabled && sendFeedback(`${name} is typing a message`)}
        onKeyDown={(e) => {
          if (!disabled) sendFeedback(`✍ ${name} is typing a message`);
          handleKeyDown(e);
        }}
        onBlur={() => sendFeedback("")}
        placeholder={
          disabled
            ? "Waiting for connection…"
            : "Message or paste code — Ctrl+Enter to send"
        }
        className="flex-1 resize-none rounded-lg border border-gray-300 p-2 text-sm focus:outline-none focus:border-black disabled:cursor-not-allowed disabled:bg-slate-50"
      />

      <button
        type="submit"
        disabled={uploading || disabled}
        className="rounded-lg bg-slate-900 px-4 py-2 text-sm text-white transition hover:bg-slate-800 disabled:opacity-50"
      >
        Send
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
        disabled={uploading || disabled}
        className="hidden"
      />

      <label
        htmlFor="chat-file"
        className={`block rounded-lg border border-dashed border-gray-300 p-2 text-center text-sm text-gray-600 ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:bg-gray-50"}`}
      >
        {uploading
          ? "Uploading…"
          : "Attach file (PDF, Word, PPT, images…)"}
      </label>
    </div>

    <p className="mt-2 text-center text-[11px] text-slate-400 sm:text-left">
      Tip: Ctrl+Enter to send · optional caption when attaching a file
    </p>
  </div>
);
}
