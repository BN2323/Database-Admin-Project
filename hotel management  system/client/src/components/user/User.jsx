import React from 'react'
import Top from './Top'
import UserList from './UserList'

const User = () => {
  return (
    <div className='flex flex-col h-full'>
      <Top/>
      <UserList/>
    </div>

  )
}

export default User