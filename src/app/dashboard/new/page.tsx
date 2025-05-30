"use server";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import NewGroupForm from "@/components/NewGroupForm";

export default async function New() {

        return (

            <div className="w-screen bg-style1 bg-cover bg-no-repeat bg-center grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
                <Navbar />
                <main className="w-full flex flex-col gap-8 row-start-2 items-center sm:items-start">
                    <div
                        className="w-full list-inside text-sm text-center sm:text-left">

                        <NewGroupForm/>
                    </div>
                </main>
            </div>
        );
    }

