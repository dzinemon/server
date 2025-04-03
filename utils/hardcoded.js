
const models = [
  'sonar',
  'sonar-pro',
  'r1-1776',
  'gpt-4o-2024-08-06',
  'gpt-4o-mini-2024-07-18',
  // 'claude-3-5-sonnet-20241022',
]

const usedModel = models[0]

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

export { models, sourceFilters, typeFilters, usedModel }