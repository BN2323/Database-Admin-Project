import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import User from './components/user/User';
import CreateUser from './components/user/CreateUser';
import EditUser from './components/user/EditUser';

import Role from './components/role/Role';
import CreateRole from './components/role/CreateRole';
// import EditRole from './components/role/EditRole'; // If you make this later

import SideBar from './components/SideBar';
import BackupManager from './components/backup&reovery/backup';
import EditRole from './components/role/EditRole';
import HomePage from './components/home';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen">
        <SideBar />

        <div className="w-full overflow-y-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            {/* User Routes */}
            <Route path="/user" element={<User />} />
            <Route path="/user/create" element={<CreateUser />} />
            <Route path="/user/edit/:username/:host" element={<EditUser />} />

            {/* Role Routes */}
            <Route path="/role" element={<Role />} />
            <Route path="/role/create" element={<CreateRole />} />
            <Route path="/role/edit/:role_name" element={<EditRole />} />
            {/* <Route path="/role/:id/edit" element={<EditRole />} /> */}

            {/* Backup and Recovery Routes */}
            <Route path="/backup" element={<BackupManager/>} />

            {/* Fallback */}
            <Route path="*" element={<div className="p-4 text-white">Welcome! Use the sidebar to navigate.</div>} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
