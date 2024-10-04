import { Dialog } from '@headlessui/react'
import { usePrompts } from '@/context/prompts'
import { useMembers } from '@/context/members'

import DialogWrapper from './common/dialog/wrapper'


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
      <span className="rounded-full py-1 px-2 bg-slate-200 text-center text-sm font-mono">
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
  const { currentPrompt, setCurrentPrompt, handlePromptDelete, isLoading } = usePrompts()

  const handleDelete = async () => {
    await handlePromptDelete(currentPrompt.id)
    setOpen(false)
    setCurrentPrompt(null)
  }

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
  const { currentPrompt, setCurrentPrompt, handlePromptCreate, isLoading } = usePrompts()

  const handleSaveAs = async () => {
    await handlePromptCreate({
      name: currentPrompt.name,
      content: currentPrompt.content,
      type: currentPrompt.type,
    })
    setOpen(false)
  }

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
  const { currentPrompt, setCurrentPrompt, handlePromptUpdate, isLoading } = usePrompts()

  const handleSave = async () => {
    await handlePromptUpdate(currentPrompt.id,{
      id: currentPrompt.id,
      name: currentPrompt.name,
      content: currentPrompt.content,
      type: currentPrompt.type,
    })
    setOpen(false)
  }

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
  const { currentPrompt, setCurrentPrompt, handlePromptCreate, isLoading } = usePrompts()

  const handleSave = async () => {
    await handlePromptCreate(currentPrompt)
    setOpen(false)
  }

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
  const { currentMember, setCurrentMember, handleMemberDelete, isLoading } = useMembers()

  const handleDelete = async () => {
    await handleMemberDelete(currentMember.id)
    setOpen(false)
    setCurrentMember(null)
  }

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
  const { currentMember, setCurrentMember, handleMemberAdd, isLoading } = useMembers()

  const handleSaveAs = async () => {
    await handleMemberAdd({
      name: currentMember.name,
      content: currentMember.content,
    })
    setOpen(false)
  }

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
  const { currentMember, setCurrentMember, handleMemberUpdate, isLoading } = useMembers()

  const handleSave = async () => {
    await handleMemberUpdate(currentMember.id, {
      id: currentMember.id,
      name: currentMember.name,
      content: currentMember.content,
    })
    setOpen(false)
  }

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
  const { currentMember, setCurrentMember, handleMemberAdd, isLoading } = useMembers()

  const handleSave = async () => {
    await handleMemberAdd(currentMember)
    setOpen(false)
  }

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
