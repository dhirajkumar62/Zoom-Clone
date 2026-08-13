'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  Monitor,
  Users,
  MessageSquare,
  PhoneOff,
  Copy,
  Check,
  Shield,
  Send,
  X,
  Settings as SettingsIcon,
  Camera,
  Volume2,
  AlertCircle,
  Sliders,
  StopCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Meeting, Participant } from '@/lib/types';
import { formatMeetingId } from '@/lib/utils';
import { leaveMeeting, endMeeting, getMeetingParticipants, updateParticipantRole, removeParticipant, muteAllParticipants } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface MeetingRoomProps {
  meeting: Meeting;
  displayName: string;
  participantId?: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isSelf: boolean;
}

export default function MeetingRoom({ meeting, displayName, participantId }: MeetingRoomProps) {
  const router = useRouter();

  // Control states
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [activeTab, setActiveTab] = useState<'none' | 'participants' | 'chat'>('none');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Real Webcam Media Stream state
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [useRealWebcam, setUseRealWebcam] = useState(true);
  const [webcamError, setWebcamError] = useState<string | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedVideoDeviceId, setSelectedVideoDeviceId] = useState<string>('');
  const [selectedAudioDeviceId, setSelectedAudioDeviceId] = useState<string>('');

  // Screen Sharing Media Stream state
  const screenVideoRef = useRef<HTMLVideoElement | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  const [screenShareError, setScreenShareError] = useState<string | null>(null);
  const [remoteScreenShare, setRemoteScreenShare] = useState<{
    isSharing: boolean;
    sharerName: string;
    sharerUserId: number | string | null;
    streamId: string | null;
  }>({
    isSharing: false,
    sharerName: '',
    sharerUserId: null,
    streamId: null,
  });
  const remoteScreenShareStreamIdRef = useRef<string | null>(null);

  // Active WebSocket reference for real-time signaling & chat
  const wsRef = useRef<WebSocket | null>(null);

  // WebRTC Peer Connections & Remote Streams state
  const peerConnections = useRef<Map<string | number, RTCPeerConnection>>(new Map());
  const remoteStreams = useRef<Map<string | number, MediaStream>>(new Map());
  const [remoteStreamsState, setRemoteStreamsState] = useState<{ [key: string | number]: MediaStream }>({});
  const [remoteScreenShareStream, setRemoteScreenShareStream] = useState<MediaStream | null>(null);

  const { user: currentUser } = useAuth();
  const myKey = currentUser?.id ?? participantId ?? displayName;

  // Cleanup helper when a participant leaves or is removed
  const removeParticipantFromState = (key: string | number) => {
    const keyStr = String(key);
    peerConnections.current.forEach((pc, pKey) => {
      if (String(pKey) === keyStr) {
        pc.close();
        peerConnections.current.delete(pKey);
      }
    });
    remoteStreams.current.forEach((_, rKey) => {
      if (String(rKey) === keyStr) {
        remoteStreams.current.delete(rKey);
      }
    });
    setRemoteStreamsState((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((k) => {
        if (String(k) === keyStr) {
          delete next[k];
        }
      });
      return next;
    });

    if (remoteScreenShare.sharerUserId && String(remoteScreenShare.sharerUserId) === keyStr) {
      setRemoteScreenShare({ isSharing: false, sharerName: '', sharerUserId: null, streamId: null });
      remoteScreenShareStreamIdRef.current = null;
      setRemoteScreenShareStream(null);
    }
  };

  // WebRTC Peer Connection Factory & Signaling Logic
  const createPeerConnection = (targetKey: string | number) => {
    if (peerConnections.current.has(targetKey)) {
      return peerConnections.current.get(targetKey)!;
    }

    const pc = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    });

    if (stream) {
      stream.getTracks().forEach((track) => {
        pc.addTrack(track, stream);
      });
    }

    if (screenStream) {
      screenStream.getTracks().forEach((track) => {
        pc.addTrack(track, screenStream);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: 'webrtc_ice_candidate',
            target_id: targetKey,
            sender_id: myKey,
            candidate: event.candidate,
          })
        );
      }
    };

    pc.ontrack = (event) => {
      const [incomingStream] = event.streams;
      const streamToUse = incomingStream || new MediaStream([event.track]);

      const trackLabel = event.track.label.toLowerCase();
      const streamId = streamToUse.id;
      const isScreenTrack =
        event.track.kind === 'video' &&
        (
          (remoteScreenShareStreamIdRef.current && streamId === remoteScreenShareStreamIdRef.current) ||
          trackLabel.includes('screen') ||
          trackLabel.includes('display') ||
          streamId.toLowerCase().includes('screen')
        );

      if (isScreenTrack) {
        setRemoteScreenShareStream(streamToUse);
      } else {
        if (!remoteScreenShareStreamIdRef.current || streamId !== remoteScreenShareStreamIdRef.current) {
          remoteStreams.current.set(targetKey, streamToUse);
          setRemoteStreamsState((prev) => ({
            ...prev,
            [targetKey]: streamToUse,
          }));
        }
      }
    };

    peerConnections.current.set(targetKey, pc);
    return pc;
  };

  const initiateOffer = async (targetKey: string | number) => {
    try {
      const pc = createPeerConnection(targetKey);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: 'webrtc_offer',
            target_id: targetKey,
            sender_id: myKey,
            offer: offer,
          })
        );
      }
    } catch (err) {
      console.warn('Error creating WebRTC offer:', err);
    }
  };

  const handleOffer = async (senderKey: string | number, offer: RTCSessionDescriptionInit) => {
    try {
      const pc = createPeerConnection(senderKey);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: 'webrtc_answer',
            target_id: senderKey,
            sender_id: myKey,
            answer: answer,
          })
        );
      }
    } catch (err) {
      console.warn('Error handling WebRTC offer:', err);
    }
  };

  const handleAnswer = async (senderKey: string | number, answer: RTCSessionDescriptionInit) => {
    try {
      const pc = peerConnections.current.get(senderKey);
      if (pc && pc.signalingState !== 'stable') {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    } catch (err) {
      console.warn('Error handling WebRTC answer:', err);
    }
  };

  const handleIceCandidate = async (senderKey: string | number, candidate: RTCIceCandidateInit) => {
    try {
      const pc = peerConnections.current.get(senderKey);
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (err) {
      console.warn('Error adding ICE candidate:', err);
    }
  };

  // Synchronize local stream tracks with all active peer connections
  useEffect(() => {
    if (!stream) return;
    peerConnections.current.forEach((pc) => {
      stream.getTracks().forEach((track) => {
        const senders = pc.getSenders();
        const existingSender = senders.find((s) => s.track?.kind === track.kind);
        if (existingSender) {
          existingSender.replaceTrack(track);
        } else {
          pc.addTrack(track, stream);
        }
      });
    });
  }, [stream]);

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      sender: 'System Bot',
      text: `Welcome to "${meeting.title}". You are logged in as ${displayName}.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isSelf: false,
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Simulated canvas camera stream (fallback when camera unavailable or simulation selected)
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const formattedId = formatMeetingId(meeting.meeting_id);
  const fullInviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/meeting/${meeting.meeting_id}`
    : `/meeting/${meeting.meeting_id}`;

  // Meeting duration timer clock
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    if (hrs > 0) {
      return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Enumerate hardware devices (camera & microphone)
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.mediaDevices?.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        const vDevices = devices.filter((d) => d.kind === 'videoinput');
        const aDevices = devices.filter((d) => d.kind === 'audioinput');

        setVideoDevices(vDevices);
        setAudioDevices(aDevices);

        if (vDevices.length > 0 && !selectedVideoDeviceId) {
          setSelectedVideoDeviceId(vDevices[0].deviceId);
        }
        if (aDevices.length > 0 && !selectedAudioDeviceId) {
          setSelectedAudioDeviceId(aDevices[0].deviceId);
        }
      }).catch(() => {});
    }
  }, [selectedVideoDeviceId, selectedAudioDeviceId]);

  // Request & attach real webcam stream
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    async function initWebcam() {
      if (!isCameraOn || !useRealWebcam) {
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
        return;
      }

      try {
        setWebcamError(null);
        const videoConstraint = selectedVideoDeviceId
          ? { deviceId: { exact: selectedVideoDeviceId } }
          : true;
        const audioConstraint = selectedAudioDeviceId
          ? { deviceId: { exact: selectedAudioDeviceId } }
          : true;

        const constraints: MediaStreamConstraints = {
          video: videoConstraint,
          audio: audioConstraint,
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        currentStream = mediaStream;
        setStream(mediaStream);

        // Control mic audio track state
        mediaStream.getAudioTracks().forEach((track) => {
          track.enabled = isMicOn;
        });

        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err: any) {
        console.warn('Real webcam/mic access error:', err);
        setWebcamError(err.message || 'Camera or microphone permission denied / busy. Using simulation mode.');
        setUseRealWebcam(false); // Fallback to interactive canvas visualizer
      }
    }

    initWebcam();

    return () => {
      if (currentStream) {
        currentStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOn, useRealWebcam, selectedVideoDeviceId, selectedAudioDeviceId]);

  // Update microphone track state when user toggles mute/unmute button
  useEffect(() => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isMicOn;
      });
    }
  }, [isMicOn, stream]);

  // Canvas visualizer rendering for simulated mode or fallback
  useEffect(() => {
    if (!isCameraOn || useRealWebcam || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let step = 0;

    const render = () => {
      step += 0.04;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const bgGrad = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      bgGrad.addColorStop(0, '#0f172a');
      bgGrad.addColorStop(0.5, '#1e1b4b');
      bgGrad.addColorStop(1, '#090d16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const orbX = canvas.width / 2 + Math.sin(step) * 30;
      const orbY = canvas.height / 2 + Math.cos(step * 0.8) * 20;
      const orbGrad = ctx.createRadialGradient(orbX, orbY, 10, orbX, orbY, 180);
      orbGrad.addColorStop(0, 'rgba(59, 130, 246, 0.35)');
      orbGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = orbGrad;
      ctx.beginPath();
      ctx.arc(orbX, orbY, 180, 0, Math.PI * 2);
      ctx.fill();

      if (isMicOn) {
        ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
        const barCount = 12;
        const barWidth = 6;
        const startX = (canvas.width - barCount * 12) / 2;
        for (let i = 0; i < barCount; i++) {
          const h = 10 + Math.sin(step * 4 + i) * 25 + Math.cos(step * 2 + i) * 15;
          ctx.fillRect(startX + i * 12, canvas.height - 40 - h, barWidth, h);
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [isCameraOn, useRealWebcam, isMicOn]);

  // Real Screen Share Handler (Screen Capture API)
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      // Stop active screen share
      if (screenStream) {
        screenStream.getTracks().forEach((track) => track.stop());
        setScreenStream(null);
      }
      setIsScreenSharing(false);

      peerConnections.current.forEach((pc) => {
        pc.getSenders().forEach((sender) => {
          if (
            sender.track &&
            (sender.track.label.toLowerCase().includes('screen') ||
              sender.track.label.toLowerCase().includes('display'))
          ) {
            pc.removeTrack(sender);
          }
        });
      });

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: 'screen_share_stopped',
            sharer_user_id: currentUser?.id,
          })
        );
      }

      participants.forEach((p) => {
        if (p.user_id !== currentUser?.id && p.display_name !== displayName) {
          initiateOffer(p.user_id || p.display_name);
        }
      });
      return;
    }

    try {
      setScreenShareError(null);
      if (typeof window !== 'undefined' && navigator.mediaDevices?.getDisplayMedia) {
        const displayStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });

        setScreenStream(displayStream);
        setIsScreenSharing(true);

        if (screenVideoRef.current) {
          screenVideoRef.current.srcObject = displayStream;
        }

        displayStream.getTracks().forEach((track) => {
          peerConnections.current.forEach((pc) => {
            pc.addTrack(track, displayStream);
          });
        });

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              event: 'screen_share_started',
              sharer_name: displayName,
              sharer_user_id: currentUser?.id,
              sharer_participant_id: participantId,
              screen_stream_id: displayStream.id,
            })
          );
        }

        participants.forEach((p) => {
          if (p.user_id !== currentUser?.id && p.display_name !== displayName) {
            initiateOffer(p.user_id || p.display_name);
          }
        });

        // Listen for when the user clicks browser's native "Stop Sharing" floating bar
        const videoTrack = displayStream.getVideoTracks()[0];
        if (videoTrack) {
          videoTrack.onended = () => {
            setIsScreenSharing(false);
            setScreenStream(null);
            peerConnections.current.forEach((pc) => {
              pc.getSenders().forEach((sender) => {
                if (
                  sender.track &&
                  (sender.track.label.toLowerCase().includes('screen') ||
                    sender.track.label.toLowerCase().includes('display'))
                ) {
                  pc.removeTrack(sender);
                }
              });
            });
            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  event: 'screen_share_stopped',
                  sharer_user_id: currentUser?.id,
                })
              );
            }
          };
        }
      } else {
        setIsScreenSharing(true);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              event: 'screen_share_started',
              sharer_name: displayName,
              sharer_user_id: currentUser?.id,
              sharer_participant_id: participantId,
            })
          );
        }
      }
    } catch (err: any) {
      console.warn('Screen share canceled or failed:', err);
      if (err.name !== 'NotAllowedError') {
        setScreenShareError(err.message || 'Screen sharing failed. Simulation mode active.');
      }
    }
  };

  // Attach stream to screen video element when screenStream updates
  useEffect(() => {
    if (isScreenSharing && screenStream && screenVideoRef.current) {
      screenVideoRef.current.srcObject = screenStream;
    }
  }, [isScreenSharing, screenStream]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleLeaveMeeting = async () => {
    if (stream) stream.getTracks().forEach((track) => track.stop());
    if (screenStream) screenStream.getTracks().forEach((track) => track.stop());
    try {
      await leaveMeeting(meeting.meeting_id, participantId);
    } catch {
      // Ignore error on exit
    }
    router.push('/');
  };

  const handleEndMeeting = async () => {
    if (confirm('Are you sure you want to end this meeting for all participants?')) {
      if (stream) stream.getTracks().forEach((track) => track.stop());
      if (screenStream) screenStream.getTracks().forEach((track) => track.stop());
      try {
        await endMeeting(meeting.meeting_id);
      } catch {
        // Ignore error
      }
      router.push('/');
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const msgText = chatInput.trim();
    const msgId = `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const msgTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newMsg: ChatMessage = {
      id: msgId,
      sender: displayName,
      text: msgText,
      timestamp: msgTimestamp,
      isSelf: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'chat_message',
          message: {
            id: msgId,
            sender: displayName,
            text: msgText,
            timestamp: msgTimestamp,
            sender_user_id: currentUser?.id,
          },
        })
      );
    }
  };

  // Real participants state fetched from DB
  const [participants, setParticipants] = useState<Participant[]>(meeting.participants || []);

  // Notices state for real-time WebSocket events
  const [removedNotice, setRemovedNotice] = useState<string | null>(null);
  const [toastNotice, setToastNotice] = useState<string | null>(null);

  const loadRealParticipants = async () => {
    try {
      const data = await getMeetingParticipants(meeting.meeting_id);
      const activeData = data.filter((p) => !p.left_at && !p.is_removed);
      setParticipants(activeData);

      // Clean up connections for participants who are no longer active
      const activeKeys = new Set(
        activeData.map((p) => String(p.user_id || p.display_name || p.id))
      );
      peerConnections.current.forEach((_, pKey) => {
        if (!activeKeys.has(String(pKey)) && String(pKey) !== String(myKey)) {
          removeParticipantFromState(pKey);
        }
      });
    } catch {
      // Keep existing list on transient fetch error
    }
  };

  useEffect(() => {
    loadRealParticipants();
    const interval = setInterval(loadRealParticipants, 3000);
    return () => clearInterval(interval);
  }, [meeting.meeting_id]);

  // Real-Time WebSocket event listener
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const cleanId = meeting.meeting_id.replace(/\D/g, '');
    const envApiUrl = process.env.NEXT_PUBLIC_API_URL || '';
    let wsUrl: string;

    if (envApiUrl) {
      const cleanApi = envApiUrl.replace(/\/+$/, '');
      const wsBase = cleanApi.replace(/^http/, 'ws');
      wsUrl = cleanApi.endsWith('/api')
        ? `${wsBase}/ws/meetings/${cleanId}`
        : `${wsBase}/api/ws/meetings/${cleanId}`;
    } else {
      const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsHost = window.location.hostname || 'localhost';
      const portStr = wsHost === 'localhost' || wsHost === '127.0.0.1' ? ':8000' : '';
      wsUrl = `${wsProtocol}//${wsHost}${portStr}/api/ws/meetings/${cleanId}`;
    }

    let ws: WebSocket | null = null;
    try {
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        ws?.send(
          JSON.stringify({
            event: 'user_joined',
            sender_id: myKey,
            sender_name: displayName,
          })
        );

        if (isScreenSharing) {
          ws?.send(
            JSON.stringify({
              event: 'screen_share_started',
              sharer_name: displayName,
              sharer_user_id: currentUser?.id,
              sharer_participant_id: participantId,
              screen_stream_id: screenStream?.id,
            })
          );
        }
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          if (data.sender_id && String(data.sender_id) === String(myKey)) {
            return;
          }

          if (data.event === 'user_joined') {
            if (data.sender_id) {
              initiateOffer(data.sender_id);
            }
          } else if (data.event === 'webrtc_offer') {
            if (data.target_id && String(data.target_id) === String(myKey)) {
              handleOffer(data.sender_id, data.offer);
            }
          } else if (data.event === 'webrtc_answer') {
            if (data.target_id && String(data.target_id) === String(myKey)) {
              handleAnswer(data.sender_id, data.answer);
            }
          } else if (data.event === 'webrtc_ice_candidate') {
            if (data.target_id && String(data.target_id) === String(myKey)) {
              handleIceCandidate(data.sender_id, data.candidate);
            }
          } else if (data.event === 'chat_message' && data.message) {
            const isFromSelf =
              data.message.sender_user_id === currentUser?.id || data.message.sender === displayName;
            setMessages((prev) => {
              if (prev.some((m) => m.id === data.message.id)) return prev;
              return [
                ...prev,
                {
                  id: data.message.id,
                  sender: data.message.sender,
                  text: data.message.text,
                  timestamp: data.message.timestamp,
                  isSelf: isFromSelf,
                },
              ];
            });
          } else if (data.event === 'screen_share_started') {
            if (data.sharer_user_id !== currentUser?.id && data.sharer_name !== displayName) {
              remoteScreenShareStreamIdRef.current = data.screen_stream_id || null;
              setRemoteScreenShare({
                isSharing: true,
                sharerName: data.sharer_name,
                sharerUserId: data.sharer_user_id,
                streamId: data.screen_stream_id || null,
              });
              setToastNotice(`${data.sharer_name} started sharing screen`);
              setTimeout(() => setToastNotice(null), 4000);
            }
          } else if (data.event === 'screen_share_stopped') {
            if (data.sharer_user_id !== currentUser?.id) {
              remoteScreenShareStreamIdRef.current = null;
              setRemoteScreenShare({ isSharing: false, sharerName: '', sharerUserId: null, streamId: null });
              setRemoteScreenShareStream(null);
              setToastNotice('Screen sharing ended');
              setTimeout(() => setToastNotice(null), 3000);
            }
          } else if (data.event === 'mute_all') {
            setIsMicOn(false);
            setToastNotice('The meeting host has muted all participants.');
            setTimeout(() => setToastNotice(null), 4000);
          } else if (data.event === 'participant_left' || data.event === 'participant_removed') {
            if (data.user_id) removeParticipantFromState(data.user_id);
            if (data.display_name) removeParticipantFromState(data.display_name);
            if (data.target_user_id) removeParticipantFromState(data.target_user_id);
            if (data.participant_id) removeParticipantFromState(data.participant_id);

            if (data.target_user_id === currentUser?.id || data.participant_id === participantId) {
              setRemovedNotice('You have been removed from the meeting by the host.');
              if (stream) stream.getTracks().forEach((t) => t.stop());
              if (screenStream) screenStream.getTracks().forEach((t) => t.stop());
              setTimeout(() => {
                router.push('/dashboard');
              }, 3000);
            } else {
              loadRealParticipants();
            }
          } else if (data.event === 'participant_joined') {
            loadRealParticipants();
            if (isScreenSharing && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
              wsRef.current.send(
                JSON.stringify({
                  event: 'screen_share_started',
                  sharer_name: displayName,
                  sharer_user_id: currentUser?.id,
                  sharer_participant_id: participantId,
                  screen_stream_id: screenStream?.id,
                })
              );
            }
          }
        } catch {
          // Ignore parse errors
        }
      };
    } catch {
      // Fallback to polling if WebSocket disabled
    }

    return () => {
      if (ws) {
        ws.close();
        wsRef.current = null;
      }
      peerConnections.current.forEach((pc) => pc.close());
      peerConnections.current.clear();
    };
  }, [meeting.meeting_id, currentUser?.id, displayName, participantId, stream, screenStream, router, isScreenSharing]);

  // Determine current user's meeting role
  const myParticipant = participants.find(
    (p) => p.user_id === currentUser?.id || p.display_name === displayName
  );
  const myMeetingRole = myParticipant?.meeting_role || (currentUser?.id === meeting.host_user_id ? 'HOST' : 'PARTICIPANT');

  const canManageRoles =
    myMeetingRole === 'HOST' ||
    myMeetingRole === 'CO_HOST' ||
    currentUser?.account_role === 'OWNER' ||
    currentUser?.account_role === 'ADMIN';

  const handleRoleChange = async (targetParticipant: Participant, newRole: string) => {
    try {
      await updateParticipantRole(meeting.meeting_id, targetParticipant.id, newRole);
      loadRealParticipants();
    } catch (err: any) {
      alert(err.message || 'Failed to update participant role');
    }
  };

  const handleRemoveParticipant = async (targetParticipant: Participant) => {
    if (!confirm(`Are you sure you want to remove ${targetParticipant.display_name} from this meeting?`)) return;
    try {
      await removeParticipant(meeting.meeting_id, targetParticipant.id);
      loadRealParticipants();
    } catch (err: any) {
      alert(err.message || 'Failed to remove participant');
    }
  };

  const handleMuteAll = async () => {
    try {
      await muteAllParticipants(meeting.meeting_id);
      setIsMicOn(false);
      setToastNotice('All participants have been muted.');
      setTimeout(() => setToastNotice(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to mute all participants');
    }
  };

  // Dynamic grid class based on participant count
  const getGridClass = (count: number) => {
    if (count <= 1) return 'grid-cols-1 max-w-3xl mx-auto';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2 max-w-5xl mx-auto';
    if (count <= 4) return 'grid-cols-1 sm:grid-cols-2 max-w-5xl mx-auto';
    if (count <= 6) return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto';
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 max-w-7xl mx-auto';
  };

  const validActiveParticipants = participants.filter((p) => !p.left_at && !p.is_removed);

  const activeParticipantsList = validActiveParticipants.length > 0
    ? validActiveParticipants
    : [
        {
          id: participantId || 1,
          meeting_id: meeting.id,
          user_id: currentUser?.id || 1,
          display_name: displayName,
          meeting_role: myMeetingRole,
          joined_at: new Date().toISOString(),
        } as Participant,
      ];

  return (
    <div className="flex flex-col h-screen w-screen bg-[#070a12] text-white overflow-hidden select-none relative">
      {/* Toast Notification Banner */}
      {toastNotice && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-2xl bg-amber-500/90 text-black font-semibold text-xs shadow-2xl flex items-center gap-2 animate-bounce">
          <AlertCircle className="w-4 h-4 text-black flex-shrink-0" />
          <span>{toastNotice}</span>
        </div>
      )}

      {/* Removed Participant Modal */}
      {removedNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fadeIn">
          <div className="glass-panel w-full max-w-md p-8 rounded-3xl border border-red-500/40 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto animate-pulse">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">{removedNotice}</h3>
            <p className="text-xs text-gray-400">
              You will be redirected back to your dashboard automatically...
            </p>
          </div>
        </div>
      )}

      {/* Top Meeting Header Bar */}
      <header className="h-16 px-6 glass-panel border-b border-gray-800 flex items-center justify-between z-30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-400" />
            <h1 className="font-bold text-base text-gray-100 tracking-tight line-clamp-1 max-w-xs md:max-w-md">
              {meeting.title}
            </h1>
          </div>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-gray-900/80 border border-gray-800 text-xs text-gray-300">
            <span className="text-gray-400">Meeting ID:</span>
            <span className="font-mono font-bold text-blue-400">{formattedId}</span>
            <button
              onClick={handleCopyLink}
              className="p-1 hover:text-white transition-colors ml-1"
              title="Copy meeting link"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
            </button>
          </div>
        </div>

        {/* Timer, Settings & Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            {formatTimer(elapsedSeconds)}
          </div>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors flex items-center gap-1.5 text-xs font-medium border border-gray-800"
            title="Audio & Video Settings"
          >
            <SettingsIcon className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">Settings</span>
          </button>
        </div>
      </header>

      {/* Main Stage & Drawers Layout */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Central Stage / Video Grid */}
        <main className="flex-1 p-4 lg:p-6 flex flex-col justify-center items-center relative overflow-hidden bg-radial from-gray-900 to-[#070a12]">
          {isScreenSharing || remoteScreenShare.isSharing ? (
            /* Active Screen Sharing Feed (Self or Remote Participant/Admin) */
            <div className="w-full h-full glass-card rounded-3xl border border-blue-500/40 p-4 lg:p-6 flex flex-col items-center justify-center relative overflow-hidden bg-black">
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-600/30 backdrop-blur-md text-blue-300 border border-blue-500/40 text-xs font-semibold">
                <Monitor className="w-4 h-4 animate-pulse text-blue-400" />
                <span>{isScreenSharing ? displayName : remoteScreenShare.sharerName} is sharing screen</span>
              </div>

              {isScreenSharing && (
                <button
                  onClick={handleToggleScreenShare}
                  className="absolute top-4 right-4 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-600/80 hover:bg-red-600 text-white text-xs font-bold shadow-lg transition-all"
                >
                  <StopCircle className="w-4 h-4" />
                  <span>Stop Sharing</span>
                </button>
              )}

              {isScreenSharing && screenStream ? (
                <video
                  ref={screenVideoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain rounded-2xl"
                />
              ) : remoteScreenShare.isSharing && (remoteScreenShareStream || (remoteScreenShare.sharerUserId ? remoteStreamsState[remoteScreenShare.sharerUserId] : null)) ? (
                <video
                  ref={(el) => {
                    const activeStr = remoteScreenShareStream || (remoteScreenShare.sharerUserId ? remoteStreamsState[remoteScreenShare.sharerUserId] : null);
                    if (el && activeStr) {
                      el.srcObject = activeStr;
                    }
                  }}
                  autoPlay
                  playsInline
                  className="w-full h-full object-contain rounded-2xl"
                />
              ) : (
                /* Live Presentation Stream / Remote Screen View */
                <div className="text-center space-y-4 max-w-md">
                  <div className="w-20 h-20 rounded-3xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400 shadow-2xl animate-pulse">
                    <Monitor className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-100">Live Presentation Stream</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    {isScreenSharing
                      ? 'Your screen share stream is active and broadcasted to all meeting participants.'
                      : `${remoteScreenShare.sharerName} is currently presenting their screen live to all meeting participants.`}
                  </p>
                </div>
              )}
            </div>
          ) : (
            /* Dynamic Video Grid Layout */
            <div className={`w-full h-full grid gap-4 lg:gap-6 items-center justify-center ${getGridClass(activeParticipantsList.length)}`}>
              {activeParticipantsList.map((p) => {
                const isMe = p.user_id === currentUser?.id || p.display_name === displayName;

                if (isMe) {
                  return (
                    <div
                      key={p.id}
                      className="relative w-full h-full min-h-[240px] glass-card rounded-3xl overflow-hidden border border-gray-800/80 shadow-2xl flex items-center justify-center group bg-black"
                    >
                      {isCameraOn ? (
                        useRealWebcam ? (
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="w-full h-full object-cover transform -scale-x-100"
                          />
                        ) : (
                          <canvas ref={canvasRef} width={640} height={480} className="w-full h-full object-cover" />
                        )
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-2xl border-2 border-white/20">
                            {displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-medium text-gray-400">Camera turned off</span>
                        </div>
                      )}

                      {/* Camera Mode Badge */}
                      {isCameraOn && (
                        <div className="absolute top-4 right-4 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] text-gray-300">
                          <Camera className="w-3 h-3 text-blue-400" />
                          <span>{useRealWebcam ? 'Live Webcam' : 'Simulated Feed'}</span>
                        </div>
                      )}

                      {/* Name Overlay & Microphone Status Badge */}
                      <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-white">
                        <span>{displayName} (You)</span>
                        {isMicOn ? (
                          <div className="flex items-center gap-1 text-emerald-400" title="Microphone Active">
                            <Mic className="w-3.5 h-3.5" />
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-red-400" title="Microphone Muted">
                            <MicOff className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-bold uppercase">Muted</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }

                const rStream = remoteStreamsState[p.user_id] || remoteStreamsState[p.display_name] || remoteStreamsState[p.id];

                return (
                  <div
                    key={p.id}
                    className="relative w-full h-full min-h-[240px] glass-card rounded-3xl overflow-hidden border border-gray-800/80 shadow-2xl flex items-center justify-center group bg-gray-950"
                  >
                    {rStream && rStream.getVideoTracks().length > 0 && rStream.getVideoTracks()[0].enabled ? (
                      <video
                        ref={(vEl) => {
                          if (vEl && rStream) {
                            vEl.srcObject = rStream;
                          }
                        }}
                        autoPlay
                        playsInline
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-950/40 via-gray-900 to-slate-900 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-2xl border-2 border-white/20 relative">
                          {p.display_name.slice(0, 2).toUpperCase()}
                          <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-gray-900 rounded-full" />
                        </div>
                      </div>
                    )}

                    {rStream && (
                      <audio
                        ref={(aEl) => {
                          if (aEl && rStream) {
                            aEl.srcObject = rStream;
                          }
                        }}
                        autoPlay
                      />
                    )}

                    {/* Name & Role Overlay */}
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/60 backdrop-blur-md border border-white/10 text-xs font-medium text-white">
                      <span>{p.display_name}</span>
                      {p.meeting_role === 'HOST' && (
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] font-bold">
                          HOST
                        </span>
                      )}
                      {p.meeting_role === 'CO_HOST' && (
                        <span className="px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 text-[10px] font-bold">
                          CO-HOST
                        </span>
                      )}
                      {p.is_muted ? (
                        <span title="Muted"><MicOff className="w-3.5 h-3.5 text-red-400" /></span>
                      ) : (
                        <span title="Active Mic"><Mic className="w-3.5 h-3.5 text-emerald-400" /></span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>

        {/* Side Drawer: Participants List */}
        {activeTab === 'participants' && (
          <aside className="fixed sm:relative inset-y-0 right-0 z-40 w-full sm:w-80 glass-panel border-l border-gray-800 flex flex-col animate-slideLeft shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-gray-100">
                  Live Participants ({participants.length})
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('none')}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {participants.map((p) => {
                const isMe = p.user_id === currentUser?.id || p.display_name === displayName;

                return (
                  <div
                    key={p.id}
                    className="p-3 rounded-xl bg-gray-900/60 border border-gray-800/80 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 font-semibold flex items-center justify-center border border-blue-500/30">
                          {p.display_name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-200 block">
                            {p.display_name} {isMe && '(You)'}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">
                            Joined {new Date(p.joined_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {p.meeting_role === 'HOST' && (
                          <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold">
                            HOST
                          </span>
                        )}
                        {p.meeting_role === 'CO_HOST' && (
                          <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold">
                            CO-HOST
                          </span>
                        )}
                        {p.meeting_role === 'PARTICIPANT' && (
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/30 text-[10px] font-medium">
                            MEMBER
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Host Management Options */}
                    {canManageRoles && !isMe && p.meeting_role !== 'HOST' && (
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-800/60">
                        <select
                          value={p.meeting_role}
                          onChange={(e) => handleRoleChange(p, e.target.value)}
                          className="py-1 px-2 rounded text-[11px] bg-gray-800 border border-gray-700 text-gray-200 focus:outline-none"
                        >
                          <option value="PARTICIPANT">Set Participant</option>
                          <option value="CO_HOST">Set Co-Host</option>
                        </select>
                        <button
                          onClick={() => handleRemoveParticipant(p)}
                          className="px-2 py-1 rounded bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 text-[11px] font-semibold transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>
        )}

        {/* Side Drawer: In-Meeting Live Chat */}
        {activeTab === 'chat' && (
          <aside className="fixed sm:relative inset-y-0 right-0 z-40 w-full sm:w-80 glass-panel border-l border-gray-800 flex flex-col animate-slideLeft shadow-2xl">
            <div className="p-4 border-b border-gray-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-blue-400" />
                <h3 className="font-bold text-sm text-gray-100">In-Meeting Chat</h3>
              </div>
              <button
                onClick={() => setActiveTab('none')}
                className="p-1 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col space-y-1 ${msg.isSelf ? 'items-end' : 'items-start'}`}
                >
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 px-1">
                    <span className="font-semibold">{msg.sender}</span>
                    <span>{msg.timestamp}</span>
                  </div>
                  <div
                    className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] ${
                      msg.isSelf
                        ? 'bg-blue-600 text-white rounded-tr-none'
                        : 'bg-gray-800 text-gray-200 rounded-tl-none border border-gray-700'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-800 flex gap-2">
              <input
                type="text"
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 px-3 py-2 rounded-xl text-xs glass-input text-white placeholder-gray-500"
              />
              <button
                type="submit"
                className="p-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </aside>
        )}
      </div>

      {/* Modal: Camera & Microphone Hardware Settings */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fadeIn">
          <div className="glass-panel w-full max-w-lg p-6 rounded-3xl border border-gray-800 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Audio & Video Settings</h3>
                  <p className="text-xs text-gray-400">Configure webcam hardware and microphone inputs</p>
                </div>
              </div>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {webcamError && (
              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>{webcamError}</span>
              </div>
            )}

            <div className="space-y-4">
              {/* Toggle Real Webcam vs Simulated Stream */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-900/80 border border-gray-800">
                <div>
                  <h4 className="text-sm font-semibold text-gray-200">Real Camera Stream (`getUserMedia`)</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Use your physical computer webcam feed</p>
                </div>
                <button
                  onClick={() => setUseRealWebcam(!useRealWebcam)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    useRealWebcam ? 'bg-blue-600 justify-end' : 'bg-gray-700 justify-start'
                  }`}
                >
                  <span className="w-4 h-4 rounded-full bg-white shadow-md" />
                </button>
              </div>

              {/* Camera Device Selector */}
              {useRealWebcam && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Select Camera Input Device
                  </label>
                  <select
                    value={selectedVideoDeviceId}
                    onChange={(e) => setSelectedVideoDeviceId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-white bg-gray-900 border border-gray-800"
                  >
                    {videoDevices.length > 0 ? (
                      videoDevices.map((device, idx) => (
                        <option key={device.deviceId || idx} value={device.deviceId}>
                          {device.label || `Camera ${idx + 1}`}
                        </option>
                      ))
                    ) : (
                      <option value="">Default Web Camera</option>
                    )}
                  </select>
                </div>
              )}

              {/* Microphone Device Selector */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Select Microphone (Mike) Input Device
                </label>
                <select
                  value={selectedAudioDeviceId}
                  onChange={(e) => setSelectedAudioDeviceId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input text-white bg-gray-900 border border-gray-800"
                >
                  {audioDevices.length > 0 ? (
                    audioDevices.map((device, idx) => (
                      <option key={device.deviceId || idx} value={device.deviceId}>
                        {device.label || `Microphone ${idx + 1}`}
                      </option>
                    ))
                  ) : (
                    <option value="">Default System Microphone</option>
                  )}
                </select>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-800">
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all shadow-md shadow-blue-600/30"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Floating Control Toolbar */}
      <footer className="h-20 px-4 sm:px-6 glass-panel border-t border-gray-800 flex items-center justify-between z-30">
        {/* Left Info */}
        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
          <Volume2 className="w-4 h-4 text-gray-400" />
          <span>High Definition Audio Stream</span>
        </div>

        {/* Center Control Buttons */}
        <div className="flex items-center gap-2 sm:gap-3 mx-auto md:mx-0 overflow-x-auto py-1">
          {/* Mute Mic */}
          <button
            onClick={() => setIsMicOn(!isMicOn)}
            className={`p-3 sm:p-3.5 rounded-2xl flex items-center gap-2 transition-all font-semibold text-xs ${
              isMicOn
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700'
                : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
            }`}
            title={isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
          >
            {isMicOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5 text-red-400" />}
          </button>

          {/* Toggle Camera */}
          <button
            onClick={() => setIsCameraOn(!isCameraOn)}
            className={`p-3 sm:p-3.5 rounded-2xl flex items-center gap-2 transition-all font-semibold text-xs ${
              isCameraOn
                ? 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700'
                : 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40'
            }`}
            title={isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
          >
            {isCameraOn ? <VideoIcon className="w-5 h-5" /> : <VideoOff className="w-5 h-5 text-red-400" />}
          </button>

          {/* Mute All (Host Control) */}
          {canManageRoles && (
            <button
              onClick={handleMuteAll}
              className="p-3 sm:p-3.5 rounded-2xl flex items-center gap-2 transition-all font-semibold text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
              title="Mute All Participants (Host Control)"
            >
              <MicOff className="w-5 h-5 text-amber-400" />
              <span className="hidden sm:inline">Mute All</span>
            </button>
          )}

          {/* Screen Share */}
          <button
            onClick={handleToggleScreenShare}
            className={`p-3 sm:p-3.5 rounded-2xl flex items-center gap-2 transition-all font-semibold text-xs ${
              isScreenSharing
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700'
            }`}
            title={isScreenSharing ? 'Stop Screen Sharing' : 'Share Screen'}
          >
            <Monitor className="w-5 h-5" />
            <span className="hidden lg:inline">{isScreenSharing ? 'Stop Sharing' : 'Share Screen'}</span>
          </button>

          {/* Participants */}
          <button
            onClick={() => setActiveTab(activeTab === 'participants' ? 'none' : 'participants')}
            className={`p-3 sm:p-3.5 rounded-2xl flex items-center gap-2 transition-all font-semibold text-xs relative ${
              activeTab === 'participants'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700'
            }`}
            title="Participants"
          >
            <Users className="w-5 h-5" />
            <span className="hidden sm:inline">Participants</span>
          </button>

          {/* Chat */}
          <button
            onClick={() => setActiveTab(activeTab === 'chat' ? 'none' : 'chat')}
            className={`p-3 sm:p-3.5 rounded-2xl flex items-center gap-2 transition-all font-semibold text-xs ${
              activeTab === 'chat'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 hover:bg-gray-700 text-gray-100 border border-gray-700'
            }`}
            title="In-Meeting Chat"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden sm:inline">Chat</span>
          </button>

          {/* Leave Button */}
          <button
            onClick={handleLeaveMeeting}
            className="flex items-center gap-2 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-lg shadow-red-600/30 transition-all ml-1"
          >
            <PhoneOff className="w-5 h-5" />
            <span>Leave</span>
          </button>
        </div>

        {/* Right End Call Host Action */}
        <div className="hidden lg:flex items-center gap-2">
          {canManageRoles && (
            <button
              onClick={handleEndMeeting}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-colors"
            >
              End Meeting for All
            </button>
          )}
        </div>
      </footer>
    </div>
  );
}
