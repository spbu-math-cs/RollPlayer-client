'use client'

import { AuthContext, User } from '@/context/AuthContext'
import { SessionInfo, getSessions } from '@/engine/api/Sessions'
import { CharacterInfo } from '@/engine/entities/CharacterInfo'
import { RuntimeError } from 'next/dist/client/components/react-dev-overlay/internal/container/RuntimeError'
import { SetStateAction, useContext, useEffect, useState } from 'react'
import { ConnectionProperties } from '@/engine/api/Connection'
import GameScreen from './GameScreen'
import Axios, { AxiosError, AxiosInstance } from 'axios'

let authContext: {
  user: User | null

  sessionId: number | null
  setSessionId: (newSessionId: SetStateAction<number | null>) => void

  authReady: Boolean
}

function chooseSession(sessionId: number | null) {
  if (sessionId === null) {
    return
  }

  authContext.setSessionId(sessionId)
}

async function sessionIdIsValid(axios: AxiosInstance, sessionId: number): Promise<boolean> {
  const response = await axios.get(`/game/${sessionId}/mapId`).catch((_: AxiosError) => undefined)
  return response !== undefined
}

export type CharacterContext = {
  character: CharacterInfo
  x: number
  y: number
}

export default function PlayPage() {
  authContext = useContext(AuthContext)
  const [chosenSession, setChosenSession] = useState<number | null>(null)
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)

  const axios = Axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL })

  useEffect(() => {
    if (!authContext.authReady) {
      return
    }

    if (authContext.user?.userId === undefined) {
      location.replace('/signin')
    } else {
      getSessions(authContext.user.token).then((response) => {
        if (typeof response === 'string') {
          setError(response)
        } else {
          setSessions(response)
        }
        setLoaded(true)
      })
    }

    const sessionId = authContext?.sessionId
    if (sessionId === null) return

    const checkSessionIdIsValid = async () => {
      const isValid = await sessionIdIsValid(axios, sessionId)
      if (!isValid) {
        authContext.setSessionId(null)
      }
    }

    checkSessionIdIsValid()
  }, [authContext])

  if (!loaded) {
    return <div></div>
  }

  if (error) {
    return (
      <>
        <section className="container mx-auto h-screen flex items-center justify-center">
          <p>{error}</p>
        </section>
      </>
    )
  }

  if (authContext?.sessionId !== null) {
    const curUser = authContext.user as User
    if (curUser === null || curUser === undefined) {
      console.error('trying to choose game session without authentication')
      return
    }

    const sessionId = authContext.sessionId
    if (sessionId === null) {
      console.error('session id is not set')
      return
    }

    const connectionProperties: ConnectionProperties = {
      userInfo: {
        userId: curUser.userId,
        userToken: curUser.token,
        avatarId: (curUser.avatarId === null) ? undefined : curUser.avatarId,
      },
      sessionId: sessionId,
    }

    return (
      <>
        <GameScreen connectionProperties={connectionProperties} />
      </>
    )
  }

  if (sessions === null) {
    throw RuntimeError // Should never get here
  }

  return (
    <>
      <section className="container mx-auto w-screen h-[95%] flex-row-reverse items-center justify-center overflow-y-scroll">
        <div className="mb-4 w-2/3 h-1/3 align-middle justify-center left-[17%] relative">
          {sessions.map((session) => (
            <div className="w-2/3 h-1/3 mb-2 justify-center align-middle relative left-[17%]">
              <button
                className="w-full h-full bg-orange-500 text-white text-2xl font-bold rounded-2xl relative"
                onClick={(_) => chooseSession(session.id)}
              >
                <p>Session {session.id}</p>
              </button>
            </div>
          ))}
          <div className="w-2/3 h-1/3 mb-2 justify-center align-middle relative left-[17%]">
            <button
              className="w-full h-full bg-orange-500 text-white text-2xl font-bold rounded-2xl relative"
              onClick={(_) => location.replace('/newsession')}
            >
              New Session
            </button>
          </div>
          <div className="w-2/3 h-1/3 mb-2 justify-center align-middle relative left-[17%]">
            <input
              className="w-[49%] h-full text-black-500 outline-none outline-orange-500 rounded-2xl text-center text-xl relative"
              style={{ backgroundColor: 'black', color: 'white' }}
              value={chosenSession ? chosenSession : ''}
              onChange={(e) => setChosenSession(parseInt(e.target.value))}
              inputMode="numeric"
              placeholder="SESSION ID"
            ></input>
            <button
              type="button"
              className="h-full w-[49%] bg-orange-500 text-white text-2xl font-bold rounded-2xl relative left-[2%]"
              onClick={() => chooseSession(chosenSession)}
            >
              Connect
            </button>
          </div>
        </div>
      </section>
    </>
  )
}
