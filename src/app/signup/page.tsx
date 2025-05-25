import {fetchColumns} from "@/app/actions/updateData";
import Navbar from "@/components/Navbar";
import SignUpForm from "@/components/SignUpForm";


export default async function SignUp() {
    return (
        <div className="w-screen h-screen bg-style1 text-teal bg-cover bg-no-repeat bg-center">
            <div className="p-4">
                <Navbar />
            </div>
            <div className="max-w-sm mx-auto sm:pt-12">

                <div className="grid grid-rows-[20px_1fr_20px] justify-items-center">
                    <main className="flex flex-col items-center sm:items-start">
                        <div
                            className=" bg-style2 bg-cover bg-no-repeat bg-center list-inside text-sm sm:text-left shadow-sm sm:rounded-lg">
                        <SignUpForm/>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
