import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function EditUser() {
  const { username, host } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    newUsername: '',
    newPassword: '',
    newRole: ''
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/role')
      .then(res => setRoles(res.data))
      .catch(err => console.error('Error fetching roles:', err));

    axios.get(`http://localhost:5000/api/user`)
      .then(res => {
        const currentUser = res.data.find(u => u.user === username && u.host === host);
        if (currentUser) {
          setForm({
            newUsername: currentUser.user,
            newPassword: '',
            newRole: currentUser.roles[0] || ''
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching user data:', err);
        setLoading(false);
      });
  }, [username, host]);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(
        `http://localhost:5000/api/user/edit/${encodeURIComponent(username)}/${encodeURIComponent(host)}`,
        form,
        { headers: { 'Content-Type': 'application/json' } }
      );

      alert('User updated successfully!');
      navigate('/user');
    } catch (error) {
      alert(
        'Failed to update user: ' +
          (error.response?.data?.message || error.message)
      );
    }
  };

  if (loading) return <div className='text-white p-4'>Loading...</div>;

  return (
    <div className='bg-[#002335] h-full flex justify-center items-center'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-1 w-[500px] px-6 py-7 rounded-[5px] bg-[#004A71] text-white'>
        <h2 className="text-xl font-bold text-center mb-2">Edit User</h2>
        <div className='flex flex-col gap-1'>
          <label htmlFor="newUsername" className='ml-1'>New Username:</label>
          <input
            className='border-2 rounded py-2 px-1 focus:outline-none bg-[#136D9B]'
            name="newUsername"
            value={form.newUsername}
            onChange={handleChange}
            placeholder="New Username"
            required
          />
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor="newPassword" className='ml-1'>New Password:</label>
          <input
            className='border-2 rounded py-2 px-1 focus:outline-none bg-[#136D9B]'
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="New Password"
          />
        </div>

        <div className='flex flex-col gap-1'>
          <label htmlFor="newRole" className='ml-1'>New Role:</label>
          <select
            className='border-2 rounded py-2 px-1 focus:outline-none bg-[#136D9B]'
            name="newRole"
            value={form.newRole}
            onChange={handleChange}
          >
            <option value="">Select Role</option>
            {roles.map(role => (
              <option key={role.role_id} value={role.role_name}>{role.role_name}</option>
            ))}
          </select>
        </div>

        <button
          className='border-2 border-blue-500 py-3 mt-3 text-white cursor-pointer font-bold bg-[#002335] hover:bg-blue-950 hover:border-blue-700'
          type="submit"
        >
          Update User
        </button>
      </form>
    </div>
  );
}
