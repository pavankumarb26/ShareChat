  import { io } from "socket.io-client";

  const socket = io("http://localhost:3000", {
    autoConnect: true,
  });

  /** Server sends { roomId, messages }; older clients may receive a string room id only. */
  export function parseRoomJoined(payload) {
    if (payload == null) return { roomId: "", messages: [] };
    if (typeof payload === "string") return { roomId: payload, messages: [] };
    return {
      roomId: payload.roomId ?? "",
      messages: Array.isArray(payload.messages) ? payload.messages : [],
    };
  }

  export default socket;