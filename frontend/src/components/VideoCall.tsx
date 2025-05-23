import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useParams } from 'react-router-dom';

interface PeerConnection {
  [key: string]: RTCPeerConnection;
}

export const VideoCall: React.FC = () => {
  const { meetingId } = useParams();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<{ [key: string]: MediaStream }>({});
  const peerConnections = useRef<PeerConnection>({});
  const socketRef = useRef<Socket>();
  const localVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { min: 1280, ideal: 1280, max: 1920 },
            height: { min: 720, ideal: 720, max: 1080 }
          },
          audio: true,
        });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.onloadedmetadata = () => {
            console.log(
              'Actual video size:',
              localVideoRef.current?.videoWidth,
              'x',
              localVideoRef.current?.videoHeight
            );
          };
        }
      } catch (error) {
        console.error('Error accessing media devices:', error);
      }
    };

    initializeMedia();

    socketRef.current = io('https://free-peaches-feel.loca.lt', {
      withCredentials: true,
    });

    socketRef.current.emit('join-room', meetingId);

    socketRef.current.on('user-joined', ({ userId }) => {
      createPeerConnection(userId);
    });

    socketRef.current.on('offer', async ({ offer, from }) => {
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socketRef.current?.emit('answer', { target: from, answer });
    });

    socketRef.current.on('answer', async ({ answer, from }) => {
      const pc = peerConnections.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socketRef.current.on('ice-candidate', async ({ candidate, from }) => {
      const pc = peerConnections.current[from];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socketRef.current.on('user-left', ({ userId }) => {
      if (peerConnections.current[userId]) {
        peerConnections.current[userId].close();
        delete peerConnections.current[userId];
      }
      setRemoteStreams((prev) => {
        const newStreams = { ...prev };
        delete newStreams[userId];
        return newStreams;
      });
    });

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      socketRef.current?.disconnect();
    };
  }, [meetingId]);

  const createPeerConnection = (userId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    localStream?.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => ({
        ...prev,
        [userId]: event.streams[0],
      }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('ice-candidate', {
          target: userId,
          candidate: event.candidate,
        });
      }
    };

    peerConnections.current[userId] = pc;
    return pc;
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black', borderRadius: '0.5rem' }}
        />
        <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>
          You
        </div>
      </div>
      {Object.entries(remoteStreams).map(([userId, stream]) => (
        <div key={userId} style={{ flex: 1, minWidth: 0, height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
          <video
            autoPlay
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'contain', background: 'black', borderRadius: '0.5rem' }}
            ref={(video) => {
              if (video) video.srcObject = stream;
            }}
          />
          <div style={{ position: 'absolute', bottom: 8, left: 8, background: 'rgba(0,0,0,0.5)', color: 'white', padding: '2px 8px', borderRadius: '4px' }}>
            User {userId}
          </div>
        </div>
      ))}
    </div>
  );
}; 