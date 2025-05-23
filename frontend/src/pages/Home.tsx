import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const Home: React.FC = () => {
  const [meetingTitle, setMeetingTitle] = useState('');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const createMeeting = () => {
    const meetingId = Math.random().toString(36).substring(7);
    navigate(`/meeting/${meetingId}`);
  };

  const joinMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (meetingTitle) {
      navigate(`/meeting/${meetingTitle}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Google Meet Clone</h1>
          <div className="flex items-center space-x-4">
            <span>Welcome, {user?.name}</span>
            <button
              onClick={logout}
              className="bg-red-500 px-4 py-2 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Start a new meeting</h2>
            <button
              onClick={createMeeting}
              className="w-full bg-blue-500 py-3 rounded hover:bg-blue-600"
            >
              Create Meeting
            </button>
          </div>

          <div className="bg-gray-800 p-6 rounded-lg">
            <h2 className="text-xl font-semibold mb-4">Join a meeting</h2>
            <form onSubmit={joinMeeting}>
              <input
                type="text"
                value={meetingTitle}
                onChange={(e) => setMeetingTitle(e.target.value)}
                placeholder="Enter meeting ID"
                className="w-full p-3 rounded bg-gray-700 mb-4"
              />
              <button
                type="submit"
                className="w-full bg-green-500 py-3 rounded hover:bg-green-600"
              >
                Join Meeting
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}; 