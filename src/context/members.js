import React, { createContext, useState, useContext, useEffect } from 'react';
import { baseUrl } from '../../utils/config';

const MembersContext = createContext();

export const MembersProvider = ({ children }) => {
  const membersUrl = `${baseUrl}/api/members`;

  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMember, setCurrentMember] = useState(null);

  const fetchMembers = async () => {
    setLoading(true);
    const res = await fetch(membersUrl, { next: { revalidate: 86400 } });
    const members = await res.json();
    setMembers(members);
    setLoading(false);
  };

  return (
    <MembersContext.Provider value={{ members, loading, fetchMembers, currentMember, setCurrentMember }}>
      {children}
    </MembersContext.Provider>
  );
};

export const useMembers = () => {
  const context = useContext(MembersContext);
  if (context === undefined) {
    throw new Error('useMembers must be used within a MembersProvider');
  }
  return context;
};
