"use client"

import {
  createContext, useEffect,
  useState,
} from 'react'
import {editApi, signInApi, signOutApi, signUpApi} from "@/engine/api/Auth";

export interface User {
  userId?: number,
  email?: string,
  login?: string,
  password?: string,
}

const AuthContext = createContext({
  user: null as User | null,
  signIn: (login: string | null, email: string | null, password: string) => {},
  signUp: (user: User) => {},
  signOut: (userId: number, sessionId: number | null) => {},
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
      localStorage.removeItem("user");
    } else {
      localStorage.setItem("user", JSON.stringify(user));
    }
    setAuthReady(true);
  }, [user]);

  const signIn = (login: string | null, email: string | null, password: string) => {
    setAuthReady(false);
    signInApi(login, email, password).then(
      response => {
        if (typeof response === "string") {
          setError(response);
        } else {
          const newUser: User = {
            "userId": response,
            "password": password,
          }
          if (login !== null) {
            newUser["login"] = login;
          }
          if (email !== null) {
            newUser["email"] = email;
          }
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
        if (typeof response === "string") {
          setError(response);
        } else {
          const newUser = userData;
          newUser["userId"] = response;
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

  const signOut = (userId: number, sessionId: number | null) => {
    setAuthReady(false);
    signOutApi(userId, sessionId).then(
      response => {
        if (typeof response === "string") {
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
        if (typeof response === "string") {
          setError(response);
        } else {
          setUser(userData);
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
        { children }
      </AuthContext.Provider>
  )
}

export default AuthContext;