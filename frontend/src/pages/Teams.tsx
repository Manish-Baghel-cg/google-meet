import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Team {
  id: number;
  name: string;
  description: string;
  createdAt: string;
}

export const Teams: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamDescription, setNewTeamDescription] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      const response = await fetch('https://my-meet-124v.onrender.com/teams', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const createTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://my-meet-124v.onrender.com/teams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          name: newTeamName,
          description: newTeamDescription
        })
      });
      if (response.ok) {
        setNewTeamName('');
        setNewTeamDescription('');
        fetchTeams();
      }
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Teams</h1>

        {/* Create Team Form */}
        <div className="bg-gray-800 p-6 rounded-lg mb-8">
          <h2 className="text-xl font-semibold mb-4">Create New Team</h2>
          <form onSubmit={createTeam}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Team Name</label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Description</label>
              <textarea
                value={newTeamDescription}
                onChange={(e) => setNewTeamDescription(e.target.value)}
                className="w-full p-3 rounded bg-gray-700"
                rows={3}
              />
            </div>
            <button
              type="submit"
              className="bg-blue-500 px-4 py-2 rounded hover:bg-blue-600"
            >
              Create Team
            </button>
          </form>
        </div>

        {/* Teams List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {teams.map((team) => (
            <div key={team.id} className="bg-gray-800 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">{team.name}</h3>
              <p className="text-gray-400 mb-4">{team.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  Created: {new Date(team.createdAt).toLocaleDateString()}
                </span>
                <button className="bg-green-500 px-4 py-2 rounded hover:bg-green-600">
                  Join Team
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 