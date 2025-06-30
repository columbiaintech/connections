"use server";
import EventForm from "@/components/EventForm";
import {fetchColumns} from "@/app/actions/updateData";

export default async function New() {
    const dbColumns = await fetchColumns();

    return (
        <div className="items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
            <main className="w-full flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <div className="w-full list-inside text-sm text-center sm:text-left">
                    <EventForm dbColumns={dbColumns}/>
                </div>
            </main>
        </div>
    );
}

