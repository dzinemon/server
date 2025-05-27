import React from 'react'
import { diffWords } from 'diff'

const HighlightDifferences = ({ oldText, newText }) => {
  const diffResult = diffWords(oldText, newText, {
    newlineIsToken: true,
    stripTrailingCr: true,
    ignoreWhitespace: true,
  })

  return (
    <div>
      {diffResult.map((part, index) => {
        const style = {
          backgroundColor: part.added
            ? 'lightgreen'
            : part.removed
            ? 'salmon'
            : 'transparent',
          textDecoration: part.removed ? 'line-through' : 'none', // Line-through for removed text segments
        }

        return (
          <span key={index} style={style}>
            {part.value}
          </span>
        )
      })}
    </div>
  )
}

export default HighlightDifferences
