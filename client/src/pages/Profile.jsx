import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { UserContext } from '../contexts/UserContext.jsx';
import api from '../api';

// API function to delete the user account
const deleteAccount = async () => {
  await api.delete('/auth/me');
};

export default function Profile() {
  const { user, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: deleteAccount,
    onSuccess: () => {
      logout();
      navigate('/');
      alert('Your account has been successfully deleted.');
    },
    onError: (error) => {
      alert(`Failed to delete account: ${error.response?.data?.error || error.message}`);
    }
  });

  const handleDelete = () => {
    if (window.confirm("Are you absolutely sure you want to delete your account? This will permanently remove all of your data, including your property listings. This action cannot be undone.")) {
      mutation.mutate();
    }
  };

  if (!user) {
    return <div className="text-center p-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">My Profile</h1>
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-gray-600">Name</p>
            <p className="text-lg text-gray-800">{user.name}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Email</p>
            <p className="text-lg text-gray-800">{user.email}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-600">Role</p>
            <p className="text-lg text-gray-800">{user.role}</p>
          </div>
        </div>
      </div>

      <div className="bg-red-50 border-l-4 border-red-500 text-red-800 p-6 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-2">Danger Zone</h2>
        <p className="mb-4">
          Deleting your account is a permanent action. All of your personal information and property listings will be removed forever.
        </p>
        
        <div className="mt-4">
          <button
            onClick={handleDelete}
            disabled={mutation.isPending}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:bg-red-300"
          >
            {mutation.isPending ? 'Deleting Account...' : 'Delete My Account'}
          </button>
        </div>
      </div>
    </div>
  );
}