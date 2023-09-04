import Image from 'next/image'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main
      className={`flex min-h-screen flex-col items-center justify-between p-24 ${inter.className}`}
    >
      <div className="z-10 w-full max-w-5xl items-center justify-between text-sm lg:flex">
        <p className="fixed text-2xl left-0 top-0 flex w-full justify-center  dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:dark:bg-zinc-800/30 font-semibold">
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

      <div className="mb-32 grid text-center lg:mb-0 lg:grid-cols-2 lg:text-left">
        {[
          {
            name: 'Internal',
            url: 'internal',
            description: 'Data for internal use',
          },
        ].map(({ name, url, description }, id) => (
          <a
            key={`link-${id}-${name}`}
            href={url}
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className={`mb-3 text-2xl font-semibold`}>
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
      </div>
    </main>
  )
}
