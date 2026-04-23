import { io, Socket } from "socket.io-client"

let socket: Socket | null = null
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:3005"


export const getSocket = (): Socket => {
  if (!socket) {
   
    socket = io(SOCKET_URL, {
      withCredentials: true,
    })
    
    socket.on("connect", () => {
      console.log("✅ Socket connected:", socket?.id)
    })
    
    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected")
    })
  }
  return socket
}


export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}