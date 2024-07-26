import { Fragment, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { usePrompts } from '@/context/prompts'

export const DialogWrapper = ({ open, setOpen, children }) => {
  return (
    <>
      <Transition appear show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-50"
          onClose={() => {
            setOpen(false)
          }}
        >
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
    </>
  )
}


export const DeletePromptDialog = ({ open, setOpen }) => {
  const { currentPrompt, setCurrentPrompt, fetchPrompts } = usePrompts()

  const [isLoading, setIsLoading] = useState(false)

  const handleDelete = async () => {
    setIsLoading(true)
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const requestOptions = {
      method: 'DELETE',
      headers: myHeaders,
      redirect: 'follow',
    }

    const result = await fetch(
      `/api/prompts/${currentPrompt.id}`,
      requestOptions
    )
      .then((response) => response)
      .then((result) => result)
      .then((result) => {
        toast('Prompt deleted successfully', {
          icon: '👏',
          duration: 2500,
        })
      })
      .catch((error) => {
        console.log('error', error)
        toast('Error deleting prompt', {
          icon: '❌',
        })
        setIsLoading(false)
      })
      .finally(() => {
        setIsLoading(false)
        setOpen(false)
        fetchPrompts()
        setCurrentPrompt(null)
      })

    console.log('result', result)
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
      <div className="">
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
      </div>
    </DialogWrapper>
  )
}

export const SaveAsPromptDialog = ({ open, setOpen }) => {
  const { currentPrompt, setCurrentPrompt, fetchPrompts } = usePrompts()

  const [isLoading, setIsLoading] = useState(false)

  const handleSaveAs = async () => {
    setIsLoading(true)
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        name: currentPrompt.name,
        content: currentPrompt.content,
      }),
      redirect: 'follow',
    }

    const result = await fetch(`/api/prompts`, requestOptions)
      .then((response) => response.json())
      .then((result) => result)
      .then((result) => {
        toast('Prompt saved successfully', {
          icon: '👏',
          duration: 2500,
        })
      })
      .catch((error) => {
        console.log('error', error)
        toast('Error saving prompt', {
          icon: '❌',
        })
        setIsLoading(false)
      })
      .finally(() => {
        setIsLoading(false)
        setOpen(false)
        fetchPrompts()
      })

    console.log('result', result)
  }

  return (
    <DialogWrapper open={open} setOpen={setOpen}>
      <Dialog.Title
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        Save Prompt As
      </Dialog.Title>
      <div className="my-1">
        <p className="text-sm text-gray-500">
          Save the current prompt as a new prompt
        </p>
      </div>
      <div className="">
        <div className="flex flex-wrap -mx-2 space-y-4">
          <div className="w-full px-2">
            <label htmlFor="name" className="block text-left">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={currentPrompt.name}
              onChange={(e) => {
                setCurrentPrompt({ ...currentPrompt, name: e.target.value })
              }}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="w-full px-2">
            <label htmlFor="content" className="block text-left">
              Content
            </label>
            <textarea
              id="content"
              value={currentPrompt.content}
              rows={10}
              onChange={(e) => {
                setCurrentPrompt({ ...currentPrompt, content: e.target.value })
              }}
              className="w-full border border-gray-300 rounded-lg p-2"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-center space-x-2">
          <button
            className="p-2 bg-blue-500 text-white rounded text-xs"
            onClick={handleSaveAs}
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
      </div>
    </DialogWrapper>
  )
}

