'use client'

import React, {useContext, useEffect, useState} from "react";
import AuthContext, {User} from "@/context/AuthContext";
import Link from "next/link";
import _ from "lodash";

export default function UserProfilePage() {
  const authContext = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [loaded,setLoaded] = useState(false);
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!authContext.authReady) {
      return;
    }
    if (!authContext.user) {
      location.replace("/signin");
    } else {
      setLogin(authContext.user.login || "None");
      setEmail(authContext.user.email || "None");
      setPassword(authContext.user.password || "None");
      setLoaded(true);
    }
  },[authContext.authReady]);

  if(!loaded){
    return <div></div>;
  }

  function ClickSignOut() {
    let userId = authContext.user?.userId
    authContext.signOut(userId ? userId : null);
  }

  function saveChanges() {
    if (authContext.user?.userId === undefined) {
      return;
    }
    const updatedUser: User = {
      "userId": authContext.user.userId,
      "email": authContext.user.email,
      "login": authContext.user.login,
      "password": password,
    };
    if (email !== "None") {
      updatedUser["email"] = email;
    }
    if (login !== "None") {
      updatedUser["login"] = login;
    }
    if (_.isEqual(updatedUser, authContext.user)) {
      return;
    }
    authContext.edit(authContext.user.userId, updatedUser);
  }

  return (
    <>
      {(
        <section className="container mx-auto h-screen flex items-center justify-center width-700">
          <div className="w-full max-w-xxl ">
            <h2 className="block text-white-300 text-center text-xl mb-8">
              <AuthContext.Consumer>
                {() => (
                  <div>
                    <div>
                      <img className="mx-auto"
                        src={"https://i.pinimg.com/originals/45/73/19/457319eeee8a2028e99293c7b83fa702.jpg"}
                        width="200" height="200"
                        style={{borderRadius: '50%'}}
                        alt={"User img"}
                      />
                    </div>
                      <div>
                      {!editMode ? (
                        <h3 className="text-2xl text-orange-400">
                          {login}
                        </h3>
                      ) : (
                        <input className="text-black-500 outline-none outline-orange-500 rounded-xl"
                          style={{backgroundColor: 'black', color: 'white'}}
                          value={login}
                          onChange={(e) => setLogin(e.target.value)}
                          placeholder="Name">
                        </input>
                      )}
                      </div>
                      <div>
                      {!editMode ? (
                        <p className="text-sm text-gray-500 ">
                          Email: {email}</p>
                      ) : (
                        <input className="text-black-500 m-1.5 outline-none outline-orange-500 rounded-xl"
                               style={{backgroundColor: 'black', color: 'white'}}
                               value={email}
                               onChange={(e) => setEmail(e.target.value)}
                               placeholder="Email">
                        </input>
                      )}
                      </div>
                      <div>
                      {editMode && (
                        <input className="text-black-500 outline-none outline-orange-500 rounded-xl"
                               style={{backgroundColor: 'black', color: 'white'}}
                               value={password}
                               onChange={(e) => setPassword(e.target.value)}
                               type="password"
                               placeholder="Password">
                        </input>
                      )}
                      </div>
                      <button type="button"
                        className="text-m text-white-200  text-end"
                        onClick={() => {
                          if (editMode) {
                            saveChanges();
                          }
                          setEditMode(!editMode);
                      }}>
                        {editMode ? 'Save Changes' : 'Edit Profile'}
                  </button>
                    </div>)
                }
              </AuthContext.Consumer>
            </h2>
              <div className="mx-auto flex items-end justify-end">
                <Link href="/signin">
                  <span
                    onClick={ClickSignOut}
                    className="text-xl text-end text-white block bg-orange-500 p-3 rounded-2xl hover:bg-orange-400">
                      Sign Out
                  </span>
                </Link>
              </div>
          </div>
        </section>
      )}
    </>
  );
}
