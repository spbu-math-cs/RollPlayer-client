'use client'

import React, {ChangeEvent, useContext, useEffect, useRef, useState} from "react";
import AuthContext from "@/context/AuthContext";
import Link from "next/link";
import {getAvatar} from "@/engine/api/Auth";

export default function UserProfilePage() {
  const authContext = useContext(AuthContext);
  const [editMode, setEditMode] = useState(false);
  const [loaded,setLoaded] = useState(false);
  const [login, setLogin] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [_, setAvatarId] = useState<number | null>(null);
  const [avatar, setAvatar] = useState<Blob | null>(null);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const inputAvatar = useRef<HTMLInputElement | null>(null);

  function downloadAvatar(newAvatarId: number | null) {
    setAvatarId(newAvatarId);
    if (newAvatarId === null) {
      setAvatarLoaded(true);
      return;
    }
    getAvatar(newAvatarId).then(
      response => {
        if (typeof response !== 'string') {
          setAvatar(response);
        }
        setAvatarLoaded(true);
      }
    );
  }

  useEffect(() => {
    if (!authContext.authReady) {
      return;
    }
    if (!authContext.user) {
      location.replace("/signin");
    } else {
      setLogin(authContext.user.login);
      setEmail(authContext.user.email);
      setPassword(authContext.user.password);
      downloadAvatar(authContext.user.avatarId);
      setLoaded(true);
    }
  },[authContext.authReady]);

  if(!loaded){
    return <div></div>;
  }

  function ClickSignOut() {
    let token = authContext.user?.token
    authContext.signOut(token ? token : null);
  }

  function saveChanges() {
    if (authContext.user?.userId === undefined) {
      return;
    }
    const updatedUser: {token: string, password: string, email?: string, login?: string, avatarId?: number} = {
      token: authContext.user.token,
      password: authContext.user.password,
    };
    if (email !== "" && email !== authContext.user.email) {
      updatedUser.email = email;
    }
    if (login !== "" && login !== authContext.user.login) {
      updatedUser.login = login;
    }
    if (password !== "") {
      updatedUser.password = password;
    }
    authContext.edit(updatedUser);
  }

  function onImageClick() {
    if (!editMode) {
      return;
    }
    inputAvatar.current?.click();
  }

  function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    if (event.target.files === null || authContext.user === null) {
      return;
    }
    const newAvatarImage = event.target.files[0];
    const newAvatar = new Blob([newAvatarImage]);
    authContext.updateAvatar(newAvatar, authContext.user.token, authContext.user.password);
  }

  return (
    <>
      {(
        <section className="container mx-auto h-screen flex items-center justify-center width-700">
          <input type='file' id='file' ref={inputAvatar} style={{display: 'none'}} onChange={uploadAvatar}/>
          <div className="w-full max-w-xxl ">
            <h2 className="block text-white-300 text-center text-xl mb-8">
              <AuthContext.Consumer>
                {() => (
                  <div>
                    <div>
                      <img className={`mx-auto mb-3 ${!editMode ? "" : "hover:brightness-75"}`}
                        src={!avatarLoaded ? undefined : avatar ? URL.createObjectURL(avatar) :
                          "https://i.pinimg.com/originals/45/73/19/457319eeee8a2028e99293c7b83fa702.jpg"}
                        width="200" height="200"
                        style={{borderRadius: '50%'}}
                        alt={"User img"}
                        onClick={onImageClick}
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
