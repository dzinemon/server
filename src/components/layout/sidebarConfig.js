import { DocumentTextIcon, FileIcon, LinkIcon } from './SidebarIcons'

/**
 * Common sidebar configuration for content management pages (links, files, texts)
 * @param {string} activePage - The currently active page ('links', 'files', or 'texts')
 * @returns {Array} - Array of sidebar section configurations
 */
export const getContentSidebarConfig = (activePage) => {
  return [
    {
      title: 'Content',
      defaultOpen: true,
      items: [
        {
          label: 'Links',
          href: '/links',
          icon: <LinkIcon />,
        },
        {
          label: 'Files (CSV)',
          href: '/files-csv',
          icon: <FileIcon />,
        },
        {
          label: 'Files (PDF)',
          href: '/files-pdf',
          icon: <FileIcon />,
        },
        {
          label: 'Texts',
          href: '/texts',
          icon: <DocumentTextIcon />,
        },
      ],
    },
  ]
}
