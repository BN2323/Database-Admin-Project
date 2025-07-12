import React from 'react'
import { NavLink } from 'react-router-dom'

const Top = () => {
  return (
    <div className='primary-col text-white border-b border-black flex items-center justify-between px-4 py-2.5'>
        <div className='w-full text-center font-bold'>User</div>
        <NavLink className={({isActive}) => `whitespace-nowrap bg-blue-900 text-[12px] py-3 px-10 rounded-[5px] border-2 font-bold border-blue-950 cursor-pointer hover:border-blue-500 hover:bg-blue-800 ${isActive ? 'bg-[#002335]' : '' }`}  to="/user/create" >+ User</NavLink>
    </div>
  )
}

export default Top