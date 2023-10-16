'use client'

import React, {useContext, useEffect, useState} from "react";
import AuthContext, {AuthContextProvider} from "@/context/AuthContext";
import Link from "next/link";

export default function UserProfilePage() {
  const authContext = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [loaded,setLoaded] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!authContext.authReady) {
      return;
    }
    if (!authContext.user) {
      location.replace("/signin");
    } else {
      setName((authContext.user as { "name": string }).name);
      setEmail((authContext.user as { "email": string }).email);
      setPassword((authContext.user as { "password": string }).password);
      setLoaded(true);
    }
  },[authContext.authReady]);

  if(!loaded){
    return <div></div>;
  }

  function ClickSignOut() {
    if (authContext.user) {
      setLoaded(false);
      authContext.signOut(authContext.user);
    }
  }

  function saveChanges() {
    const updatedUser = {
      "email": email,
      "name": name,
      "password": password,
      };
      authContext.updateData(updatedUser);
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
                          {name}
                        </h3>
                      ) : (
                        <input className="text-black-500 outline-none outline-orange-500 rounded-xl"
                          style={{backgroundColor: 'black', color: 'white'}}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
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
