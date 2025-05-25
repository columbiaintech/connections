'use client'

import { useEffect, useState } from 'react'
import {createClient} from '@utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import EmailConfirmation from '@/components/EmailConfirmation'

export default function ConfirmPage() {
    return (
        <div className="w-screen h-screen bg-style1 text-teal bg-cover bg-no-repeat bg-center">
            <div className="p-4">
                <Navbar />
            </div>
            <EmailConfirmation/>
        </div>
    )
}