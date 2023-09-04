import {
  DocumentArrowUpIcon,
  ArrowRightIcon,
  LinkIcon,
  DocumentTextIcon,
  ChevronDoubleDownIcon,
  CodeBracketIcon,
  ArrowDownOnSquareStackIcon,
} from '@heroicons/react/24/solid'

export default function Assistant({ title, subtitle, isNew }) {
  return (
    <>
      <div className="relative isolate overflow-hidden py-24 sm:py-32">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:mx-0">
            <h2 className="text-4xl font-bold tracking-tight sm:text-6xl">
              {title}
            </h2>
            <p className="mt-6 text-lg leading-8 opacity-60">{subtitle}</p>
          </div>

          <div className="mb-32 grid text-center lg:mb-0 md:grid-cols-3 lg:text-left">
            {[
              {
                name: 'Links',
                disabled: false,
                url: 'links',
                description: 'Control your uploads via links',
                icon: <LinkIcon className="inline w-6" />,
              },
              {
                name: 'Texts',
                disabled: false,
                url: 'texts',
                description: 'Control your uploads via text',
                icon: <DocumentTextIcon className="inline w-6" />,
              },
              {
                name: 'Files',
                disabled: false,
                url: 'files',
                description: 'Coming soon . . .',
                icon: <DocumentArrowUpIcon className="inline w-6" />,
              },
            ].map(({ name, url, description, icon, disabled }, id) => (
              <a
                disabled={!disabled}
                key={`link-${id}-${name}`}
                href={url}
                className={`${
                  disabled && 'pointer-events-none'
                } group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30`}
              >
                <h2 className={`my-3 text-2xl font-semibold`}>
                  {icon} {name}{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                  </span>
                </h2>
                <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
                  {description}
                </p>
              </a>
            ))}
          </div>
          <div className="mb-32 grid text-center lg:mb-0 lg:text-left">
            {[
              {
                name: 'Ask Question',
                disabled: false,
                url: 'ask-question',
                description:
                  'Use AI to ask questions and get answers based on the data you have in your system',
                icon: '',
              },
            ].map(({ name, url, description, icon }, id) => (
              <a
                key={`link-${id}-${name}`}
                href={url}
                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              >
                <h2 className={`my-3 text-2xl font-semibold`}>
                  {icon && icon} {name}{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                  </span>
                </h2>
                <p className={`m-0 max-w-[60ch] text-sm opacity-50`}>
                  {description}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
