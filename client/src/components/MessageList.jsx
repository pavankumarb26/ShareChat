import { forwardRef, useRef, useEffect, useState } from "react";
import moment from "moment";
import Header from "./Header";

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.left = "-9999px";
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    document.body.removeChild(ta);
  }
}

function CopyIcon() {
  return (
    <svg
      className="copy-icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      className="trash-icon"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

const MessageList = forwardRef(
  ({ messages, feedback, apiBase, onDeleteMessage }, ref) => {
    const bottomRef = useRef(null);
    const [copiedId, setCopiedId] = useState(null);

    useEffect(() => {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, feedback]);

    const buildCopyText = (msg) => {
      const rawId = msg.document?._id ?? msg.documentId;
      const fileId = rawId != null && rawId !== "" ? String(rawId) : "";
      const fileName = msg.document?.fileName || "file";
      const isFile = msg.kind === "file" && fileId;
      if (!isFile) return msg.message || "";
      const q = (n) => encodeURIComponent(n || "");
      const url = `${apiBase}/api/files/${q(fileId)}?original=${q(fileName)}`;
      return `${msg.message || fileName}\n${url}`;
    };

    const handleCopy = async (msg, rowKey) => {
      await copyToClipboard(buildCopyText(msg));
      setCopiedId(rowKey);
      setTimeout(() => setCopiedId((c) => (c === rowKey ? null : c)), 1500);
    };

return (
  
  <ul
    ref={ref}
    className="flex flex-col gap-2 p-3 h-[500px] overflow-y-auto bg-gray-100 rounded-xl"
  >
    {messages.map((msg, index) => {
      const rawId = msg.document?._id ?? msg.documentId;
      const fileId = rawId != null && rawId !== "" ? String(rawId) : "";
      const fileName = msg.document?.fileName || "file";
      const mimeType = msg.document?.mimeType || "";

      const isFile = msg.kind === "file" && fileId.length > 0;

      const isImage =
        isFile &&
        (mimeType.startsWith("image/") ||
          /\.(png|jpe?g|gif|webp)$/i.test(fileName));

      const fileSrc = isFile
        ? `${apiBase}/api/files/${encodeURIComponent(fileId)}?inline=1`
        : "";

      const downloadHref = isFile
        ? `${apiBase}/api/files/${encodeURIComponent(fileId)}?original=${encodeURIComponent(fileName)}`
        : "";

      const key = msg._id != null ? String(msg._id) : `m-${index}`;

      return (
        <li
          key={key}
          className={`flex ${
            msg.isOwn ? "justify-end" : "justify-start"
          } px-2`}
        >
          <div className="flex gap-2 max-w-[80%]">

            {/* Message Bubble */}
            <div
              className={`p-3 rounded-2xl shadow text-sm break-words ${
                msg.isOwn
                  ? "bg-black text-white rounded-br-none"
                  : "bg-white text-black rounded-bl-none border"
              }`}
            >
              {/* Image Preview */}
              {isImage && (
                <img
                  src={fileSrc}
                  alt={fileName || "attachment"}
                  className="rounded-lg mb-2 max-h-60 w-full object-contain"
                  loading="lazy"
                />
              )}

              {/* Text Message */}
              {!isFile && (
                <span className="whitespace-pre-wrap">
                  {msg.message}
                </span>
              )}

              {/* File Message */}
              {isFile && (
                <div>
                  <p className="mb-1">{msg.message}</p>
                  <a
                    href={downloadHref}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className={`text-sm underline ${
                      msg.isOwn ? "text-blue-300" : "text-blue-600"
                    }`}
                  >
                    Download: {fileName}
                  </a>
                </div>
              )}

              {/* Meta Info */}
              <div className="text-[10px] mt-1 opacity-70">
                {msg.name} • {moment(msg.dateTime).fromNow()}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-1 text-xs">
              <button
                onClick={() => handleCopy(msg, key)}
                className="bg-gray-100 px-2 py-1 rounded hover:bg-gray-200"
              >
                <CopyIcon />
                {copiedId === key && " ✓"}
              </button>

              {msg.isOwn && onDeleteMessage && (
                <button
                  onClick={() => onDeleteMessage(msg._id)}
                  className="bg-red-100 px-2 py-1 rounded hover:bg-red-200"
                >
                  <TrashIcon />
                </button>
              )}
            </div>

          </div>
        </li>
      );
    })}

    {/* Typing Feedback */}
    {feedback && (
      <li className="text-center text-sm text-gray-500 italic">
        {feedback}
      </li>
    )}

    {/* Auto Scroll Anchor */}
    <div ref={bottomRef}></div>
  </ul>
);
  }
);

export default MessageList;
