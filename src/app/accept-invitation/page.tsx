'use server';
import {Suspense} from 'react';
import AcceptInvitation from "@/components/AcceptInvitation";

export default async function AcceptInvitationPage() {
    return (
        <div className="w-screen h-screen bg-style1 text-teal bg-cover bg-no-repeat bg-center">
            <Suspense fallback={<div className="text-center mt-10 text-white">Loading confirmation...</div>}>
                <AcceptInvitation/>
            </Suspense>
        </div>
    )
}