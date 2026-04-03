// ✅ Correct messageSchema
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  roomId: { type: String, required: true },
  name: { type: String, required: true },
  message: { type: String, required: true },
  dateTime: { type: Date, default: Date.now },
  kind: { type: String, enum: ["text", "file"], default: "text" },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: false,
  },
});

module.exports = mongoose.model("Message", messageSchema);