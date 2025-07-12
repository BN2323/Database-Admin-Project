import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function CreateDBUser() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '',
    password: '',
    host: 'localhost',
    role: ''
  });

  const [roles, setRoles] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/role')
      .then(res => setRoles(res.data))
      .catch(err => console.error('Error fetching roles:', err));
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Step 1: Create the user
      await axios.post('http://localhost:5000/api/user/create', {
        username: form.username,
        password: form.password,
        host: form.host
      });

      // Step 2: Grant role
      await axios.post('http://localhost:5000/api/user/grant-role', {
        username: form.username,
        role: form.role,
        host: form.host
      });

      alert(`User '${form.username}' created and granted role '${form.role}'`);
      navigate('/user');
    } catch (err) {
      console.error('Error:', err);
      alert('Failed to create user or assign role: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className='bg-[#002335] h-full flex justify-center items-center'>
      <form onSubmit={handleSubmit} className='flex flex-col gap-3 w-[400px] px-6 py-7 rounded bg-[#004A71] text-white'>
        <h2 className="text-xl font-bold text-center mb-2">Create DB User</h2>

        <div className='flex flex-col'>
          <label>Username</label>
          <input
            className='rounded py-2 px-2 bg-[#136D9B] focus:outline-none'
            name="username"
            value={form.username}
            onChange={handleChange}
            required
          />
        </div>

        <div className='flex flex-col'>
          <label>Password</label>
          <input
            className='rounded py-2 px-2 bg-[#136D9B] focus:outline-none'
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className='flex flex-col'>
          <label>Host</label>
          <input
            className='rounded py-2 px-2 bg-[#136D9B] focus:outline-none'
            name="host"
            value={form.host}
            onChange={handleChange}
            placeholder="localhost"
          />
        </div>

        <div className='flex flex-col'>
          <label>Select Role</label>
          <select
            className='rounded py-2 px-2 bg-[#136D9B] focus:outline-none'
            name="role"
            value={form.role}
            onChange={handleChange}
            required
          >
            <option value="">Choose a role</option>
            {roles.map(role => (
              <option key={role.role_name} value={role.role_name}>{role.role_name}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className='py-2 bg-[#002335] border border-blue-500 hover:bg-blue-900 mt-3 font-semibold'
        >
          Create & Assign Role
        </button>
      </form>
    </div>
  );
}
