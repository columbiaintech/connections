"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { confirmSignUp } from '../app/actions/auth';
import { createClient } from '../../utils/supabase/client';

export default function EmailConfirmation() {
    const [status, setStatus] = useState('verifying');
    const [errorMessage, setErrorMessage] = useState('');
    const [user, setUser] = useState(null);
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        async function verifyEmail() {
            const tokenHash = searchParams.get('token_hash');
            const type = searchParams.get('type');
            const next = searchParams.get('next') || '/dashboard';

            if (!tokenHash || !type) {
                setStatus('error');
                setErrorMessage('Invalid confirmation link');
                return;
            }

            try {
                const supabase = createClient();

                const { data, error } = await supabase.auth.verifyOtp({
                    token_hash: tokenHash,
                    type: 'email'
                });

                if (error) {
                    console.error('Email verification error:', error);
                    setStatus('error');

                    if (error.message.includes('expired')) {
                        setErrorMessage('This confirmation link has expired. Please request a new one.');
                    } else if (error.message.includes('invalid')) {
                        setErrorMessage('This confirmation link is invalid or has already been used.');
                    } else {
                        setErrorMessage(error.message || 'Failed to verify email');
                    }
                } else if (data?.user) {
                    setStatus('success');
                    setUser(data.user);
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 2000);
                } else {
                    setStatus('error');
                    setErrorMessage('Email verification completed but no user data received.');
                }
            } catch (error) {
                console.error('Verification error:', error);
                setStatus('error');
                setErrorMessage('An unexpected error occurred during email verification. Please try again.');
            }
        }

        verifyEmail();
    }, [searchParams, router]);

    const handleGoToDashboard = () => {
        window.location.href = '/dashboard';
    };

    const handleResendConfirmation = () => {
        router.push('/signup');
    };


    return (
        <div className="max-w-xl px-4 sm:px-0 mx-auto text-base w-full">
            <div className="shadow-sm sm:rounded-lg bg-style2 text-gray-800 px-6 py-6 flex flex-col gap-4 items-center max-w-full">
                {status === 'verifying' && (
                    <>
                        <h2 className="text-xl font-bold">Verifying your email</h2>
                        <p>Please wait while we verify your email address...</p>
                        <div className="w-8 h-8 border-4 border-sea-600 border-t-transparent rounded-full animate-spin"></div>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <h2 className="text-xl font-bold text-green-600">Email verified successfully!</h2>
                        <p>Your email has been verified. You will be redirected to the dashboard shortly.</p>
                        <button
                            onClick={handleGoToDashboard}
                            className="text-s text-white rounded-sm px-4 py-2 flex items-center justify-center rounded-lg border border-sea-600 bg-gradient-to-r from-sea-600 to-sea hover:opacity-90 shadow-[0_2px_0] shadow-sea transition-all duration-200 ease-in-out cursor-pointer font-[family-name:var(--font-fragment-mono)]"
                        >
                            Go to Dashboard
                        </button>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <h2 className="text-xl font-bold text-red-600">Verification Failed</h2>
                        <p>{errorMessage || 'There was an error verifying your email. Please try again or contact support.'}</p>
                        <div className="space-y-3">
                            <button
                                onClick={handleResendConfirmation}
                                className="w-full relative justify-center cursor-pointer inline-flex items-center space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border text-white bg-gradient-to-r from-sea-600 to-sea shadow-[0_2px_0] shadow-sea hover:opacity-90 focus-visible:outline-sea-600 text-sm px-6 py-3 font-[family-name:var(--font-fragment-mono)]"
                            >
                                Get New Confirmation Link
                            </button>
                            <button
                                onClick={() => router.push('/signin')}
                                className="w-full relative justify-center cursor-pointer inline-flex items-center space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus-visible:outline-gray-600 text-sm px-6 py-3"
                            >
                                Back to Sign In
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}