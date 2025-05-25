import Navbar from "@/components/Navbar";

export default function SignupConfirmation() {
    return (
        <div className="w-screen h-screen bg-style1 text-teal bg-cover bg-no-repeat bg-center">
            <div className="p-4">
                <Navbar />
            </div>
            <div className="max-w-md mx-auto sm:pt-12">
                <div className="bg-style2 shadow-sm sm:rounded-lg p-8 text-center">
                    <h1 className="text-2xl font-bold mb-4">Check your email</h1>
                    <p className="mb-6">
                        We've sent a confirmation email to your address. Please check your inbox and click the verification link to complete your signup.
                    </p>
                    <p className="text-gray-500">
                        If you don't see the email, check your spam folder or{" "}
                        <a href="/signup" className="text-sea-600 hover:text-sea-500 font-semibold">
                            try again
                        </a>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}