"use client";
import React from "react";
import {useState, FormEvent} from "react";
// TODO: flesh out auth

interface SignInFormProps {
    dbColumns: string[];
}

interface SignInFormData{
    eventName: string;
    eventDate: Date | null;
    mappedData: Record<string, any>[];
}

function SignInForm() {

    async function handleSubmit(event:FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
    }

    const [emailAddress, setEmailAddress] = useState('');




    return (
        <div className="w-full px-4 sm:px-0 mx-auto text-base">
            <form className="text-gray-800 px-6 py-6 flex flex-col gap-4 items-start max-w-full"  onSubmit={handleSubmit}>

                <div className="flex flex-col w-full">

                    <div className="flex items-center gap-4 pb-4 w-full flex-row">
                        <div className="w-full">

                            <p className="text-gray-500">Email address</p>
                            <input name="emailAddress" value={emailAddress} onChange={(e)=>setEmailAddress(e.target.value)}
                                   spellCheck="false"
                                   autoCapitalize="words"
                                   className="w-full ps-2 py-1 text-gray-800
                            font-[family-name:var(--font-sourceSans3)] text-l
                           outline-2 outline-offset-2 outline-solid
                           focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gray-200 rounded-sm
                                                      border border-solid border-gray-200

                           "
                                   placeholder={"Email address"}
                            />
                        </div>
                    </div>
                    <div className="items-stretch
 flex items-center gap-4 pb-4 w-full flex-row">
                        <div className="w-full">
                            <p className="text-gray-500">Password</p>
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
                        className="text-s bg-sea-600 hover:bg-sea-500 text-white rounded-sm px-2 py-1 cursor-pointer font-[family-name:var(--font-fragment-mono)]">

                        {'Log In'}
                    </button>
                </div>
                <p className="text-gray-500">Don't have an account? <a href="/signup" className="text-sea-600 hover:text-sea-500 font-semibold">Sign up</a></p>

            </form>
            {<p className="text-red-500">{}</p>}

        </div>
    );
}
export default SignInForm;