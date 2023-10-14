// // userProfile.tsx
'use client'
import React, {useContext, useEffect} from "react";
import AuthContext from "@/context/AuthContext";
import Link from "next/link";

// let authContext: {
//     signIn: (username: string, password: string) => void;
//     signOut: (user: Object) => void;
//     user: { username: string, email: string } | null;
//     signUp: (user: Object) => void;
//     authReady: boolean
// }
export default function UserProfilePage() {
    let authContext = useContext(AuthContext);



    if (!authContext.user) {
        window.location.href = '/signin';
    }
    function ClickSignOut(){
        authContext.user = null
    }


    return (
        <>
            {(
                <section className="container mx-auto h-screen flex items-center justify-center">
                    <div className="w-full max-w-sm">
                        <h1 className="block text-gray-500 text-center text-xl font-bold mb-4">User Profile</h1>

                        <h2 className="block text-gray-700 text-center text-lg mb-2">
                            <AuthContext.Consumer>
                                {(user) => (
                                    <h3>
                                        {`Hello, ${user}!`}
                                    </h3>)
                                }
                            </AuthContext.Consumer>
                        </h2>

                        <div className="mx-auto flex items-center justify-center">

                            <Link href="/signin">
                                <span
                                    onClick={ClickSignOut}
                                    className="text-xl text-center text-white block bg-orange-500 p-3 rounded-2xl hover:bg-orange-400">
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