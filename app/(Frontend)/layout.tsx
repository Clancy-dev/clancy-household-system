
import React from 'react'
import Providers from '../providers/providers'
import { getServerSession } from 'next-auth';
import { authOptions } from '../api/auth/[...nextauth]/route';

export default async function FrontEndLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const session = await getServerSession(authOptions)

  return (
    <Providers session={session}>
       <main className="min-h-screen bg-background">
      {children}
    </main>
    </Providers>
  
  )
}
