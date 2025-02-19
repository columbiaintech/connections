"use server";

import EventForm from "../components/EventForm";
import {fetchColumns} from "@/app/actions/updateData";

export default async function Home() {
    const columns = await fetchColumns();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <p className="text-4xl font-[family-name:var(--font-geist-mono)]">Connections</p>
        <EventForm dbColumns={columns}/>
      </main>
    </div>
  );
}
