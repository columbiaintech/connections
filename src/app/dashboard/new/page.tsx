"use server";
import NewGroupForm from "@/components/NewGroupForm";

export default async function New() {

        return (
            <div className=" items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
                <main className="w-full flex flex-col gap-8 row-start-2 items-center sm:items-start">
                    <div className="w-full list-inside text-sm text-center sm:text-left">
                        <NewGroupForm/>
                    </div>
                </main>
            </div>
        );
    }

