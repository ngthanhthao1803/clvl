import { io, Socket } from "socket.io-client";
import { getSocketUrl } from "./endpoints";

let socket: Socket | null = null;

export function getSocket(token?: string | null) {
  if (!socket) {
    socket = io(getSocketUrl(), {
      autoConnect: false,
      withCredentials: true,
      auth: {
        token:
          token ??
          (typeof window !== "undefined"
            ? window.localStorage.getItem("clvl-jwt")
            : null),
      },
    });
  }

  if (token) {
    socket.auth = { token };
  }

  return socket;
}