export const SavePromptDialog = ({ open, setOpen }) => {
  const { currentPrompt, setCurrentPrompt, fetchPrompts } = usePrompts()

  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const requestOptions = {
      method: 'PUT',
      headers: myHeaders,
      body: JSON.stringify({
        id: currentPrompt.id,
        name: currentPrompt.name,
        content: currentPrompt.content,
      }),
      redirect: 'follow',
    }

    const result = await fetch(
      `/api/prompts/${currentPrompt.id}`,
      requestOptions
    )
      .then((response) => response.json())
      .then((result) => result)
      .then((result) => {
        toast('Prompt saved successfully', {
          icon: '👏',
          duration: 2500,
        })
      })
      .catch((error) => {
        console.log('error', error)
        toast('Error saving prompt', {
          icon: '❌',
        })
        setIsLoading(false)
      })
      .finally(() => {
        setIsLoading(false)
        setOpen(false)
        fetchPrompts()
      })

    console.log('result', result)
  }

  return (
    <DialogWrapper open={open} setOpen={setOpen}>
      <Dialog.Title
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        Save Prompt
      </Dialog.Title>
      <div className="my-1">
        <p className="text-sm text-gray-500">
          Save the current prompt to the database
        </p>
      </div>
      <div className="">
        <div className="flex flex-wrap -mx-2 space-y-4">
          <div className="w-full px-2">
            <label htmlFor="name" className="block text-left">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={currentPrompt.name}
              onChange={(e) => {
                setCurrentPrompt({ ...currentPrompt, name: e.target.value })
              }}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="w-full px-2">
            <label htmlFor="content" className="block text-left">
              Content
            </label>
            <textarea
              id="content"
              value={currentPrompt.content}
              rows={10}
              onChange={(e) => {
                setCurrentPrompt({ ...currentPrompt, content: e.target.value })
              }}
              className="w-full border border-gray-300 rounded-lg p-2"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-center space-x-2">
          <button
            className="p-2 bg-blue-500 text-white rounded text-xs"
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
      </div>
    </DialogWrapper>
  )
}

export const AddPromptDialog = ({ open, setOpen }) => {
  const { fetchPrompts } = usePrompts()

  const [promptToAdd, setPromptToAdd] = useState({
    name: '',
    content: '',
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleSave = async () => {
    setIsLoading(true)
    const myHeaders = new Headers()
    myHeaders.append('Content-Type', 'application/json')

    const requestOptions = {
      method: 'POST',
      headers: myHeaders,
      body: JSON.stringify({
        name: promptToAdd.name,
        content: promptToAdd.content,
      }),
      redirect: 'follow',
    }

    const result = await fetch(`/api/prompts`, requestOptions)
      .then((response) => response.json())
      .then((result) => result)
      .then((result) => {
        toast('Prompt saved successfully', {
          icon: '👏',
          duration: 2500,
        })
      })
      .catch((error) => {
        console.log('error', error)
        toast('Error saving prompt', {
          icon: '❌',
        })
        setIsLoading(false)
      })
      .finally(() => {
        setIsLoading(false)
        setOpen(false)
        fetchPrompts()
        setPromptToAdd({
          name: '',
          content: '',
        })
      })

    console.log('result', result)
  }

  return (
    <DialogWrapper open={open} setOpen={setOpen}>
      <Dialog.Title
        as="h3"
        className="text-lg font-medium leading-6 text-gray-900"
      >
        Add Prompt
      </Dialog.Title>
      <div className="my-1">
        <p className="text-sm text-gray-500">
          Add a new prompt to the database
        </p>
      </div>
      <div className="">
        <div className="flex flex-wrap -mx-2 space-y-4">
          <div className="w-full px-2">
            <label htmlFor="name" className="block text-left">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={promptToAdd.name}
              onChange={(e) => {
                setPromptToAdd({ ...promptToAdd, name: e.target.value })
              }}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          </div>
          <div className="w-full px-2">
            <label htmlFor="content" className="block text-left">
              Content
            </label>
            <textarea
              id="content"
              value={promptToAdd.content}
              rows={10}
              onChange={(e) => {
                setPromptToAdd({ ...promptToAdd, content: e.target.value })
              }}
              className="w-full border border-gray-300 rounded-lg p-2"
            ></textarea>
          </div>
        </div>
        <div className="flex justify-center space-x-2">
          <button
            className="p-2 bg-blue-500 text-white rounded text-xs"
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
      </div>
    </DialogWrapper>
  )
}