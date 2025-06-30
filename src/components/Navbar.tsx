import Logo from "./Logo";
import React from "react";
import Link from "next/link";
import {logout} from "@/app/actions/auth";


export default function Navbar() {
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
                <form>
                    <button
                        type="submit"
                        formAction={logout}
                        className="btn-secondary"
                    >
                        Sign Out
                    </button>
                </form>

                <Link href="/signin"
                    type="submit"
                    className="btn-primary">
                    {'Log In'}
                </Link>
                <Link href="/signup" className="nav-link">Sign Up</Link>
                <Link href="/dashboard" className="nav-link">Dashboard</Link>
                <Link href="/" className="nav-link">Home</Link>
                <Link href="/events/30a2d8c2-ca72-464d-a79b-8347479d3440" className="nav-link">Event</Link>

            </div>
        </div>
        </div>
        </div>
    )
}
