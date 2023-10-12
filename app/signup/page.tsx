"use client"

import Link from "next/link";
import React, {Dispatch, SetStateAction, useContext, useState} from "react";
import AuthContext from "@/context/AuthContext";

let authContext: {
  signUp: (user: Object) => void
}
let email: string;
let setEmail: Dispatch<SetStateAction<string>>;
let username: string;
let setUsername: Dispatch<SetStateAction<string>>;
let password: string;
let setPassword: Dispatch<SetStateAction<string>>;

function onSubmit() {
  if (!email || ! username || !password) {
    alert("Empty user!")
    return
  }
  const user = {
    "email": email,
    "name": username,
    "password": password,
  }
  authContext.signUp(user);
}


export default function SignUpPage() {
  authContext = useContext(AuthContext);
  [email, setEmail] = useState("");
  [username, setUsername] = useState("");
  [password, setPassword] = useState("");

  return (
    <>
      <section className="container mx-auto h-screen flex items-center justify-center">
        <form className="w-full max-w-sm" onSubmit={onSubmit}>
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
              name={username}
              onChange={e => setUsername(e.currentTarget.value)}
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