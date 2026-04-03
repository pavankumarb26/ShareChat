import { forwardRef, useRef, useEffect, useState } from "react";
import moment from "moment";

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
      <ul className="message-container" ref={ref}>
        {messages.map((msg, index) => {
          const rawId = msg.document?._id ?? msg.documentId;
          const fileId =
            rawId != null && rawId !== "" ? String(rawId) : "";
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

          const bubbleClass = [
            msg.isOwn ? "message-right" : "message-left",
            isImage ? "message-has-media" : "",
          ]
            .filter(Boolean)
            .join(" ");

          return (
            <li key={key} className={bubbleClass}>
              <div className="message-row">
                <div className="message-body">
                  {isImage && (
                    <img
                      src={fileSrc}
                      alt={fileName || "attachment"}
                      className="message-file-preview"
                      loading="lazy"
                    />
                  )}
                  <p className="message">
                    {!isFile && (
                      <span className="message-text">{msg.message}</span>
                    )}
                    {isFile && (
                      <>
                        <span className="message-file-caption">
                          {msg.message}
                        </span>
                        <a
                          className="file-download"
                          href={downloadHref}
                          download
                          target="_blank"
                          rel="noreferrer"
                        >
                          Download: {fileName}
                        </a>
                      </>
                    )}
                    <span className="message-meta">
                      {msg.name} • {moment(msg.dateTime).fromNow()}
                    </span>
                  </p>
                </div>
                <div className="message-actions">
                  <button
                    type="button"
                    className="copy-msg-btn"
                    title="Copy message"
                    aria-label="Copy message"
                    onClick={() => handleCopy(msg, key)}
                  >
                    <CopyIcon />
                    {copiedId === key ? " ✓" : ""}
                  </button>
                  {msg.isOwn && onDeleteMessage && (
                    <button
                      type="button"
                      className="delete-msg-btn"
                      title="Delete message"
                      aria-label="Delete message"
                      onClick={() => onDeleteMessage(msg._id)}
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              </div>
            </li>
          );
        })}

        {feedback && (
          <li className="message-feedback">
            <p className="feedback">{feedback}</p>
          </li>
        )}

        <div ref={bottomRef}></div>
      </ul>
    );
  }
);

export default MessageList;
