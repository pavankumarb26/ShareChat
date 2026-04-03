const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const multer = require("multer");
const connectDB = require("./config/db.js");
const Room = require("./models/roomSchema");
const Message = require("./models/messageSchema");
const Document = require("./models/documentSchema");

dotenv.config();
connectDB();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const ok = /\.(pdf|doc|docx|ppt|pptx|txt|png|jpe?g|gif|webp)$/i.test(
      file.originalname || ""
    );
    if (ok) cb(null, true);
    else
      cb(
        new Error(
          "Only images, PDF, Word, PowerPoint, and .txt files are allowed."
        )
      );
  },
});

function handleMulterUpload(req, res, next) {
  upload.single("file")(req, res, (err) => {
    if (err)
      return res.status(400).json({ error: err.message || "Upload failed" });
    next();
  });
}

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

const server = app.listen(process.env.PORT || 3000, () => {
  console.log("Server running...");
});

const io = require("socket.io")(server, {
  cors: { origin: "http://localhost:5173", methods: ["GET", "POST"] },
});

app.post("/api/upload", handleMulterUpload, async (req, res) => {
  try {
    const roomRaw = req.body.room?.trim().toLowerCase();
    const userName = (req.body.userName || "").trim() || "Anonymous";
    if (!req.file || !roomRaw) {
      return res.status(400).json({ error: "Room and file are required" });
    }

    const roomDoc = await Room.findOne({ password: roomRaw });
    if (!roomDoc) {
      return res.status(404).json({ error: "Room not found" });
    }

    const caption = (req.body.caption || "").trim();
    const displayMessage = caption || `📎 ${req.file.originalname}`;

    const document = await Document.create({
      roomId: roomRaw,
      title: req.file.originalname,
      fileName: req.file.originalname,
      filePath: `mongo:${req.file.originalname}`,
      fileSize: req.file.size,
      mimeType: req.file.mimetype || "application/octet-stream",
      fileData: req.file.buffer,
      status: "ready",
      uploadDate: new Date(),
    });

    const newMessage = await Message.create({
      roomId: roomRaw,
      name: userName,
      message: displayMessage,
      kind: "file",
      documentId: document._id,
    });

    const plain = {
      ...newMessage.toObject(),
      document: {
        _id: document._id,
        fileName: document.fileName,
        mimeType: document.mimeType,
        fileSize: document.fileSize,
      },
    };
    io.to(roomRaw).emit("chat-message", plain);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/files/:documentId", async (req, res) => {
  try {
    const doc = await Document.findById(req.params.documentId).lean();
    if (!doc || !doc.fileData) {
      return res.status(404).end();
    }

    const original = String(req.query.original || doc.fileName || "download");
    const inline = req.query.inline === "1";

    res.setHeader("Content-Type", doc.mimeType || "application/octet-stream");
    const dispo = inline ? "inline" : "attachment";
    res.setHeader(
      "Content-Disposition",
      `${dispo}; filename="${encodeURIComponent(original)}"`
    );
    return res.send(doc.fileData);
  } catch (_err) {
    return res.status(404).end();
  }
});

let socketsConnected = new Set();
const users = {}; // store name + room per socket

function emitRoomUsers(room) {
  const roomUsers = Object.values(users)
    .filter((u) => u.room === room)
    .map((u) => ({ name: u.name }));

  io.to(room).emit("active-users", roomUsers);
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  socketsConnected.add(socket.id);
  io.emit("clients-total", socketsConnected.size);

socket.on("disconnect", () => {
  console.log("User disconnected:", socket.id);

  const user = users[socket.id];

  socketsConnected.delete(socket.id);
  delete users[socket.id];

  io.emit("clients-total", socketsConnected.size);

  if (user?.room) {
    emitRoomUsers(user.room);
  }
});

socket.on("leave-room", ({ password }) => {
  const cleanPass = password?.trim().toLowerCase();
  if (!cleanPass) return;

  socket.leave(cleanPass);
  delete users[socket.id];

  emitRoomUsers(cleanPass);
});

  socket.on("create-room", async ({ password }) => {
    try {
      if (!password) {
        socket.emit("error-message", "Password is required");
        return;
      }
      const cleanPass = password.trim().toLowerCase();
      const exists = await Room.findOne({ password: cleanPass });
      if (exists) {
        socket.emit(
          "error-message",
          "A room with this password already exists. Choose a different password."
        );
        return;
      }
      await Room.create({ password: cleanPass });
      socket.emit("room-created", cleanPass);
    } catch (err) {
      console.log("Create Room Error:", err);
      socket.emit("error-message", "Server error: " + err.message);
    }
  });

  socket.on("join-room", async ({ password, name }) => {
    try {
      if (!password) return;
      const cleanPass = password.trim().toLowerCase();
      const room = await Room.findOne({ password: cleanPass });
      if (!room) {
        socket.emit(
          "error-message",
          "No room matches this password. Check the password or create a new room."
        );
        return;
      }

      users[socket.id] = { name: name?.trim() || "Anonymous", room: cleanPass };

      socket.join(cleanPass);
      emitRoomUsers(cleanPass);
      const messagesRaw = await Message.find({ roomId: cleanPass })
        .sort({ dateTime: 1 })
        .populate("documentId", "fileName mimeType fileSize")
        .lean();
      const messages = messagesRaw.map((m) => ({
        ...m,
        document: m.documentId
          ? {
              _id: m.documentId._id,
              fileName: m.documentId.fileName,
              mimeType: m.documentId.mimeType,
              fileSize: m.documentId.fileSize,
            }
          : null,
      }));
      // Single payload so the client can apply history after Chat mounts (avoids race with previous-messages).
      socket.emit("room-joined", { roomId: cleanPass, messages });
    } catch (err) {
      console.log("Join Room Error:", err);
      socket.emit("error-message", "Server error: " + err.message);
    }
  });

  socket.on("message", async ({ password, message }) => {
    try {
      const cleanPass = password?.trim().toLowerCase();
      const name = users[socket.id]?.name;

      if (!cleanPass || message == null || String(message).trim() === "") return;
      if (!name) {
        socket.emit("error-message", "User not identified. Please rejoin.");
        return;
      }

      // Do not .trim() the full string — that strips leading indent on the first line of pasted code.
      const text = String(message).replace(/\r\n/g, "\n");

      const newMessage = await Message.create({
        roomId: cleanPass,
        name,
        message: text,
        kind: "text",
      });

      io.to(cleanPass).emit("chat-message", newMessage.toObject());
    } catch (err) {
      console.log("Message Error:", err);
      socket.emit("error-message", "Server error: " + err.message);
    }
  });

  socket.on("feedback", ({ password, feedback }) => {
    const cleanPass = password?.trim().toLowerCase();
    if (!cleanPass) return;
    socket.to(cleanPass).emit("feedback", { feedback });
  });

  socket.on("delete-message", async ({ password, messageId }) => {
    try {
      const cleanPass = password?.trim().toLowerCase();
      const requester = users[socket.id]?.name?.trim();
      if (!cleanPass || !messageId || !requester) return;

      const msg = await Message.findById(messageId);
      if (!msg || msg.roomId !== cleanPass) {
        socket.emit("delete-failed", "Message not found.");
        return;
      }

      if (String(msg.name || "").trim() !== requester) {
        socket.emit("delete-failed", "You can only delete messages you sent.");
        return;
      }

      if (msg.documentId) await Document.findByIdAndDelete(msg.documentId);
      await Message.findByIdAndDelete(messageId);

      io.to(cleanPass).emit("message-deleted", {
        messageId: String(messageId),
      });
    } catch (err) {
      console.log("Delete message:", err);
      socket.emit("delete-failed", "Could not delete message.");
    }
  });
});
