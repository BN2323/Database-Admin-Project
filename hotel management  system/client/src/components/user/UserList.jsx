import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const UserList = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/user')
      .then(res => setUsers(res.data))
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    console.log(users)
  })

  const deleteUser = async (username, host) => {
    // if (!window.confirm(`Delete user '${username}'@'${host}'?`)) return;
    try {
      await axios.delete(`http://localhost:5000/api/user/delete/${encodeURIComponent(username)}/${encodeURIComponent(host)}`);
      // alert(`User '${username}'@'${host}' deleted.`);
      setUsers(prev => prev.filter(u => !(u.user === username && u.host === host)));
    } catch (error) {
      console.error(error);
      alert('Failed to delete user.');
    }
  };

  return (
    <div className="h-full bg-[#002335] pt-3 px-3 text-white overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">User Management</h2>
      <div className="overflow-x-auto rounded border">
        <table className="min-w-full">
          <thead className="bg-[#002639]">
            <tr>
              <th className="text-left px-4 py-2 border-b">Username</th>
              <th className="text-left px-4 py-2 border-b">Host</th>
              <th className="text-left px-4 py-2 border-b">Role</th>
              <th className="text-left px-4 py-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={`${u.user}@${u.host}`} className="hover:bg-[#002639]">
                <td className="px-4 py-2 border-b">{u.user}</td>
                <td className="px-4 py-2 border-b">{u.host}</td>
                <td className="px-4 py-2 border-b">{u.roles[0] || 'N/A'}</td>
                <td className="px-4 py-2 border-b space-x-2">
                  <Link
                    to={`/user/edit/${encodeURIComponent(u.user)}/${encodeURIComponent(u.host)}`}
                    className="text-white px-4 py-1 rounded border border-green-600 bg-green-700 hover:bg-green-600  hover:border-green-300"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => deleteUser(u.user, u.host)}
                    className="text-white px-4 py-1 rounded border border-red-600 bg-red-700 hover:bg-red-600  hover:border-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
