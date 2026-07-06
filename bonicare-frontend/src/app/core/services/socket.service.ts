import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';
import { AuthService } from '../auth/auth.service';

export interface ChatMessage {
  _id?: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  content: string;
  createdAt?: string;
}

@Injectable({ providedIn: 'root' })
export class SocketService implements OnDestroy {
  private readonly auth = inject(AuthService);

  /** Main chat / presence socket → Node.js backend (port 3000) */
  private socket: Socket | null = null;

  /** Dedicated WebRTC signaling socket → WebRTC server (port 5002) */
  private signalingSocket: Socket | null = null;

  readonly connected = signal(false);
  readonly lastMessage = signal<ChatMessage | null>(null);
  readonly signalingAvailable = signal(false);

  connect(): void {
    this._connectMain();
    this._connectSignaling();
  }

  private _connectMain(): void {
    if (this.socket?.connected) return;

    this.socket = io(environment.socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => this.connected.set(true));
    this.socket.on('disconnect', () => this.connected.set(false));
    this.socket.on('newMessage', (msg: ChatMessage) => this.lastMessage.set(msg));
    this.socket.on('error', (err: string) => console.error('[Socket]', err));
  }

  private _connectSignaling(): void {
    if (this.signalingSocket?.connected) return;

    this.signalingSocket = io(environment.webRtcUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnectionAttempts: 5,
      timeout: 5000,
    });

    this.signalingSocket.on('connect', () => {
      console.log('[WebRTC] Signaling server connected ✅');
      this.signalingAvailable.set(true);
    });

    this.signalingSocket.on('disconnect', () => {
      console.warn('[WebRTC] Signaling server disconnected');
      this.signalingAvailable.set(false);
    });

    this.signalingSocket.on('connect_error', (err) => {
      console.warn('[WebRTC] Signaling server not reachable:', err.message);
      this.signalingAvailable.set(false);
    });
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.signalingSocket?.disconnect();
    this.signalingSocket = null;
    this.connected.set(false);
    this.signalingAvailable.set(false);
  }

  joinConversation(conversationId: string): void {
    this.socket?.emit('joinConversation', conversationId);
  }

  sendMessage(data: Omit<ChatMessage, '_id' | 'createdAt'>): void {
    this.socket?.emit('sendMessage', data);
  }

  onNewMessage(callback: (msg: ChatMessage) => void): void {
    this.socket?.on('newMessage', callback);
  }

  // ─── WebRTC signaling — routed to dedicated signaling server ───────────────

  emitCallEvent(event: string, payload: unknown): void {
    if (!this.signalingAvailable()) {
      console.warn(`[WebRTC] Signaling not available. Event "${event}" not sent.`);
      return;
    }
    this.signalingSocket?.emit(event, payload);
  }

  onCallEvent(event: string, callback: (data: unknown) => void): void {
    this.signalingSocket?.on(event, callback);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
