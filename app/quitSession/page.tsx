'use client'

import { SetStateAction, useContext } from 'react'
import { AuthContext } from '@/context/AuthContext'
import { redirect } from 'next/navigation'

let authContext: {
  sessionId: number | null,
  setSessionId: (newSessionId: SetStateAction<number | null>) => void,
}

export default function QuitSession() {
  authContext = useContext(AuthContext)
  
  authContext.setSessionId(null)
  redirect('/')
}
