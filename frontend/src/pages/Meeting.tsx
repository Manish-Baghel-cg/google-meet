import { useState } from 'react';
import { VideoCall } from '../components/VideoCall';
import { useAuth } from '../hooks/useAuth';

export const Meeting: React.FC = () => {
  const { user } = useAuth();
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#1a202c' }}>
      <div className="flex-none p-4 bg-gray-800">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Meeting Room</h1>
          <div className="text-sm">Logged in as: {user?.name}</div>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <VideoCall />
      </div>

      <div className="flex-none p-4 bg-gray-800">
        <div className="flex justify-center space-x-4">
          <button
            onClick={toggleMute}
            className={`p-4 rounded-full ${
              isMuted ? 'bg-red-500' : 'bg-gray-700'
            }`}
          >
            {isMuted ? 'Unmute' : 'Mute'}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              isVideoOff ? 'bg-red-500' : 'bg-gray-700'
            }`}
          >
            {isVideoOff ? 'Start Video' : 'Stop Video'}
          </button>
          <button className="p-4 rounded-full bg-red-500">End Call</button>
        </div>
      </div>
    </div>
  );
}; 