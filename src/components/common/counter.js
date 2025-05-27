// create simple counter component use span tag to display the count increment each second
import React, { useState, useEffect } from 'react'

export default function Counter() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCount((prevCount) => prevCount + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  return <span>{count}</span>
}
