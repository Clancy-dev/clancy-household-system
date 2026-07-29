'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function RootPage() {
  const router = useRouter()

  // the
  useEffect(() => {
    router.push('/login')
  }, [router])

  return null
}
