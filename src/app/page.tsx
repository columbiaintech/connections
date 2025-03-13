"use server";

import EventForm from "../components/EventForm";
import {fetchColumns} from "@/app/actions/updateData";
import Image from "next/image";
import RiveEmbed from "@/components/RiveEmbed";

export default async function Home() {
    const dbColumns = await fetchColumns();

  return (
      <div className="bg-style1 text-teal bg-cover bg-no-repeat bg-center min-h-screen grid grid-rows-[20px_1fr_20px] items-center justify-items-center p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-sourceSans3)]">
          <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
          <div className="flex items-center gap-2">
              {/*<Image*/}
              {/*    className="dark:invert"*/}
              {/*    src="/connections-color.svg"*/}
              {/*    alt="Connections logo mark"*/}
              {/*    width={55}*/}
              {/*    height={38}*/}
              {/*    priority*/}
              {/*/>*/}
              <RiveEmbed/>
              <div className="text-5xl font-[family-name:var(--font-sourceSans3)] font-semibold">Connections</div>
          </div>
        <EventForm dbColumns={dbColumns}/>
      </main>
    </div>
  );
}
