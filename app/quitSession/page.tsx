'use client'

import { SetStateAction, useContext } from "react"
import { AuthContext } from "@/context/AuthContext"

let authContext: {
  sessionId: number | null,
  setSessionId: (newSessionId: SetStateAction<number | null>) => void,
}

export default function QuitSession() {
  authContext = useContext(AuthContext)
  
  authContext.setSessionId(null)
  location.replace('/')
}
