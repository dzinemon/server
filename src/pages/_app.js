import '@/styles/globals.css'

import { SessionProvider } from 'next-auth/react'
import {
  ResourceProvider
} from '@/context/resources'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ResourceProvider>
        <Component {...pageProps} />
      </ResourceProvider>
    </SessionProvider>
  )
}
