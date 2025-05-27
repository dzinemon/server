import { useEffect } from 'react'
import Image from 'next/image'
import Script from 'next/script'
import { Inter } from 'next/font/google'
import { useSession } from 'next-auth/react'
import Navbar from '../components/navbar'
import Loading from '../components/Loading'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { data: session } = useSession()

  if (session === undefined) {
    return <Loading />
  }

  if (session) {
    return (
      <>
        <Navbar />
        <main
          className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
        >
          <div
            className="relative flex place-items-center 
      before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] 
      after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:-translate-x-1/3 after:bg-gradient-conic after:from-blue-200 after:via-sky-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700/10 
      after:dark:from-sky-900 after:dark:via-[#0141ff]/40 before:lg:h-[360px]"
          >
            <Image
              className="relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert"
              src="/logo-color.png"
              alt="Kruze Logo"
              width={100}
              height={119}
              priority
            />
          </div>

          <div className="mb-32 flex flex-wrap justify-center lg:mb-0 lg:text-left ">
            {[
              {
                name: 'Internal',
                url: 'internal-qa',
                description:
                  'AI Question and Answer for internal use. Uses website, slack, internal data, uploaded to pinecone',
              },
              {
                name: 'Internal Chat',
                url: 'internal-chat',
                description: 'Similar to Internal QA but with chat behaviour',
              },
              {
                name: 'LinkedIn Post Generator',
                url: 'li-post-stream',
                description: 'Generate LinkedIn posts, reposts based on input',
              },
              {
                name: 'All Questions',
                url: 'all-questions',
                description: 'View the questions users have asked on AI Widget',
              },
              {
                name: 'Quotes Generator',
                url: 'podcast-quotes-topic',
                description:
                  'Generate quotes from podcast page to specific topic',
              },
            ].map(({ name, url, description }, id) => (
              <a
                key={`link-${id}-${name}`}
                href={url}
                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              >
                <h2
                  className={`mb-3 text-2xl font-semibold group-hover:text-kruze-blueLight`}
                >
                  {name}{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                  </span>
                </h2>
                <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
                  {description}
                </p>
              </a>
            ))}

            <div className="text-left hidden">
              <button
                type="button"
                id="btn-trigger-chat-section"
                className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              >
                <h2
                  className={`mb-3 text-2xl font-semibold group-hover:text-kruze-blueLight`}
                >
                  Start Chat{' '}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                  </span>
                </h2>
                <p
                  className={`m-0 max-w-[30ch] text-sm opacity-50 pointer-events-none`}
                >
                  Use the chat widget to ask questions
                </p>
              </button>
            </div>
          </div>

          <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
            <p className="fixed text-2xl left-0 bottom-0 flex w-full justify-center  dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:dark:bg-zinc-800/30 font-semibold">
              Kruze{' '}
              <span className="mx-2 bg-gradient-to-r from-sky-600 via-sky-500 to-sky-600 inline-block text-transparent bg-clip-text">
                AI Agent
              </span>
            </p>
            <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
              <a
                className="font-mono flex place-items-center gap-2 p-8 lg:pointer-events-auto lg:p-0"
                href="https://kruzeconsulting.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                By{' '}
                <Image
                  src="/logo-color.png"
                  alt="Kruze COnsulting Logo"
                  className="dark:invert"
                  width={20}
                  height={24}
                  priority
                />
                <span className="font-semibold">Kruze</span>
              </a>
            </div>
          </div>
          <Script id="chat-widget-script" src="/chat-widget.js"></Script>
          <Script id="chat-onload-script">{`
        setTimeout(() => {
          ChatWidget.init();
        }
        , 1000);
      `}</Script>
        </main>
      </>
    )
  }

  return (
    <div className="h-screen w-full flex items-center justify-center">
      Not signed in <br />
      <button
        className="hover:bg-sky-700 text-sm font-semibold leading-6  text-gray-100 px-6 bg-sky-600 rounded-lg py-2 mx-5"
        onClick={() => import('next-auth/react').then(mod => mod.signIn())}
      >
        Sign in
      </button>
    </div>
  )
}
