"use client";
import React from "react";
import {signin} from "../app/actions/auth"

function SignInForm() {

    return (
        <div className="w-full px-4 sm:px-0 mx-auto text-base">
            <form className="card-white sm:rounded-lg text-gray-800 px-6 py-6 flex flex-col gap-4 items-start max-w-full">
                <div className="flex flex-col w-full">
                    <div className="flex items-center gap-4 pb-4 w-full flex-row">
                        <div className="w-full">
                            <label htmlFor="emailAddress" className="text-gray-500">Email address</label>
                            <input id="emailAddress" name="emailAddress"
                                   spellCheck="false"
                                   autoCapitalize="none"
                                   className="w-full ps-2 py-1 text-gray-800
                                   font-[family-name:var(--font-sourceSans3)] text-l
                                   outline-2 outline-offset-2 outline-solid
                                   focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gray-200 rounded-sm
                                                              border border-solid border-gray-200
                                    "
                                   placeholder={"Email address"} required
                            />
                        </div>
                    </div>
                    <div className="items-stretch flex items-center gap-4 pb-4 w-full flex-row">
                        <div className="w-full">
                            <label htmlFor="password" className="text-gray-500">Password</label>
                            <input id="password" name="password" type="password"
                                   className="w-full ps-2 py-1 text-gray-800
                           font-[family-name:var(--font-sourceSans3)] text-l
                           outline-2 outline-offset-2 outline-solid
                           focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gray-200 rounded-sm
                           border border-solid border-gray-200
                           "
                                   placeholder={"Enter password"}/>
                        </div>
                    </div>

                    <button
                        type="submit"
                        formAction={signin}
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
                        Sign In
                    </button>
                </div>
                <p className="text-gray-500">Don't have an account? <a href="/signup" className="text-sea-600 hover:text-sea-500 font-semibold">Sign up</a></p>
            </form>
        </div>
    );
}
export default SignInForm;