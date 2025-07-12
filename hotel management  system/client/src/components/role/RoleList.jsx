import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const RoleList = () => {
  const [roles, setRoles] = useState([]);
  const [privilegesMap, setPrivilegesMap] = useState({});
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const systemRoles = ['mysql.session', 'mysql.infoschema', 'mysql.sys', 'root'];

  useEffect(() => {
    const fetchRolesAndPrivileges = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/role');
        const filteredRoles = res.data.filter(role => !systemRoles.includes(role.role_name));
        setRoles(filteredRoles);

        const privilegesResponses = await Promise.all(
          filteredRoles.map(role =>
            axios
              .get(`http://localhost:5000/api/role/${role.role_name}/privileges?host=${encodeURIComponent(role.host)}`)
              .then(res => ({ role: role.role_name, privileges: res.data }))
              .catch(() => ({ role: role.role_name, privileges: [] }))
          )
        );

        const map = {};
        privilegesResponses.forEach(({ role, privileges }) => {
          map[role] = privileges;
        });

        setPrivilegesMap(map);
        setLoading(false);
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to fetch roles');
        setLoading(false);
      }
    };

    fetchRolesAndPrivileges();
  }, []);

  const handleDelete = async (roleName) => {
    const confirmed = window.confirm(`Are you sure you want to delete role "${roleName}"?`);

    if (!confirmed) return;

    try {
      await axios.delete(`http://localhost:5000/api/role/delete/${encodeURIComponent(roleName)}`);
      alert(`Role "${roleName}" deleted successfully.`);
      
      setRoles(prev => prev.filter(role => role.role_name !== roleName));
      closeModal();
    } catch (error) {
      console.error('Failed to delete role:', error);
      alert(
        'Failed to delete role: ' +
        (error.response?.data?.message || error.message)
      );
    }
  };

  const closeModal = () => setSelectedRole(null);

  if (loading) return <div className="text-white p-4">Loading roles...</div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="h-full bg-[#002335] pt-3 px-3 text-white overflow-y-auto">
      <h2 className="text-xl font-bold mb-4">MySQL Roles</h2>
      <div className="grid grid-cols-5 gap-5 place-items-center">
        {roles.map((role, idx) => (
          <div
            key={idx}
            onClick={() => setSelectedRole(role)}
            className="cursor-pointer hover:bg-[#136D9B] rounded-lg p-4 shadow border hover:shadow-lg transition w-full"
          >
            <h3 className="text-lg font-semibold mb-2">
              Role: <span className="text-yellow-300">{role.role_name}</span>
            </h3>
            <p className="text-sm text-gray-200">Host: <span className="text-white">{role.host}</span></p>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {selectedRole && (
        <div className="fixed inset-0 bg-black/70 bg-opacity-30 flex justify-center items-center z-50">
          <div className="primary-col text-white p-6 rounded-lg w-full max-w-md shadow-xl relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-red-600"
            >
              ✖
            </button>

            <h3 className="text-xl font-bold mb-2 text-center">Role Details</h3>
            <p className="mb-1"><strong>Role:</strong> {selectedRole.role_name}</p>
            <p className="mb-2"><strong>Host:</strong> {selectedRole.host}</p>

            <p className="font-semibold mb-1">Privileges:</p>
            {privilegesMap[selectedRole.role_name]?.length ? (
              <ul className="list-disc ml-5 text-sm max-h-40 overflow-y-auto mb-3">
                {privilegesMap[selectedRole.role_name].map((priv, idx) => (
                  <li key={idx}>{priv}</li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-red-500">No privileges assigned.</p>
            )}

            <div className="flex justify-center gap-5 mt-4">
              <Link to ={`/role/edit/${selectedRole.role_name}`} >
                <button className="text-white px-4 py-1 rounded border border-green-600 bg-green-700 hover:bg-green-600  hover:border-green-300">
                  Edit
                </button>
              </Link>
              <button className="text-white px-4 py-1 rounded border border-red-600 bg-red-700 hover:bg-red-600  hover:border-red-300"
              onClick={() => handleDelete(selectedRole.role_name)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleList;
