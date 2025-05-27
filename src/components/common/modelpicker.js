import React from 'react'
import { models } from '../../../utils/hardcoded'
import { useResources } from '@/context/resources'

const ModelPicker = () => {
  const { currentModel, setCurrentModel } = useResources()

  return (
    <select
      className="w-full p-2 border border-gray-300 rounded-lg"
      value={currentModel}
      onChange={(e) => setCurrentModel(e.target.value)}
    >
      {models.map((model, idx) => (
        <option key={`model-${model}`} value={model}>
          {model}
        </option>
      ))}
    </select>
  )
}

export default ModelPicker
