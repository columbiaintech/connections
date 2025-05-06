"use client";
import React from "react";
import {useState, FormEvent} from "react";
// TODO: flesh out auth

interface SignUpFormProps {
    dbColumns: string[];
}

interface SignUpFormData{
    eventName: string;
    eventDate: Date | null;
    mappedData: Record<string, any>[];
}

function SignUpForm() {

    async function handleSubmit(event:FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);
    }

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');




    return (
        <div className="max-w-xl px-4 sm:px-0 mx-auto text-base w-full">
            <form className=" shadow-sm sm:rounded-lg bg-style2 text-gray-800 px-6 py-6 flex flex-col gap-4 items-start max-w-full"  onSubmit={handleSubmit}>

<div className="flex-row">
                <div className="flex items-center gap-4 pb-4 w-full">
                    <div className="flex-col">
                <p className="text-gray-500">First name</p>
                <input name="firstName" value={firstName} onChange={(e)=>setFirstName(e.target.value)}
                       spellCheck="false"
                       autoCapitalize="words"
                       className="ps-2 py-1 text-gray-800
                        font-[family-name:var(--font-sourceSans3)] text-l
                       outline-2 outline-offset-2 outline-solid
                       focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gray-200 rounded-sm
                           border border-solid border-gray-200

"
                       placeholder={"First name"}
                />
                 </div>

                    <div className="flex-col ">
                        <p className="text-gray-500">Last name</p>

                        <input name="lastName" value={lastName} onChange={(e)=>setLastName(e.target.value)}
                               spellCheck="false"
                               autoCapitalize="words"
                               className="ps-2 py-1 text-gray-800

                        font-[family-name:var(--font-sourceSans3)] text-l
                       outline-2 outline-offset-2 outline-solid
                       focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-gray-200 rounded-sm
                                                  border border-solid border-gray-200

                       "
                               placeholder={"Last name"}
                               />
                </div>
                </div>

    <div className="flex items-center gap-4 pb-4 w-full flex-col">
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
 flex items-center gap-4 pb-4 w-full flex-col">
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

                    {'Create Account'}
                </button>

            </div>
                <p className="text-gray-500">Already have an account? <a href="/signin" className="text-sea-600 hover:text-sea-500 font-semibold">Sign in</a></p>

            </form>
            {<p className="text-red-500">{}</p>}

        </div>
    );
}
export default SignUpForm;