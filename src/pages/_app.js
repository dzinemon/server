import '@/styles/globals.css'

import { SessionProvider } from 'next-auth/react'
import {
  ResourceProvider
} from '@/context/resources'

import {
  PromptProvider
} from '@/context/prompts'

import {
  MembersProvider
} from '@/context/members'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <ResourceProvider>
        <PromptProvider>  
          <MembersProvider>
            <Component {...pageProps} />
          </MembersProvider>
        </PromptProvider>
      </ResourceProvider>
    </SessionProvider>
  )
}
