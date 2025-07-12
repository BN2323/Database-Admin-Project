import React from 'react'
import { NavLink, Link } from 'react-router-dom'

const SideBar = () => {
  return (
    <nav className='primary-col flex flex-col px-1 w-[300px] h-screen text-white border-r border-gray-900'>
        <div className='border-b border-gray-900 flex justify-center items-center py-[20.5px]'>
            <Link to="/"><h1 className='text-[16px] font-bold'>RBAC MANAGEMENT</h1></Link>
        </div>
        <div className='flex flex-col'>
            <NavLink className={({isActive}) => `py-3 px-5 w-full cursor-pointer hover:bg-[#002335] ${isActive ? 'bg-[#002335]' : '' }`} to="/" style={{ marginRight: '10px' }}>🏠  Home</NavLink>
            <NavLink className={({isActive}) => `py-3 px-5 w-full cursor-pointer hover:bg-[#002335] ${isActive ? 'bg-[#002335]' : '' }`} to="/role" style={{ marginRight: '10px' }}>👤  Manage Users</NavLink>
            <NavLink className={({isActive}) => `py-3 px-5 w-full cursor-pointer hover:bg-[#002335] ${isActive ? 'bg-[#002335]' : '' }`}  to="/user" style={{ marginRight: '10px' }}>🛡️  Manage Roles</NavLink>
            <NavLink className={({isActive}) => `py-3 px-5 w-full cursor-pointer hover:bg-[#002335] ${isActive ? 'bg-[#002335]' : '' }`}  to="/backup" style={{ marginRight: '10px' }}>💾  Backup & Recovery</NavLink>
        </div>
    </nav>
  )
}

export default SideBar