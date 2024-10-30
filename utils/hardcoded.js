
const models = [
  'gpt-4o-2024-08-06',
  'gpt-4o-mini-2024-07-18',
  'claude-3-5-sonnet-20240620',
  'llama-3.1-sonar-small-128k-online',
  'llama-3.1-sonar-large-128k-online',
  'llama-3.1-sonar-huge-128k-online',
  'llama-3.1-sonar-small-128k-chat',
  'llama-3.1-sonar-large-128k-chat',
  'llama-3.1-8b-instruct',
  'llama-3.1-70b-instruct'
]

const sourceFilters = ['website', 'slack', 'internal']
//webpage, post, slack, tip, tax_calendar, qna, podcast
const typeFilters = [
  'webpage',
  'post',
  'slack',
  'tip',
  'tax_calendar',
  'qna',
  'podcast',
]

export { models, sourceFilters, typeFilters }