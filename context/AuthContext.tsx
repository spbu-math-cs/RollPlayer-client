import {
  createContext,
  useState,
} from 'react'
import {signInApi, signOutApi, signUpApi} from "@/engine/api/Auth";

const AuthContext = createContext({
  user: null,
  signIn: (username: string, password: string) => {
  },
  signUp: (user: Object) => {
  },
  signOut: (user: Object) => {
  },
  authReady: false,
})

export const AuthContextProvider = ({children}: any) => {
  const [user, setUser] = useState(null)
  const [authReady, setAuthReady] = useState(false)

  const signIn = (username: string, password: string) => {
    signInApi(username, password).then()
  }

  const signUp = (user: Object) => {
    signUpApi(user).then()
  }

  const signOut = (user: Object) => {
    signOutApi(user).then()
  }

  return (
      <AuthContext.Provider value={{user, signIn, signUp, signOut, authReady}}>
        { children }
      </AuthContext.Provider>
  )
}

export default AuthContext