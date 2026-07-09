import { Injectable, inject, signal, OnDestroy } from '@angular/core';
import { SocketService } from '../../core/services/socket.service';

export type CallState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'ended' | 'failed';
export type MediaState = { audio: boolean; video: boolean; screen: boolean };

@Injectable({ providedIn: 'root' })
export class WebRtcService implements OnDestroy {
  private readonly socket = inject(SocketService);

  readonly callState = signal<CallState>('idle');
  readonly mediaState = signal<MediaState>({ audio: true, video: true, screen: false });
  readonly localStream = signal<MediaStream | null>(null);
  readonly remoteStream = signal<MediaStream | null>(null);
  readonly networkQuality = signal<'good' | 'fair' | 'poor'>('good');
  readonly signalingAvailable = this.socket.signalingAvailable;

  private peerConnection: RTCPeerConnection | null = null;
  private appointmentId: string | null = null;

  private readonly iceServers: RTCIceServer[] = [
    { urls: 'stun:stun.l.google.com:19302' },
  ];

  async startCall(appointmentId: string): Promise<void> {
    if (!this.signalingAvailable()) {
      this.callState.set('failed');
      return;
    }

    this.appointmentId = appointmentId;
    this.callState.set('connecting');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      this.localStream.set(stream);
      this.createPeerConnection();
      stream.getTracks().forEach((track) => this.peerConnection!.addTrack(track, stream));

      this.socket.emitCallEvent('call:join', { appointmentId });
      this.setupSignalingListeners();

      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);
      this.socket.emitCallEvent('call:offer', { appointmentId, sdp: offer });
    } catch {
      this.callState.set('failed');
    }
  }

  async toggleAudio(): Promise<void> {
    const stream = this.localStream();
    if (!stream) return;
    const track = stream.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      this.mediaState.update((s) => ({ ...s, audio: track.enabled }));
    }
  }

  async toggleVideo(): Promise<void> {
    const stream = this.localStream();
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      this.mediaState.update((s) => ({ ...s, video: track.enabled }));
    }
  }

  async toggleScreenShare(): Promise<void> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      const sender = this.peerConnection?.getSenders().find((s) => s.track?.kind === 'video');
      if (sender) await sender.replaceTrack(screenTrack);
      this.mediaState.update((s) => ({ ...s, screen: true }));
      screenTrack.onended = () => this.stopScreenShare();
    } catch {
      // user cancelled
    }
  }

  endCall(): void {
    if (this.appointmentId) {
      this.socket.emitCallEvent('call:leave', { appointmentId: this.appointmentId });
    }
    this.cleanup();
    this.callState.set('ended');
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  private createPeerConnection(): void {
    this.peerConnection = new RTCPeerConnection({ iceServers: this.iceServers });

    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate && this.appointmentId) {
        this.socket.emitCallEvent('call:ice-candidate', {
          appointmentId: this.appointmentId,
          candidate: event.candidate,
        });
      }
    };

    this.peerConnection.ontrack = (event) => {
      this.remoteStream.set(event.streams[0]);
      this.callState.set('connected');
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection?.connectionState;
      if (state === 'connected') this.callState.set('connected');
      else if (state === 'connecting') this.callState.set('connecting');
      else if (state === 'disconnected') this.callState.set('reconnecting');
      else if (state === 'failed') this.callState.set('failed');
    };
  }

  private setupSignalingListeners(): void {
    this.socket.onCallEvent('call:answer', async (data: unknown) => {
      const { sdp } = data as { sdp: RTCSessionDescriptionInit };
      await this.peerConnection?.setRemoteDescription(sdp);
    });

    this.socket.onCallEvent('call:ice-candidate', async (data: unknown) => {
      const { candidate } = data as { candidate: RTCIceCandidateInit };
      await this.peerConnection?.addIceCandidate(candidate);
    });
  }

  private stopScreenShare(): void {
    this.mediaState.update((s) => ({ ...s, screen: false }));
  }

  private cleanup(): void {
    this.localStream()?.getTracks().forEach((t) => t.stop());
    this.peerConnection?.close();
    this.peerConnection = null;
    this.localStream.set(null);
    this.remoteStream.set(null);
    this.appointmentId = null;
  }
}
