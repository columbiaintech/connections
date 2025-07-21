"use server";
import {fetchColumns} from "@/app/actions/updateData";

export default async function Home() {
    const dbColumns = await fetchColumns();
    return (
      <div className="min-h-screen">
          <div className="max-w-xl mx-auto sm:pt-12">
              <div className="grid grid-rows-[20px_1fr_20px] justify-items-center">
                  <main className="flex flex-col items-center sm:items-start">
                      <div
                  className=" bg-style2 bg-cover bg-no-repeat bg-center list-inside text-sm sm:text-left shadow-sm sm:rounded-lg">
                          {/*<EventForm dbColumns={dbColumns}/>*/}
                      </div>
                  </main>
              </div>
          </div>
    </div>
  );
}
