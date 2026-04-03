import { io, Socket } from "socket.io-client"

let socket: Socket | null = null


export const getSocket = (): Socket => {
  if (!socket) {
   
    socket = io("http://localhost:3001", {
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