import '@/styles/globals.css'
import '@/styles/message-content.css'

import { SessionProvider } from 'next-auth/react'
import { ResourceProvider } from '@/context/resources'

import { PromptProvider } from '@/context/prompts'

import { MembersProvider } from '@/context/members'

import { UserProvider } from '@/context/user'

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}) {
  return (
    <SessionProvider session={session}>
      <UserProvider>
        <ResourceProvider>
          <PromptProvider>
            <MembersProvider>
              <Component {...pageProps} />
            </MembersProvider>
          </PromptProvider>
        </ResourceProvider>
      </UserProvider>
    </SessionProvider>
  )
}
