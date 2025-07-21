import SignInForm from "@/components/SignInForm";

export default async function SignIn() {
    return (
        <div>
            <div className="max-w-sm mx-auto sm:pt-12 h-full">
                <div
                    className=" bg-style2 bg-cover bg-no-repeat bg-center list-inside text-sm sm:text-left shadow-sm sm:rounded-lg">
                    <SignInForm/>
                </div>
            </div>
        </div>
    );
}
