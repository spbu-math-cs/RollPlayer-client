"use client"

import {
  createContext, useEffect,
  useState,
} from 'react'

const AuthContext = createContext({
  user: null as Object | null,
  signIn: (username: string, password: string) => {},
  signUp: (user: Object) => {},
  signOut: (user: Object) => {},
  authReady: false,
});

export const AuthContextProvider = ({children}: any) => {
  const [user, setUser] = useState<Object | null>(null)
  const [authReady, setAuthReady] = useState(false)

  useEffect(() => {
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, []);

  useEffect(() => {
    if (user === null) {
      localStorage.removeItem("user")
    } else {
      localStorage.setItem("user", JSON.stringify(user))
    }
  }, [user]);

  const signIn = (username: string, password: string) => {
    // signInApi(username, password)
    if (username === 'admin' && password === '1234') { // FIXME: tmp solution
      const newUser = {
        "email": "example@gmail.com",
        "name": username,
        "password": password,
      }
      setUser(newUser)
    }
  }

  const signUp = (userData: Object) => {
    // signUpApi(user)
    setUser(userData) // FIXME: tmp solution
  }

  const signOut = (userData: Object) => {
    // signOutApi(user)
    setUser(null) // FIXME: tmp solution
  }

  return (
      <AuthContext.Provider value={{user, signIn, signUp, signOut, authReady}}>
        { children }
      </AuthContext.Provider>
  )
}

export default AuthContext