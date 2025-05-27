import { motion } from 'framer-motion'
import Counter from './counter' // Assuming you already have a Counter component

export const LoadingCircles = () => {
  return (
    <div className="flex space-x-1">
      <motion.div
        className="h-1.5 w-1.5 bg-blue-500 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'loop',
        }}
      />
      <motion.div
        className="h-1.5 w-1.5 bg-blue-500 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'loop',
          delay: 0.2,
        }}
      />
      <motion.div
        className="h-1.5 w-1.5 bg-blue-500 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'loop',
          delay: 0.4,
        }}
      />
      <motion.div
        className="h-1.5 w-1.5 bg-blue-500 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'loop',
          delay: 0.6,
        }}
      />
      <motion.div
        className="h-1.5 w-1.5 bg-blue-500 rounded-full"
        animate={{ y: [0, -5, 0] }}
        transition={{
          duration: 0.5,
          repeat: Infinity,
          repeatType: 'loop',
          delay: 0.8,
        }}
      />
    </div>
  )
}

export const LoadingLine = () => {
  return (
    <motion.div
      className="w-full relative z-20 -my-px h-0.5 bg-gradient-to-r from-white via-blue-400 to-white"
      animate={{
        x: ['-100%', '100%'],
        opacity: [1, 0],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        repeatType: 'loop',
      }}
    />
  )
}

const LoadingIndicator = ({ resourcesUsed }) => {
  return (
    <div className="flex flex-col items-center justify-center h-full space-y-4">
      <div className="flex space-x-2">
        <div className="flex items-center space-x-1">
          <div className="text-sm text-slate-500">Elapsed Time:</div>
          <div className="w-10">
            <Counter />s
          </div>
        </div>
        <div className="text-center">
          <p>
            <span className="text-sm text-slate-500">Resources Used:</span>{' '}
            {resourcesUsed}
          </p>
        </div>
      </div>
    </div>
  )
}

export default LoadingIndicator
