"use client"

import Link from "next/link";
import React, {Dispatch, FormEvent, SetStateAction, useContext, useEffect, useState} from "react";
import AuthContext, {User} from "@/context/AuthContext";

let authContext: {
  user: User | null,
  signUp: (user: User) => void,
  authReady: Boolean,
  error: string | null,
}
let email: string;
let setEmail: Dispatch<SetStateAction<string>>;
let login: string;
let setLogin: Dispatch<SetStateAction<string>>;
let password: string;
let setPassword: Dispatch<SetStateAction<string>>;

function onSubmit(event: FormEvent) {
  event.preventDefault()
  const user = {
    "userId": -1,
    "email": email,
    "login": login,
    "password": password,
  }
  authContext.signUp(user);
}


export default function SignUpPage() {
  authContext = useContext(AuthContext);
  [email, setEmail] = useState("");
  [login, setLogin] = useState("");
  [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loaded,setLoaded] = React.useState(false);

  useEffect(() => {
    if (!authContext.authReady) {
      return;
    }
    if (authContext.user) {
      location.replace("/profile");
      return;
    }
    if (authContext.error !== null) {
      setError(authContext.error)
    }
    setLoaded(true);
  },[authContext.authReady]);

  if(!loaded){
    return <div></div>;
  }

  return (
    <>
      <section className="container mx-auto h-screen flex items-center justify-center">
        <form className="w-full max-w-sm" onSubmit={onSubmit}>
          <div className="mb-3">
            <p>{error}</p>
          </div>
          <div className="mb-3">
            <label className="block text-gray-500 text-sm font-bold mb-2" htmlFor="email">
              E-mail
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="text"
              placeholder="example@gmail.com"
              name={email}
              onChange={e => setEmail(e.currentTarget.value)}
            />
          </div>
          <div className="mb-3">
            <label className="block text-gray-500 text-sm font-bold mb-2" htmlFor="username">
              Username
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="username"
              type="text"
              placeholder="Username"
              name={login}
              onChange={e => setLogin(e.currentTarget.value)}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-500 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              placeholder="******************"
              name={password}
              onChange={e => setPassword(e.currentTarget.value)}
            />
          </div>
          <div className="md:items-center">
            <div className="mx-auto flex items-center justify-center">
              <button
                className="text-xl text-center text-white block bg-orange-500 p-3 rounded-2xl hover:bg-orange-400"
                type="submit"
                value="Submit"
              >
                Sign up
              </button>
            </div>
            <div className="mx-auto flex items-center justify-center">
              <Link href="/signin">
                <span className="text-sm text-gray-700 font-bold hover:text-blue-500">
                  Already have an account? Sign in!
                </span>
              </Link>
            </div>
          </div>
        </form>
      </section>
    </>
  )
}