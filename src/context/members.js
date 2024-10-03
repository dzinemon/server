import React, { createContext, useState, useContext, useEffect } from 'react'
import { baseUrl } from '../../utils/config'
import toast from 'react-hot-toast'

const MembersContext = createContext()

export const MembersProvider = ({ children }) => {
  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const membersUrl = `${baseUrl}/api/members`

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentMember, setCurrentMember] = useState(null)

  const fetchMembers = async () => {
    try {
      setLoading(true)
      const res = await fetch(membersUrl, { next: { revalidate: 86400 } })
      const members = await res.json()
      setMembers(members)
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleMemberDelete = async (id) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/members/${id}`, {
        method: 'DELETE',
        headers: myHeaders,
      })
      const data = await res.json()
      const updatedMembers = members.filter((member) => member.id !== id)
      setMembers(updatedMembers)
      // console.log(data);
      toast.success('Member deleted', {
        icon: '🗑️',
        duration: 2500,
      })
    } catch (error) {
      console.error('Error deleting member:', error)
      toast.error('Error deleting member', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMemberUpdate = async (id, data) => {
    // data is Id name and content

    try {
      setLoading(true)
      const res = await fetch(`/api/members/${id}`, {
        method: 'PUT',
        headers: myHeaders,
        body: JSON.stringify(data),
      })
      const updatedMember = await res.json()
      const updatedMembers = members.map((member) =>
        member.id === id ? updatedMember : member
      )
      setMembers(updatedMembers)

      toast.success('Member updated', {
        icon: '🔄',
        duration: 2500,
      })
    } catch (error) {
      console.error('Error updating member:', error)
      toast.error('Error updating member', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleMemberAdd = async (data) => {
    try {
      setLoading(true)
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: myHeaders,
        body: JSON.stringify(data),
      })
      const newMember = await res.json()
      setMembers([...members, newMember])
      toast.success('Member added', {
        icon: '🎉',
        duration: 2500,
      })
    } catch (error) {
      console.error('Error adding member:', error)
      toast.error('Error adding member', {
        icon: '❌',
        duration: 2500,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <MembersContext.Provider
      value={{
        members,
        loading,
        fetchMembers,
        currentMember,
        setCurrentMember,
        handleMemberDelete,
        handleMemberUpdate,
        handleMemberAdd,
      }}
    >
      {children}
    </MembersContext.Provider>
  )
}

export const useMembers = () => {
  const context = useContext(MembersContext)
  if (context === undefined) {
    throw new Error('useMembers must be used within a MembersProvider')
  }
  return context
}
