import {
  DocumentChartBarIcon,
  CalendarIcon,
  ChatBubbleLeftRightIcon,
  MicrophoneIcon,
} from '@heroicons/react/24/solid'

export const Type = ({ data }) => {
  switch (data) {
    case 'webpage':
      return (
        <>
          <DocumentChartBarIcon className="w-3 h-3 mr-1" />
          Web page
        </>
      )
      break
    case 'slack':
      return (
        <>
          <ChatBubbleLeftRightIcon className="w-3 h-3 mr-1" />
          Slack
        </>
      )
      break
    case 'post':
      return (
        <>
          <DocumentChartBarIcon className="w-3 h-3 mr-1" />
          Blog post
        </>
      )
      break
    case 'qna':
      return (
        <>
          <DocumentChartBarIcon className="w-3 h-3 mr-1" />Q & A
        </>
      )
      break
    case 'tax_calendar':
      return (
        <>
          <CalendarIcon className="w-3 h-3 mr-1" />
          Tax Calendars
        </>
      )
      break
    case 'tip':
      return (
        <>
          <DocumentChartBarIcon className="w-3 h-3 mr-1" />
          Startup Tips
        </>
      )
      break
    case 'podcast':
      return (
        <>
          <MicrophoneIcon className="w-3 h-3 mr-1" />
          Podcast
        </>
      )
      break
    default:
      console.log('Unknown page')
  }
}
