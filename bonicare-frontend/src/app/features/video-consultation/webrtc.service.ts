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
    { urls: 'stun:stun1.l.google.com:19302' },
  ];

  async startCall(appointmentId: string): Promise<void> {
    if (!this.signalingAvailable()) {
      console.warn('[WebRTC] Signaling not available – cannot start call.');
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

      // Register listeners BEFORE emitting join so we don't miss any events
      this.setupSignalingListeners();

      // Join the appointment room on the signaling server
      this.socket.emitCallEvent('call:join', { appointmentId });

      // Create and send offer
      const offer = await this.peerConnection!.createOffer();
      await this.peerConnection!.setLocalDescription(offer);
      this.socket.emitCallEvent('call:offer', { appointmentId, sdp: offer });
    } catch (err) {
      console.error('[WebRTC] startCall failed:', err);
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

    this.peerConnection.oniceconnectionstatechange = () => {
      const state = this.peerConnection?.iceConnectionState;
      if (state === 'failed') {
        console.warn('[WebRTC] ICE failed — attempting restart');
        this.peerConnection?.restartIce();
      }
    };
  }

  private setupSignalingListeners(): void {
    // ── Answerer receives the offer ────────────────────────────────────────────
    this.socket.onCallEvent('call:offer', async (data: unknown) => {
      const { sdp, appointmentId } = data as { sdp: RTCSessionDescriptionInit; appointmentId: string };
      if (appointmentId !== this.appointmentId) return; // not our room

      // If we are the answerer (no local description yet), handle the incoming offer
      if (!this.peerConnection) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          this.localStream.set(stream);
          this.callState.set('connecting');
          this.createPeerConnection();
          stream.getTracks().forEach((track) => this.peerConnection!.addTrack(track, stream));
        } catch (err) {
          console.error('[WebRTC] Could not get media for answer:', err);
          this.callState.set('failed');
          return;
        }
      }

      await this.peerConnection!.setRemoteDescription(sdp);
      const answer = await this.peerConnection!.createAnswer();
      await this.peerConnection!.setLocalDescription(answer);
      this.socket.emitCallEvent('call:answer', { appointmentId, sdp: answer });
    });

    // ── Caller receives the answer ─────────────────────────────────────────────
    this.socket.onCallEvent('call:answer', async (data: unknown) => {
      const { sdp } = data as { sdp: RTCSessionDescriptionInit };
      if (this.peerConnection?.signalingState === 'have-local-offer') {
        await this.peerConnection.setRemoteDescription(sdp);
      }
    });

    // ── ICE candidates ──────────────────────────────────────────────────────────
    this.socket.onCallEvent('call:ice-candidate', async (data: unknown) => {
      const { candidate } = data as { candidate: RTCIceCandidateInit };
      try {
        await this.peerConnection?.addIceCandidate(candidate);
      } catch (err) {
        console.warn('[WebRTC] Failed to add ICE candidate:', err);
      }
    });

    // ── Peer left ───────────────────────────────────────────────────────────────
    this.socket.onCallEvent('call:peer-left', () => {
      console.log('[WebRTC] Remote peer left the call');
      this.callState.set('ended');
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
