import React from 'react'
import { models } from '../../../utils/hardcoded'
import { useResources } from '@/context/resources'

const ModelPicker = () => {
  const { currentModel, setCurrentModel } = useResources()

  return (
    <div className="relative w-full">
      <svg
        className="pointer-events-none absolute text-gray-400 right-2 z-10 top-1/2 -mt-2 h-4 w-4 self-center justify-self-end forced-colors:hidden"
        viewBox="0 0 16 16"
        fill="currentColor"
        aria-hidden="true"
      >
        <path
          fillRule="evenodd"
          d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z"
          clipRule="evenodd"
        ></path>
      </svg>
      <select
        className="form-select appearance-none w-full p-2 rounded-lg bg-gray-50 hover:bg-blue-100 active:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-200 cursor-pointer text-sm font-mono tracking-wider"
        value={currentModel}
        name="model"
        onChange={(e) => setCurrentModel(e.target.value)}
      >
        {models.map((model, idx) => (
          <option key={`model-${model}`} value={model}>
            {model}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ModelPicker
