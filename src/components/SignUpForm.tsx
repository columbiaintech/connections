"use client";
import React from "react";
import {useState} from "react";
import {signup} from "../app/actions/auth.ts"

function SignUpForm() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [emailAddress, setEmailAddress] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSignUp = async (formData) => {
        setError('');
        setIsLoading(true);

        try{
                const emailAddress = formData.get('emailAddress');
                const password = formData.get('password');
                const firstName = formData.get('firstName');
                const lastName = formData.get('lastName');
                if (!firstName || !lastName || !emailAddress || !password) {
                    setError('Please fill out all fields');
                    setIsLoading(false);
                    return;
                }
                const result = await signup(formData);
                if (result?.error) {
                    setError(result.error.message);}
                else{
                    setIsSuccess(true);
                }
            } catch(e){
                setError(e.message||'An error has occurred. Please try again.')
            } finally{
            setIsLoading(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-xl px-4 sm:px-0 mx-auto text-base w-full">
                <div className="shadow-sm sm:rounded-lg bg-style2 text-gray-800 px-6 py-6 flex flex-col gap-4 items-start max-w-full">
                    <h2 className="text-xl font-semibold text-gray-800">Check your email</h2>
                    <p className="text-gray-600">
                        We've sent a confirmation link to your email address. Please check your inbox and click the link to confirm your account.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-xl px-4 sm:px-0 mx-auto text-base w-full">
            <form action={handleSignUp} className=" shadow-sm sm:rounded-lg bg-style2 text-gray-800 px-6 py-6 flex flex-col gap-4 items-start max-w-full">
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
                               border border-solid border-gray-200"
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
               value={password} onChange={(e)=>setPassword(e.target.value)}
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
            type="submit" disabled={isLoading}
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
        {isLoading? 'Signing Up...':'Sign Up'}
    </button>
</div>
                <p className="text-gray-500">Already have an account? <a href="/signin" className="text-sea-600 hover:text-sea-500 font-semibold">Sign in</a></p>
            </form>
            {<p className="text-red-500">{error}</p>}
        </div>
    );
}
export default SignUpForm;