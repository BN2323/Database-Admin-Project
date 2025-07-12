import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Select from 'react-select';
import { useNavigate } from 'react-router-dom';

const AVAILABLE_PRIVILEGES = [
  "SELECT", "INSERT", "UPDATE", "DELETE",
  "CREATE", "DROP", "ALTER", "INDEX",
  "EXECUTE", "TRIGGER", "REFERENCES",
  "ALL PRIVILEGES"
];

export default function CreateRoleAndGrant() {
  const navigate = useNavigate();
  const [roleName, setRoleName] = useState('');
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [withGrantOption, setWithGrantOption] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableOptions, setTableOptions] = useState([]);

  // Fetch tables from current DB
  useEffect(() => {
    axios.get('http://localhost:5000/api/tables')
      .then(res => {
        const options = res.data.map(tbl => ({
          value: tbl.TABLE_NAME,
          label: tbl.TABLE_NAME
        }));
        setTableOptions([{ value: '*', label: '* (All Tables)' }, ...options]);
      })
      .catch(err => {
        console.error("Failed to fetch tables", err);
      });
  }, []);

  const togglePrivilege = (priv) => {
    setSelectedPrivileges(prev =>
      prev.includes(priv) ? prev.filter(p => p !== priv) : [...prev, priv]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      alert('Role name is required');
      return;
    }

    if (selectedPrivileges.length === 0) {
      alert('Select at least one privilege');
      return;
    }

    if (selectedTables.length === 0) {
      alert('Select at least one table');
      return;
    }

    setLoading(true);
    try {
      // Create the role
      await axios.post('http://localhost:5000/api/role/create', {
        role_name: roleName.trim(),
      });

      // Grant for each selected table
      await axios.post('http://localhost:5000/api/role/grant-privileges', {
        role: roleName.trim(),
        privileges: selectedPrivileges,
        tables: selectedTables.map(t => t.value),  // ⬅️ array of table names
        withGrantOption
      });

      console.log(selectedPrivileges);

      alert('Role created and privileges granted!');
      setRoleName('');
      setSelectedPrivileges([]);
      setSelectedTables([]);
      setWithGrantOption(false);
      navigate('/role');
    } catch (error) {
      alert('Error: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
    
  };

  return (
    <div className="bg-[#002335] min-h-screen flex flex-col justify-center items-center p-6 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-lg primary-col rounded p-6">
        <h2 className="text-xl font-bold text-center mb-2">Create Role</h2>
        <input
          type="text"
          placeholder="Role name"
          value={roleName}
          onChange={e => setRoleName(e.target.value)}
          className="w-full mb-4 p-3 rounded text-black bg-[#136D9B] focus:outline-none"
          required
        />

        <div className="mb-4">
          <label className="text-white font-semibold block mb-1">Select Table(s)</label>
          <Select
            options={tableOptions}
            isMulti
            value={selectedTables}
            onChange={setSelectedTables}
            placeholder="Select table(s)..."
            className="text-black"
          />
        </div>

        <div className="text-white font-semibold mb-2">Select Privileges:</div>
        <div className="grid grid-cols-3 gap-3 max-h-48 overflow-y-auto mb-6">
          {AVAILABLE_PRIVILEGES.map(priv => {
            const selected = selectedPrivileges.includes(priv);
            return (
              <div
                key={priv}
                role="checkbox"
                aria-checked={selected}
                tabIndex={0}
                onClick={() => togglePrivilege(priv)}
                onKeyDown={e => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    togglePrivilege(priv);
                  }
                }}
                className={`cursor-pointer select-none rounded-lg py-2 px-3 text-center
                  ${selected ? 'bg-blue-700 border-2 border-blue-400' : 'bg-[#0F4A72] border border-transparent'}
                  hover:bg-blue-600
                  transition-colors duration-200
                  text-white
                `}
              >
                {priv}
              </div>
            );
          })}
        </div>

        <label className="flex items-center gap-2 mb-6 text-white">
          <input
            type="checkbox"
            checked={withGrantOption}
            onChange={e => setWithGrantOption(e.target.checked)}
          />
          <span>With GRANT OPTION</span>
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#002335] border-2 border-blue-500 text-white font-bold py-3 rounded hover:bg-blue-950 hover:border-blue-700"
        >
          {loading ? 'Processing...' : 'Create Role & Grant Privileges'}
        </button>
      </form>
    </div>
  );
}
