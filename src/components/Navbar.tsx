"use server"
import Logo from "./Logo";
import React from "react";
import Link from "next/link";
import {logout} from "@/app/actions/auth";
import {createClient} from "@utils/supabase/server";


export default async function Navbar() {
    const supabase = await createClient()

    const { data:userData, error } = await supabase.auth.getUser()
    if (error) {
        console.error('Navbar auth error:', error)
    }
    const user = userData?.user;
    const isLoggedIn = !!user

    return (
        <div className="px-4">
        <div className=" px-4 sm:px-0 mx-auto text-base pt-4 w-full">
        <div className="flex items-center gap-2 justify-between">

            <div className="flex items-center">
                <Logo/>
                <div className="align-top">
                    <div className="text-4xl text-midnight font-[family-name:var(--font-sourceSans3)] font-semibold">Connections</div>
                    <div className="text-l text-steel font-[family-name:var(--font-sourceSans3)]">A Tiny Little Community App</div>
                </div>
            </div>


            <div className="flex items-center gap-5 text-sm">
                {!isLoggedIn  ?(
                    <>
                    <Link href="/signin"
                          className="btn-primary">
                        {'Log In'}
                    </Link>
                    <Link href="/signup" className="nav-link">Sign Up</Link>
                        </>
                        ) : (
                            <>
                            <Link href="/dashboard" className="nav-link">Dashboard</Link>
                            <form>
                                <button
                                    type="submit"
                                    formAction={logout}
                                    className="btn-secondary"
                                >
                                    Sign Out
                                </button>
                            </form>
                            </>

                )}
            </div>
        </div>
        </div>
        </div>
    )
}
