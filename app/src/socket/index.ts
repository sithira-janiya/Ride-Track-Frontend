import { io, type Socket } from 'socket.io-client';

import { env } from '@/config/env';
import { useAuth } from '@/store/auth';
import type { ClientToServerEvents, ServerToClientEvents } from '@/types';

export type RideSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: RideSocket | null = null;

/** Lazily creates the single authenticated socket. Returns null in mock mode or when logged out. */
export function getSocket(): RideSocket | null {
  if (env.useMockApi) return null;
  const token = useAuth.getState().accessToken;
  if (!token) return null;
  socket ??= io(env.socketUrl, {
    auth: { token },
    autoConnect: true,
    reconnection: true,
    reconnectionDelayMax: 5000,
  });
  return socket;
}

export function disconnectSocket() {
  socket?.disconnect();
  socket = null;
}
