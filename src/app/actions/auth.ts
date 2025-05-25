'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import {createClient} from '@utils/supabase/server'

export async function signin(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('emailAddress') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })


    if (error) {
        return { error: error.message }
    }
    revalidatePath('/', 'layout')
    redirect('/dashboard')
}

export async function signup(formData: FormData) {
    const supabase = await createClient()

    const email = formData.get('emailAddress') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: firstName,
                last_name: lastName,
                full_name: `${firstName} ${lastName}`,
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
        },
    })

    if (error) {
        return { error: error.message }
    }

    if (data?.user?.identities?.length === 0) {
        return { error: 'Email already exists' }
    }
    return { success: true }
}


export async function logout() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')
}

export async function confirmSignUp(token: string, type: string) {
    const supabase = await createClient()

    const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
    })

    if (error) {
        return { error: error.message }
    }

    return { success: true }
}