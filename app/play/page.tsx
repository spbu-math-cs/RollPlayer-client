'use client'

import GameCanvas from './GameCanvas'
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { getSessions, SessionInfo } from "@/engine/api/SessionsList"
import { AuthContext, User } from "@/context/AuthContext"
import { RuntimeError } from "next/dist/client/components/react-dev-overlay/internal/container/RuntimeError"
import { ConnectionProperties } from '../../engine/api/Connection'

let authContext: {
  user: User | null,
  authReady: Boolean,
};

let connectionProperties: ConnectionProperties | null
let setConnectionProperties: Dispatch<SetStateAction<ConnectionProperties | null>>

function chooseSession(sessionId: number) {
  const curUser = authContext.user as User
  if (curUser === null || curUser === undefined) {
    console.error("trying to choose game session without authentication")
    return
  }

  setConnectionProperties({
    userId: curUser.userId,
    userToken: "kek",
    sessionId: sessionId
  })
}

export default function PlayPage() {
  [connectionProperties, setConnectionProperties] = useState<ConnectionProperties | null>(null)
  authContext = useContext(AuthContext)
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!authContext.authReady) {
      location.replace('/')
    } else if (authContext.user?.userId === undefined) {
      location.replace('/signin')
    } else {
      getSessions(authContext.user.userId).then((response) => {
        if (typeof response === 'string') {
          setError(response)
        } else {
          setSessions(response)
        }
        setLoaded(true)
      })
    }
  }, [])

  if (!loaded) {
    return <div></div>;
  }

  if (error) {
    return (
      <>
        <section className="container mx-auto h-screen flex items-center justify-center">
          <p>{ error }</p>
        </section>
      </>
    )
  }

  if (connectionProperties !== null) {
    return (
      <>
        <GameCanvas connectionProperties={ connectionProperties }/>
      </>
    )
  }

  if (sessions === null) {
    throw RuntimeError // Should never get here
  }

  return (
    <>
      <section className="container mx-auto w-screen h-[95%] flex-row-reverse items-center justify-center overflow-y-scroll">
        {
          sessions.map(session =>
            <div className="mb-4 w-2/3 h-1/3 align-middle justify-center left-[17%] relative">
              <button
                className="w-full h-full bg-orange-500 text-white text-2xl font-bold rounded-2xl relative"
                onClick={ _ => chooseSession(session.id) }>
                <p>Session { session.id }</p>
              </button>
            </div>
          )
        }
      </section>
    </>
  )
}
