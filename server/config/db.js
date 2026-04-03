const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${db.connection.host}`);

    const rooms = mongoose.connection.collection("rooms");

    // Remove legacy index from old schema (roomId), if it exists.
    try {
      await rooms.dropIndex("roomId_1");
      console.log("Dropped legacy index: roomId_1");
    } catch (indexErr) {
      if (indexErr.codeName !== "IndexNotFound") {
        throw indexErr;
      }
    }

    // Ensure password is the unique room identifier.
    await rooms.createIndex({ password: 1 }, { unique: true });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;