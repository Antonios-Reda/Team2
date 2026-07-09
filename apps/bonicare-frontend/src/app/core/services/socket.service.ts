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
  private socket: Socket | null = null;

  readonly connected = signal(false);
  readonly lastMessage = signal<ChatMessage | null>(null);
  readonly signalingAvailable = signal(false);

  connect(): void {
    if (this.socket?.connected) return;

    this.socket = io(environment.socketUrl, {
      transports: ['websocket', 'polling'],
      autoConnect: true,
    });

    this.socket.on('connect', () => this.connected.set(true));
    this.socket.on('disconnect', () => this.connected.set(false));
    this.socket.on('newMessage', (msg: ChatMessage) => this.lastMessage.set(msg));
    this.socket.on('error', (err: string) => console.error('[Socket]', err));

    // Probe for WebRTC signaling support
    this.socket.emit('call:ping');
    this.socket.on('call:pong', () => this.signalingAvailable.set(true));
  }

  disconnect(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.connected.set(false);
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

  // WebRTC signaling stubs — activated when backend implements events
  emitCallEvent(event: string, payload: unknown): void {
    if (!this.signalingAvailable()) {
      console.warn(`[WebRTC] Signaling not available. Event "${event}" not sent.`);
      return;
    }
    this.socket?.emit(event, payload);
  }

  onCallEvent(event: string, callback: (data: unknown) => void): void {
    this.socket?.on(event, callback);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
