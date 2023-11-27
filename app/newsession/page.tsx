'use client'

import {Dispatch, SetStateAction, useContext, useEffect, useState} from "react";
import {createSession} from "@/engine/api/Sessions";
import AuthContext, {User} from "@/context/AuthContext";
import {RuntimeError} from "next/dist/client/components/react-dev-overlay/internal/container/RuntimeError";
import Link from "next/link";
import {getMaps, MapInfo} from "@/engine/api/Maps";

let authContext: {
  user: User | null,
  authReady: Boolean,
  setGameId: (newGameId: SetStateAction<number | null>) => void,
};

let error: string | null;
let setError: Dispatch<SetStateAction<string | null>>;

function chooseMap(mapId: number) {
  if (mapId !== null) {
    createSession(mapId).then(response => {
        if (typeof response === 'string') {
          setError(response);
        } else {
          authContext.setGameId(response.id);
          location.replace('/play');
        }
      }
    )
  }
}

export default function NewSessionPage() {
  authContext = useContext(AuthContext);
  const [maps, setMaps] = useState<MapInfo[] | null>(null);
  [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!authContext.authReady) {
      return;
    }
    if (authContext.user?.userId === undefined) {
      location.replace('/signin');
    } else {
      getMaps().then((response) => {
        if (typeof response === 'string') {
          setError(response);
        } else {
          setMaps(response);
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

  if (maps === null) {
    throw RuntimeError // Should never get here
  }

  return (
    <>
      <section className="container mx-auto w-screen h-[95%] flex-row-reverse items-center justify-center overflow-y-scroll">
        {
          maps.map(mapInfo =>
            <div className="mb-4 w-2/3 h-1/3 align-middle justify-center left-[17%] relative">
              <button
                className="w-full h-full bg-orange-500 text-white text-2xl font-bold rounded-2xl relative"
                onClick={_ => chooseMap(mapInfo.id)}>
                <p>Session {mapInfo.id}: {mapInfo.filepath}</p>
              </button>
            </div>
          )
        }
        <Link
          href="/play"
          className="text-xl text-center text-white block bg-orange-500 p-3 rounded-2xl"
        >
          Back
        </Link>
      </section>
    </>
  )
}
