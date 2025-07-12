import { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Select from 'react-select';

const AVAILABLE_PRIVILEGES = [
  "SELECT", "INSERT", "UPDATE", "DELETE",
  "CREATE", "DROP", "ALTER", "INDEX",
  "EXECUTE", "TRIGGER", "REFERENCES",
  "ALL PRIVILEGES"
];

export default function EditRole() {
  const { role_name } = useParams();
  const navigate = useNavigate();

  const [role, setRole] = useState(role_name);
  const [newRoleName, setNewRoleName] = useState(role_name);
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [withGrantOption, setWithGrantOption] = useState(false);
  const [tableOptions, setTableOptions] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/tables').then(res => {
      const options = res.data.map(tbl => ({
        value: tbl.TABLE_NAME,
        label: tbl.TABLE_NAME
      }));
      setTableOptions([{ value: '*', label: '* (All Tables)' }, ...options]);
    });

    // Optional: Preload current grants (if stored or parsed)
    // If you have a route like GET /api/role/:name → fetch current privileges/tables
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`http://localhost:5000/api/role/edit/${role}`, {
        newRoleName,
        privileges: selectedPrivileges,
        tables: selectedTables.map(t => t.value),
        withGrantOption
      });

      alert('Role updated successfully!');
      navigate('/role');
    } catch (err) {
      console.error(err);
      alert('Update failed: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="bg-[#002335] min-h-screen flex flex-col justify-center items-center p-6 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-lg primary-col rounded p-6">
        <h2 className="text-xl font-bold text-center mb-2">Edit Role</h2>
        <input
          type="text"
          placeholder="New role name"
          value={newRoleName}
          onChange={e => setNewRoleName(e.target.value)}
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
                onClick={() =>
                  setSelectedPrivileges(prev =>
                    selected ? prev.filter(p => p !== priv) : [...prev, priv]
                  )
                }
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
          className="w-full bg-[#002335] border-2 border-blue-500 text-white font-bold py-3 rounded hover:bg-blue-950 hover:border-blue-700"
        >
          Update Role
        </button>
      </form>
    </div>
  );
}
