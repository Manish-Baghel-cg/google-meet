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
    if (!meetingId) {
      console.error('No meeting ID provided');
      return;
    }

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

    socketRef.current = io('https://my-meet-124v.onrender.com', {
      withCredentials: true,
      auth: {
        token: localStorage.getItem('token')
      }
    });

    const numericMeetingId = parseInt(meetingId);
    if (isNaN(numericMeetingId)) {
      console.error('Invalid meeting ID');
      return;
    }

    console.log('Joining meeting:', numericMeetingId);
    socketRef.current.emit('joinMeeting', numericMeetingId);

    socketRef.current.on('participantJoined', ({ userId }) => {
      console.log('Participant joined:', userId);
      createPeerConnection(userId);
    });

    socketRef.current.on('offer', async ({ offer, from }) => {
      console.log('Received offer from:', from);
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      console.log('Sending answer to:', from);
      socketRef.current?.emit('answer', { target: from, answer });
    });

    socketRef.current.on('answer', async ({ answer, from }) => {
      console.log('Received answer from:', from);
      const pc = peerConnections.current[from];
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    socketRef.current.on('ice-candidate', async ({ candidate, from }) => {
      console.log('Received ICE candidate from:', from);
      const pc = peerConnections.current[from];
      if (pc) {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      }
    });

    socketRef.current.on('participantLeft', ({ userId }) => {
      console.log('Participant left:', userId);
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

    socketRef.current.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    socketRef.current.on('error', (error) => {
      console.error('Socket error:', error);
    });

    return () => {
      localStream?.getTracks().forEach((track) => track.stop());
      Object.values(peerConnections.current).forEach((pc) => pc.close());
      socketRef.current?.disconnect();
    };
  }, [meetingId]);

  const createPeerConnection = (userId: string) => {
    console.log('Creating peer connection for:', userId);
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
      console.log('Received track from:', userId);
      setRemoteStreams((prev) => ({
        ...prev,
        [userId]: event.streams[0],
      }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate to:', userId);
        socketRef.current?.emit('ice-candidate', {
          target: userId,
          candidate: event.candidate,
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('ICE connection state:', pc.iceConnectionState);
    };

    // Create and send offer
    pc.createOffer()
      .then(offer => pc.setLocalDescription(offer))
      .then(() => {
        console.log('Sending offer to:', userId);
        socketRef.current?.emit('offer', {
          target: userId,
          offer: pc.localDescription
        });
      })
      .catch(error => console.error('Error creating offer:', error));

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