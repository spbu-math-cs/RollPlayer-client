'use client'


import React, {useContext} from "react";
import AuthContext from "@/context/AuthContext";
import Link from "next/link";

export default function UserProfilePage() {
    let authContext = useContext(AuthContext);
    const [editMode, setEditMode] = React.useState(false);


    if (!authContext.user) {
        location.href = '/signin';
    }


    function ClickSignOut() {
        authContext.signOut(authContext.user!!)
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
                                            />

                                        </div>


                                        <h3 className="text-2xl text-orange-400">
                                            {` ${(authContext.user as { "name": string }).name}`}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            Email: {`${(authContext.user as { "email": string }).email}`}
                                        </p>
                                        <button type="button" className="text-m text-white-200  text-end"
                                                onClick={() => setEditMode(!editMode)}>
                                            {editMode ? 'Save Changes' : 'Edit Profile'}
                                        </button>

                                        {/* Edit Mode */}
                                        {editMode && (
                                            <div>
                                                {/* Add the editable inputs here */}
                                            </div>
                                        )}

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
