import '@/styles/globals.css'

import { SessionProvider } from 'next-auth/react'
import {
  ResourceProvider
} from '@/context/resources'

import {
  PromptProvider
} from '@/context/prompts'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ResourceProvider>
        <PromptProvider>  
          <Component {...pageProps} />
        </PromptProvider>
      </ResourceProvider>
    </SessionProvider>
  )
}
