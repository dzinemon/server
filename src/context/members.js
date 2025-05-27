import { createContext, useContext, useState } from 'react'
import toast from 'react-hot-toast'
import { baseUrl } from '../../utils/config'

const MembersContext = createContext()

export const MembersProvider = ({ children }) => {
  const myHeaders = new Headers()
  myHeaders.append('Content-Type', 'application/json')

  const membersUrl = `${baseUrl}/api/members`

  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(false)
  const [currentMember, setCurrentMember] = useState(null)
  const [fetchedMembers, setFetchedMembers] = useState([])

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

  const fetchMemberById = async (id) => {
    try {
      setLoading(true)
      const res = await fetch(`${membersUrl}/${id}`, {
        next: { revalidate: 86400 },
      })
      const member = await res.json()
      setCurrentMember(member)
      setFetchedMembers((prev) => [...prev, member])
      toast.success('Member loaded', {
        icon: '✅',
        duration: 2500,
      })
      return member
    } catch (error) {
      console.error('Error fetching member:', error)
      toast.error('Error fetching member', {
        icon: '❌',
        duration: 2500,
      })
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

      // remove member from currentMember if it's the same
      if (currentMember && currentMember.id === id) {
        setCurrentMember(null)
      }

      // remove member from fetchedMembers if it exists there

      const updatedFetchedMembers = fetchedMembers.filter(
        (member) => member.id !== id
      )
      setFetchedMembers(updatedFetchedMembers)

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

      // update currentMember if it's the same
      if (currentMember && currentMember.id === id) {
        setCurrentMember(updatedMember)
      }

      // update fetchedMembers if it exists there
      const exists = fetchedMembers.some((member) => member.id === id)
      if (exists) {
        const updatedFetchedMembers = fetchedMembers.map((member) =>
          member.id === id ? updatedMember : member
        )
        setFetchedMembers(updatedFetchedMembers)
      }

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
      setFetchedMembers((prev) => [...prev, newMember])

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
        fetchedMembers,
        fetchMemberById,
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
