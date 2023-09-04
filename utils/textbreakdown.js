const text_limit = 7500

const getTextChunks = (text) =>
  text
    .replace(/(\r\n|\n|\r)/gm, '')
    .replace(/\s+/g, ' ')
    .split(' ')
    .reduce(
      (acc, curr) => {
        if (acc[acc.length - 1].length + curr.length < text_limit) {
          acc[acc.length - 1] += ` ${curr}`
        } else {
          acc.push(curr)
        }
        return acc
      },
      ['']
    )

export { getTextChunks }
