'use client'

import { AuthContext, User } from '@/context/AuthContext'
import { SessionInfo, getSessions } from '@/engine/api/Sessions'
import { CharacterInfo } from '@/engine/entities/CharacterInfo'
import { RuntimeError } from 'next/dist/client/components/react-dev-overlay/internal/container/RuntimeError'
import { SetStateAction, useContext, useEffect, useState } from 'react'
import { ConnectionProperties } from '../../engine/api/Connection'
import GameScreen from './GameScreen'

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
  const [editMode, setEditMode] = useState(false)


    useEffect(() => {
    if (!authContext.authReady) {
      return
    }
    if (authContext.user?.userId === undefined) {
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
      userId: curUser.userId,
      userToken: 'kek',
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

  const editMenu = () => {
    setEditMode(!editMode);
  };

  function handleMenuItemClick(editMenuItem: string) {
    if (editMenuItem === 'Save') {
      //Todo: some realisation
    }
    if (editMenuItem === 'Load') {
      //Todo: some realisation
    }
  }

  const handleChooseTile = (value: string) => {
    //Todo: some realisation
  }



  return (
    <>
      <div className="absolute right-0 top-0  rounded-2xl flex flex-col  bg-gray-900" >
        <button className=" text-4xl right-0 top-0"
                onClick={editMenu}> Edit map
        </button>
          {editMode && (
            <div className=" flex flex-col items-center h-screen bg-gray-900" style={{width: '100px'}}>
              <button className=" text-l" onClick={() => handleMenuItemClick('Save')}>
                Save map
              </button>
                <button className=" text-l" onClick={() => handleMenuItemClick('Load')}>
                  Load map
                </button>
                <select className="text-l" onChange={(e) => handleChooseTile(e.target.value)}>
                  <option value="">Choose tile</option>
                  <option value="tile1">Tile 1</option>
                  <option value="tile2">Tile 2</option>
                  <option value="tile3">Tile 3</option>
                  {/*<option value="tile1">*/}
                    {/*  <img src="path_to_tile1_image" alt="Tile 1" />*/}
                  {/*</option>*/}
                  {/*<option value="tile2">*/}
                    {/*  <img src="path_to_tile2_image" alt="Tile 2" />*/}
                  {/*</option>*/}
                  {/*<option value="tile3">*/}
                    {/*  <img src="path_to_tile3_image" alt="Tile 3" />*/}
                  {/*</option>*/}
                </select>
            </div>
          )}
      </div>
      <section className="container mx-auto w-screen h-[95%] flex-row-reverse items-center justify-center overflow-y-scroll">
        {sessions.map((session) => (
          <div className="mb-4 w-2/3 h-1/3 align-middle justify-center left-[17%] relative">
            <button
              className="w-full h-full bg-orange-500 text-white text-2xl font-bold rounded-2xl relative"
              onClick={(_) => chooseSession(session.id)}
            >
              <p>Session {session.id}</p>
            </button>
          </div>
        ))}
        <div className="mb-4 w-2/3 h-1/3 align-middle justify-center left-[17%] relative">
          <button
            className="w-full h-full bg-orange-500 text-white text-2xl font-bold rounded-2xl relative"
            onClick={(_) => location.replace('/newsession')}
          >
            New Session
          </button>
        </div>
        <div className="mb-4 w-2/3 h-1/3 align-middle justify-center left-[17%] relative">
          <div className="w-2/3 h-1/3 mb-2 justify-center align-middle relative left-[17%]">
            <input
              className="w-full h-full text-black-500 outline-none outline-orange-500 rounded-2xl text-center text-xl relative"
              style={{ backgroundColor: 'black', color: 'white' }}
              value={chosenSession ? chosenSession : ''}
              onChange={(e) => setChosenSession(parseInt(e.target.value))}
              inputMode="numeric"
              placeholder="SESSION ID"
            ></input>
          </div>
          <button
            type="button"
            className="h-1/3 w-2/3 bg-orange-500 text-white text-2xl font-bold rounded-2xl relative left-[17%]"
            onClick={() => chooseSession(chosenSession)}
          >
            Connect
          </button>
        </div>
      </section>
    </>
  )
}
