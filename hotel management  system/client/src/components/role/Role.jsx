import React from 'react';
import Top from './Top'; // optional top bar
import RoleList from './RoleList';

const Role = () => {
  return (
    <div className='flex flex-col h-full'>
      <Top />
      <RoleList />
    </div>
  );
};

export default Role;
