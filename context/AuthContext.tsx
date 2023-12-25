'use client'

import React, {createContext, SetStateAction, useEffect, useState} from 'react';
import {editApi, postAvatar, signInApi, signOutApi, signUpApi} from "@/engine/api/Auth";

export interface User {
  token: string,
  userId: number,
  login: string,
  email: string,
  avatarId: number | null,
  password: string,
}

export interface UserEdit {
  token: string
  password: string,
  login?: string,
  email?: string,
  avatarId?: number | null,
}

export const AuthContext = createContext({
  user: null as User | null,

  sessionId: null as number | null,
  setSessionId: (newSessionId: SetStateAction<number | null>) => {},

  signIn: (login: string | null, email: string | null, password: string) => {},
  signUp: (user: User) => {},
  signOut: (token: string | null) => {},
  edit: (user: UserEdit) => {},
  updateAvatar: (avatarData: Blob | null, token: string, password: string) => {},

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

  const signOut = (token: string | null) => {
    setAuthReady(false);
    if (token === null) {
      setUser(null);
      setAuthReady(true);
      return;
    }
    signOutApi(token).then(
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

  const edit = (userData: UserEdit) => {
    setAuthReady(false);
    editApi(userData).then(
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

  const updateAvatar = (avatarData: Blob | null, token: string, password: string) => {
    if (user === null) {
      return;
    }
    setAuthReady(false);
    postAvatar(avatarData, token, password).then(
      response => {
        if (typeof response === 'string') {
          setError(response);
        } else {
          let newUser = {...user, avatarId: response};
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
    <AuthContext.Provider value={{user, sessionId, setSessionId, signIn, signUp, signOut, edit, updateAvatar, authReady, error}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext;
