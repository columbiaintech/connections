import Logo from "./Logo";
import React from "react";


export default function Navbar() {
    return (

        <div className="max-w-xl px-4 sm:px-0 mx-auto text-base pt-4 w-full">
        <div className="flex items-center gap-2 justify-between">

            <div className="flex items-center">
                <Logo/>
                <div className="align-top">
                    <div className="text-4xl text-midnight font-[family-name:var(--font-sourceSans3)] font-semibold">Connections</div>
                    <div className="text-l text-steel font-[family-name:var(--font-sourceSans3)]">A Tiny Little Community App</div>
                </div>
            </div>


            <div className="flex-right">
                <button
                    type="submit"
                    className="
                          text-s text-white rounded-sm px-2 py-1
                          flex items-center gap-4
                          justify-center
                          rounded-lg border border-sea-600
                          bg-gradient-to-r from-sea-600 to-sea
                          hover:opacity-90
                            shadow-[0_2px_0] shadow-sea

                          transition-all duration-200 ease-in-out
                          cursor-pointer font-[family-name:var(--font-fragment-mono)]"
                >
                    {'Log In'}
                </button>
            </div>
        </div>
        </div>
    )
}
