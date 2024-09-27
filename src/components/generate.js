import { Fragment, useState } from 'react'
import { Transition, Dialog } from '@headlessui/react'
import { usePrompts } from '@/context/prompts'
import { useMembers } from '@/context/members'
import toast from 'react-hot-toast'

const DialogWrapper = ({ open, setOpen, children }) => (
  <Transition appear show={open} as={Fragment}>
    <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/25" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4 text-center bg-slate-100/10 backdrop-blur-sm">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
)

const useHandleRequest = (
  method,
  url,
  body,
  successMessage,
  errorMessage,
  callback
) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleRequest = async () => {
    setIsLoading(true)
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const requestOptions = {
      method,
      headers: myHeaders,
      body: JSON.stringify(body),
      redirect: 'follow',
    }

    try {
      const response = await fetch(url, requestOptions)
      if (method !== 'DELETE') {
        const result = await response.json()
        toast(successMessage, { icon: '👏', duration: 2500 })
        callback(result)
      } else {
        toast(successMessage, { icon: '👏', duration: 2500 })
        callback()
      }
    } catch (error) {
      console.error('error', error)
      toast(errorMessage, { icon: '❌' })
    } finally {
      setIsLoading(false)
    }
  }

  return [handleRequest, isLoading]
}

const PromptDialog = ({
  open,
  setOpen,
  title,
  description,
  prompt,
  setPrompt,
  handleSave,
  isLoading,
}) => (
  <DialogWrapper open={open} setOpen={setOpen}>
    <Dialog.Title
      as="h3"
      className="text-lg font-medium leading-6 text-gray-900 text-center"
    >
      {title} -{' '}
      <span class="rounded-full py-1 px-2 bg-slate-200 text-center text-sm font-mono">
        {prompt?.type}
      </span>
    </Dialog.Title>
    <div className="my-1">
      <p className="text-sm text-gray-500 text-center">{description}</p>
    </div>
    <div className="flex flex-wrap -mx-2 space-y-4">
      <div className="w-full px-2">
        <label htmlFor="name" className="block text-left">
          Name
        </label>
        <input
          type="text"
          id="name"
          placeholder="Enter a name for the prompt ❗"
          value={prompt?.name || ''}
          onChange={(e) => setPrompt({ ...prompt, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>
      <div className="w-full px-2">
        <label htmlFor="content" className="block text-left">
          Content
        </label>
        <textarea
          placeholder="Enter the prompt content ❗"
          id="content"
          value={prompt?.content || ''}
          rows={10}
          onChange={(e) => setPrompt({ ...prompt, content: e.target.value })}
          className="w-full border border-gray-300 rounded-lg p-2"
        ></textarea>
      </div>
    </div>
    <div className="flex justify-center space-x-2">
      <button
        disabled={!prompt?.name || !prompt?.content}
        className="p-2 disabled:opacity-50 bg-blue-500 text-white rounded text-xs"
        onClick={handleSave}
      >
        {isLoading ? 'Saving...' : 'Save'}
      </button>
      <button
        className="p-2 bg-rose-400 text-white rounded text-xs"
        onClick={() => setOpen(false)}
      >
        Cancel
      </button>
    </div>
  </DialogWrapper>
)

export const DeletePromptDialog = ({ open, setOpen }) => {
  const { currentPrompt, setCurrentPrompt, fetchPrompts } = usePrompts()
  const [handleDelete, isLoading] = useHandleRequest(
    'DELETE',
    `/api/prompts/${currentPrompt.id}`,
    null,
    'Prompt deleted successfully',
    'Error deleting prompt',
    () => {
      setOpen(false)
      fetchPrompts()
      setCurrentPrompt(null)
    }
  )

  return (
    <DialogWrapper open={open} setOpen={setOpen}>
      <Dialog.Title
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900 text-center"
      >
        Are you sure you want to delete this prompt?
      </Dialog.Title>
      <div className="my-1">
        <p className="text-sm text-gray-500 text-center">
          {currentPrompt.name}
        </p>
      </div>
      <div className="flex justify-center space-x-2">
        <button
          className="p-2 bg-rose-400 text-white rounded text-xs"
          onClick={handleDelete}
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </button>
        <button
          className="p-2 bg-slate-400 text-white rounded text-xs"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </DialogWrapper>
  )
}

export const SaveAsPromptDialog = ({ open, setOpen }) => {
  const { currentPrompt, setCurrentPrompt, fetchPrompts } = usePrompts()
  const [handleSaveAs, isLoading] = useHandleRequest(
    'POST',
    '/api/prompts',
    {
      name: currentPrompt.name,
      content: currentPrompt.content,
      type: currentPrompt.type,
    },
    'Prompt saved successfully',
    'Error saving prompt',
    () => {
      setOpen(false)
      fetchPrompts()
    }
  )

  return (
    <PromptDialog
      open={open}
      setOpen={setOpen}
      title="Save Prompt As"
      description="Save the current prompt as a new prompt"
      prompt={currentPrompt}
      setPrompt={setCurrentPrompt}
      handleSave={handleSaveAs}
      isLoading={isLoading}
    />
  )
}

export const SavePromptDialog = ({ open, setOpen }) => {
  const { currentPrompt, setCurrentPrompt, fetchPrompts } = usePrompts()
  const [handleSave, isLoading] = useHandleRequest(
    'PUT',
    `/api/prompts/${currentPrompt.id}`,
    {
      id: currentPrompt.id,
      name: currentPrompt.name,
      content: currentPrompt.content,
      type: currentPrompt.type,
    },
    'Prompt saved successfully',
    'Error saving prompt',
    () => {
      setOpen(false)
      fetchPrompts()
    }
  )

  return (
    <PromptDialog
      open={open}
      setOpen={setOpen}
      title="Save Prompt"
      description="Save the current prompt to the database"
      prompt={currentPrompt}
      setPrompt={setCurrentPrompt}
      handleSave={handleSave}
      isLoading={isLoading}
    />
  )
}

export const AddPromptDialog = ({ open, setOpen }) => {
  const { currentPrompt, setCurrentPrompt, fetchPrompts } = usePrompts()

  const [handleSave, isLoading] = useHandleRequest(
    'POST',
    '/api/prompts',
    currentPrompt,
    'Prompt saved successfully',
    'Error saving prompt',
    () => {
      setOpen(false)
      fetchPrompts()
    }
  )

  return (
    <PromptDialog
      open={open}
      setOpen={setOpen}
      title="Add Prompt"
      description="Add a new prompt to the database"
      prompt={currentPrompt}
      setPrompt={setCurrentPrompt}
      handleSave={handleSave}
      isLoading={isLoading}
    />
  )
}

const MemberDialog = ({
  open,
  setOpen,
  title,
  description,
  member,
  setMember,
  handleSave,
  isLoading,
}) => (
  <DialogWrapper open={open} setOpen={setOpen}>
    <Dialog.Title
      as="h3"
      className="text-lg font-medium leading-6 text-gray-900 text-center"
    >
      {title}
    </Dialog.Title>
    <div className="my-1">
      <p className="text-sm text-gray-500 text-center">{description}</p>
    </div>
    <div className="flex flex-wrap -mx-2 space-y-4">
      <div className="w-full px-2">
        <label htmlFor="name" className="block text-left">
          Name
        </label>
        <input
          type="text"
          id="name"
          placeholder="Enter a name for the member ❗"
          value={member?.name || ''}
          onChange={(e) => setMember({ ...member, name: e.target.value })}
          className="w-full border border-gray-300 rounded-lg p-2"
        />
      </div>

      <div className="w-full px-2">
        <label htmlFor="content" className="block text-left">
          Content
        </label>
        <textarea
          placeholder="Enter the member content ❗"
          id="content"
          value={member?.content || ''}
          rows={10}
          onChange={(e) => setMember({ ...member, content: e.target.value })}
          className="w-full border border-gray-300 rounded-lg p-2"
        ></textarea>
      </div>
    </div>
    <div className="flex justify-center space-x-2">
      <button
        disabled={!member?.name || !member?.content}
        className="p-2 disabled:opacity-50 bg-blue-500 text-white rounded text-xs"
        onClick={handleSave}
      >
        {isLoading ? 'Saving...' : 'Save'}
      </button>
      <button
        className="p-2 bg-rose-400 text-white rounded text-xs"
        onClick={() => setOpen(false)}
      >
        Cancel
      </button>
    </div>
  </DialogWrapper>
)

export const DeleteMemberDialog = ({ open, setOpen }) => {
  const { currentMember, setCurrentMember, fetchMembers } = useMembers()
  const [handleDelete, isLoading] = useHandleRequest(
    'DELETE',
    `/api/members/${currentMember.id}`,
    null,
    'Member deleted successfully',
    'Error deleting member',
    () => {
      setOpen(false)
      fetchMembers()
      setCurrentMember(null)
    }
  )

  return (
    <DialogWrapper open={open} setOpen={setOpen}>
      <Dialog.Title
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900 text-center"
      >
        Are you sure you want to delete this member?
      </Dialog.Title>
      <div className="my-1">
        <p className="text-sm text-gray-500 text-center">
          {currentMember.name}
        </p>
      </div>
      <div className="flex justify-center space-x-2">
        <button
          className="p-2 bg-rose-400 text-white rounded text-xs"
          onClick={handleDelete}
        >
          {isLoading ? 'Deleting...' : 'Delete'}
        </button>
        <button
          className="p-2 bg-slate-400 text-white rounded text-xs"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </DialogWrapper>
  )
}

export const SaveAsMemberDialog = ({ open, setOpen }) => {
  const { currentMember, setCurrentMember, fetchMembers } = useMembers()
  const [handleSaveAs, isLoading] = useHandleRequest(
    'POST',
    '/api/members',
    { name: currentMember.name, content: currentMember.content },
    'Member saved successfully',
    'Error saving member',
    () => {
      setOpen(false)
      fetchMembers()
    }
  )

  return (
    <MemberDialog
      open={open}
      setOpen={setOpen}
      title="Save Member As"
      description="Save the current member as a new member"
      member={currentMember}
      setMember={setCurrentMember}
      handleSave={handleSaveAs}
      isLoading={isLoading}
    />
  )
}

export const SaveMemberDialog = ({ open, setOpen }) => {
  const { currentMember, setCurrentMember, fetchMembers } = useMembers()
  const [handleSave, isLoading] = useHandleRequest(
    'PUT',
    `/api/members/${currentMember.id}`,
    {
      id: currentMember.id,
      name: currentMember.name,
      content: currentMember.content,
    },
    'Member saved successfully',
    'Error saving member',
    () => {
      setOpen(false)
      fetchMembers()
    }
  )

  return (
    <MemberDialog
      open={open}
      setOpen={setOpen}
      title="Save Member"
      description="Save the current member to the database"
      member={currentMember}
      setMember={setCurrentMember}
      handleSave={handleSave}
      isLoading={isLoading}
    />
  )
}

export const AddMemberDialog = ({ open, setOpen }) => {
  const { currentMember, setCurrentMember, fetchMembers } = useMembers()

  const [handleSave, isLoading] = useHandleRequest(
    'POST',
    '/api/members',
    currentMember,
    'Member added successfully',
    'Error adding member',
    () => {
      setOpen(false)
      fetchMembers()
    }
  )

  return (
    <MemberDialog
      open={open}
      setOpen={setOpen}
      title="Add Member/Poster/Reposter"
      description="Add a new record to the database"
      member={currentMember}
      setMember={setCurrentMember}
      handleSave={handleSave}
      isLoading={isLoading}
    />
  )
}
