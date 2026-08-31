import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function conectarSocket(idAsesor: number): Socket {
  if (socket?.connected) return socket;

  socket = io(`${import.meta.env.VITE_API_URL_NEST}/notificaciones`, {
    query: { id_asesor: idAsesor },
    transports: ['websocket'],
  });

  return socket;
}

export function getSocket(): Socket | null {
  return socket;
}

export function desconectarSocket() {
  socket?.disconnect();
  socket = null;
}