'use client'

import {createContext, useEffect, useState,} from 'react'
import {editApi, signInApi, signOutApi, signUpApi} from "@/engine/api/Auth";

export interface User {
  userId?: number,
  email?: string,
  login?: string,
  password?: string,
}

export const AuthContext = createContext({
  user: null as User | null,
  signIn: (login: string | null, email: string | null, password: string) => {},
  signUp: (user: User) => {},
  signOut: (userId: number | null) => {},
  edit: (userId: number, user: User) => {},
  authReady: false,
  error: null as string | null,
});

export const AuthContextProvider = ({children}: any) => {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
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

  const signIn = (login: string | null, email: string | null, password: string) => {
    setAuthReady(false);
    signInApi(login, email, password).then(
      response => {
        if (typeof response === 'string') {
          setError(response);
        } else {
          let newUser: User = response;
          newUser.password = password;
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

  const signUp = (userData: User) => {
    setAuthReady(false);
    signUpApi(userData).then(
      response => {
        if (typeof response === 'string') {
          setError(response);
        } else {
          let newUser: User = response;
          newUser.password = userData.password;
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
          let newUser: User = response;
          newUser.password = userData.password;
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
    <AuthContext.Provider value={{user, signIn, signUp, signOut, edit, authReady, error}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext;
