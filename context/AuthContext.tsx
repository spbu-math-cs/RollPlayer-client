'use client'

import React, {createContext, SetStateAction, useEffect, useState} from 'react';
import {editApi, signInApi, signOutApi, signUpApi} from "@/engine/api/Auth";

export interface User {
  userId: number,
  email: string,
  login: string,
  password: string,
};

export const AuthContext = createContext({
  user: null as User | null,

  sessionId: null as number | null,
  setSessionId: (newSessionId: SetStateAction<number | null>) => {},

  signIn: (login: string | null, email: string | null, password: string) => {},
  signUp: (user: User) => {},
  signOut: (userId: number | null) => {},
  edit: (userId: number, user: User) => {},

  authReady: false,
  error: null as string | null,
});

export const AuthContextProvider = ({children}: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
    const sessionIdData = localStorage.getItem('sessionId');
    if (sessionIdData) {
      setSessionId(JSON.parse(sessionIdData));
    }
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (user === null) {
      localStorage.removeItem('user');
    } else {
      localStorage.setItem('user', JSON.stringify(user));
    }
    setAuthReady(true);
  }, [user]);

  useEffect(() => {
    if (sessionId === null) {
      localStorage.removeItem('sessionId');
    } else {
      localStorage.setItem('sessionId', JSON.stringify(sessionId));
    }
  }, [sessionId]);

  const signIn = (login: string | null, email: string | null, password: string) => {
    setAuthReady(false);
    signInApi(login, email, password).then(
      response => {
        if (typeof response === 'string') {
          setError(response);
        } else {
          let newUser: User = { ...response, password: password };
          setUser(newUser);
          setSessionId(null);
        }
        setAuthReady(true);
      },
      _ => {
        setError(`Error 500: Unexpected problems occurred`);
        setAuthReady(true);
      }
    );
  };

  const signUp = (userData: User) => {
    setAuthReady(false);
    signUpApi(userData).then(
      response => {
        if (typeof response === 'string') {
          setError(response);
        } else {
          let newUser: User = { ...response, password: userData.password };
          setUser(newUser);
        }
        setAuthReady(true);
      },
      _ => {
        setError(`Error 500: Unexpected problems occurred`);
        setAuthReady(true);
      }
    );
  };

  const signOut = (userId: number | null) => {
    setAuthReady(false);
    if (userId === null) {
      setUser(null);
      setAuthReady(true);
      return;
    }
    signOutApi(userId).then(
      response => {
        if (typeof response === 'string') {
          setError(response);
        } else {
          setUser(null);
          setSessionId(null);
        }
        setAuthReady(true);
      },
      _ => {
        setError(`Error 500: Unexpected problems occurred`);
        setAuthReady(true);
      }
    );
  };

  const edit = (userId: number, userData: User) => {
    setAuthReady(false);
    editApi(userId, userData).then(
      response => {
        if (typeof response === 'string') {
          setError(response);
        } else {
          let newUser: User = { ...response, password: userData.password };
          setUser(newUser);
        }
        setAuthReady(true);
      },
      _ => {
        setError(`Error 500: Unexpected problems occurred`);
        setAuthReady(true);
      }
    );
  }

  return (
    <AuthContext.Provider value={{user, sessionId, setSessionId, signIn, signUp, signOut, edit, authReady, error}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext;
