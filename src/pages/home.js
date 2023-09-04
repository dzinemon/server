import Layout from '../components/layout'
import { PlusIcon, CircleStackIcon } from '@heroicons/react/24/solid'

export default function About() {
  return (
    <Layout>
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-16 text-center lg:grid-cols-3">
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <PlusIcon className="mx-auto h-36 w-36 text-blue-500" />
              <dt className="text-base leading-7 text-gray-600">
                <a className="text-blue-500 hover:underline" href="/create">
                  Create new Item
                </a>
              </dt>
              <dd className="order-first text-xl lg:text-2xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                Add Knowledge
              </dd>
            </div>
            {/* <div className="mx-auto flex max-w-xs flex-col gap-y-4">
            <CircleStackIcon className="mx-auto h-36 w-36 text-blue-500" />
            <dt className="text-base leading-7 text-gray-600"><a className="text-blue-500 hover:underline" href="/external">Click to update</a></dt>
            <dd className="order-first text-xl lg:text-2xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Client Portal Knowledge</dd>
          </div> */}
            <div className="mx-auto flex max-w-xs flex-col gap-y-4">
              <CircleStackIcon className="mx-auto h-36 w-36 text-blue-500" />
              <dt className="text-base leading-7 text-gray-600">
                <a className="text-blue-500 hover:underline" href="/internal">
                  Click to update
                </a>
              </dt>
              <dd className="order-first text-xl lg:text-2xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                Internal Kruze Knowledge
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </Layout>
  )
}
