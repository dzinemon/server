import React from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/solid'
import { Type } from './resourcetype'

const SourceCard = ({ item, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.5,
        delay: index * 0.2,
      }}
      className="w-1/2 lg:w-1/4 px-0.5 mb-2 overflow-hidden"
      key={`res-${index}`}
    >
      <a
        href={item.url}
        target="_blank"
        rel="noreferrer"
        className="rounded hover:bg-gray-100 bg-white group flex flex-col relative h-full border border-gray-200"
      >
        <div className="aspect-video overflow-hidden">
          {item.image ? (
            <Image
              src={item.image}
              width={120}
              height={80}
              className="w-full rounded-t"
              alt={item.title}
            />
          ) : (
            <Image
              src="https://kruzeconsulting.com/img/hero_vanessa_2020.jpg"
              width={120}
              height={80}
              className="w-full rounded-t"
              alt={item.title}
            />
          )}
        </div>
        <div className="p-2 grow flex flex-col justify-between">
          <div>
            <div className="flex flex-row items-center justify-start -mt-4">
              <div className="w-auto">
                <div className="flex flex-row items-center justify-start px-1 py-px leading-none border-white border bg-blue-400 font-light lg:text-xs text-[10px] rounded-full text-white w-auto flex-1 capitalize font-bold">
                  <Type data={item.type} />
                </div>
              </div>
            </div>
            <p className="text-xs my-2">
              {item.title}
            </p>
          </div>
          <div className="flex flex-row items-center justify-start">
            <div className="w-auto flex-none">
              <Image
                className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
                src="/logo-color.png"
                alt="Kruze Logo"
                width={14}
                height={16}
                priority
              />
            </div>
            <div className="text-[10px] md:text-xs w-auto flex-1 capitalize font-medium">
              Kruze Consulting
            </div>
            <div className="text-blue-600 flex-none text-xs text-right">
              <span className="group-hover:underline">
                <ArrowTopRightOnSquareIcon className="w-3 h-3 inline opacity-50 group-hover:opacity-100 group-hover:translate-x-1 group-hover:-translate-y-1 duration-200" />
              </span>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  )
}

export default SourceCard
