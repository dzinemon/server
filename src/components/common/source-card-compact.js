import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import { Type } from './resourcetype'

const SourceCardCompact = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
      }}
      key={`compact-res-${index}`}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="rounded-lg hover:bg-gray-50 bg-white group flex gap-2 px-2 py-1.5 border border-gray-200 transition-all duration-200"
      >
        {/* Thumbnail */}
        <div className="flex-shrink-0 w-12 h-12 rounded-md overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              width={48}
              height={48}
              className="w-full h-full object-cover"
              alt={item.title}
            />
          ) : (
            <Image
              src="https://kruzeconsulting.com/img/hero_vanessa_2020.jpg"
              width={48}
              height={48}
              className="w-full h-full object-cover"
              alt={item.title}
            />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              {/* Type Badge */}
              <div className="mb-1">
                <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  <Type data={item.type} />
                </div>
              </div>
              
              {/* Title */}
              <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {item.title}
              </h4>
            </div>
            
            {/* External Link Icon */}
            <div className="flex-shrink-0 text-gray-400 group-hover:text-blue-600 transition-colors">
              <ArrowTopRightOnSquareIcon className="w-4 h-4 -ml-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  )
}

export default SourceCardCompact
