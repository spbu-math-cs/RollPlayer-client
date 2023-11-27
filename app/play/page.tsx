'use client'

import GameCanvas from './GameCanvas'
import React, {SetStateAction, useContext, useEffect, useState} from "react";
import {getSessions, SessionInfo} from "@/engine/api/Sessions";
import AuthContext, {User} from "@/context/AuthContext";
import {RuntimeError} from "next/dist/client/components/react-dev-overlay/internal/container/RuntimeError";

let authContext: {
  user: User | null,
  gameId: number | null,
  setGameId: (newGameId: SetStateAction<number | null>) => void,
  authReady: Boolean,
};

function chooseGameId(sessionId: number | null) {
  if (sessionId === null) {
    return;
  }
  authContext.setGameId(sessionId);
}

export default function PlayPage() {
  authContext = useContext(AuthContext);
  const [chosenSession, setChosenSession] = useState<number | null>(null);
  const [sessions, setSessions] = useState<SessionInfo[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!authContext.authReady) {
      return;
    }
    if (authContext.user?.userId === undefined) {
      location.replace('/signin');
    } else {
      getSessions(authContext.user.userId).then((response) => {
        if (typeof response === 'string') {
          setError(response);
        } else {
          setSessions(response);
        }
        setLoaded(true);
      })
    }
  }, [authContext])

  if (!loaded) {
    return <div></div>;
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

  if (authContext?.gameId !== null) {
    return (
      <>
        <GameCanvas gameId={authContext.gameId.toString()}/>
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
                onClick={_ => chooseGameId(session.id)}>
                <p>Session {session.id}</p>
              </button>
            </div>
          )
        }
        <div className="mb-4 w-2/3 h-1/3 align-middle justify-center left-[17%] relative">
          <button
            className="w-full h-full bg-orange-500 text-white text-2xl font-bold rounded-2xl relative"
            onClick={_ => location.replace('/newsession')}
          >
            New Session
          </button>
        </div>
        <div className="mb-4 w-2/3 h-1/3 align-middle justify-center left-[17%] relative">
          <div className="w-2/3 h-1/3 mb-2 justify-center align-middle relative left-[17%]">
            <input className="w-full h-full text-black-500 outline-none outline-orange-500 rounded-2xl text-center text-xl relative"
                   style={{backgroundColor: 'black', color: 'white'}}
                   value={chosenSession ? chosenSession : ''}
                   onChange={(e) => setChosenSession(parseInt(e.target.value))}
                   inputMode='numeric'
                   placeholder='GAME ID'>
            </input>
          </div>
          <button
            type="button"
            className="h-1/3 w-2/3 bg-orange-500 text-white text-2xl font-bold rounded-2xl relative left-[17%]"
            onClick={() => chooseGameId(chosenSession)}
          >
            Connect
          </button>
        </div>
      </section>
    </>
  )
}
