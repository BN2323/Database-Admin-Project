import { Link } from 'react-router-dom';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#001f2f] to-[#00334d] flex items-center justify-center px-4">
      <div className="max-w-3xl w-full bg-white/5 backdrop-blur-md border border-white/10 text-white p-10 rounded-2xl shadow-2xl text-center">
        <h1 className="text-4xl font-extrabold mb-4 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent drop-shadow">
          MySQL Admin Dashboard
        </h1>
        <p className="text-gray-300 mb-10 text-sm sm:text-base">
          Seamlessly manage your users, roles, and backup operations from one beautiful place.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Link to="/user">
            <div className="group p-5 rounded-xl bg-[#0e3a59] border border-[#2563eb] hover:bg-[#1e40af] transition-all shadow-md cursor-pointer">
              <div className="text-3xl mb-2 group-hover:scale-110 transition">👤</div>
              <div className="text-sm font-semibold">Manage Users</div>
            </div>
          </Link>
          <Link to="/role">
            <div className="group p-5 rounded-xl bg-[#432b6b] border border-purple-600 hover:bg-purple-700 transition-all shadow-md cursor-pointer">
              <div className="text-3xl mb-2 group-hover:scale-110 transition">🛡️</div>
              <div className="text-sm font-semibold">Manage Roles</div>
            </div>
          </Link>
          <Link to="/backup">
            <div className="group p-5 rounded-xl bg-[#0f5132] border border-green-600 hover:bg-green-700 transition-all shadow-md cursor-pointer">
              <div className="text-3xl mb-2 group-hover:scale-110 transition">💾</div>
              <div className="text-sm font-semibold">Backup & Recovery</div>
            </div>
          </Link>
        </div>

        <div className="mt-10 text-gray-500 text-xs">
          © {new Date().getFullYear()} MySQL Manager. Crafted with care.
        </div>
      </div>
    </div>
  );
}
    