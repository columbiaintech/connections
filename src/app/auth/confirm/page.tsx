'use server'
import Navbar from '@/components/Navbar'
import EmailConfirmation from '@/components/EmailConfirmation'
import {Suspense} from "react";

export default async function ConfirmPage() {
    return (
        <div className="w-screen h-screen bg-style1 text-teal bg-cover bg-no-repeat bg-center">
            <Suspense fallback={<div className="text-center mt-10 text-white">Loading confirmation...</div>}>
                <EmailConfirmation/>
            </Suspense>
        </div>
    )
}