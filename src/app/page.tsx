"use server";
import {fetchColumns} from "@/app/actions/updateData";
import Link from "next/link";

export default async function Home() {
    const dbColumns = await fetchColumns();
    return (
      <div className="min-h-screen">
          <div className="max-w-xl mx-auto sm:pt-12">
              <div className="grid grid-rows-[20px_1fr_20px] justify-items-center">
                  <main className="flex flex-col items-center sm:items-start">
                      <div
                  className=" bg-style2 bg-cover bg-no-repeat bg-center list-inside text-sm sm:text-left shadow-sm sm:rounded-lg">
                          <div className="card-white p-6">
                              <p className="text-lg text-loch">Connections sets up introductions between members of the Columbia in Tech community.</p>
                              <p className="text-sm text-steel">Learn more about Columbia in Tech <Link className="text-loch underline" href="https://www.columbiaintech.com/">here</Link>.</p>
                          </div>

                      </div>
                  </main>
              </div>
          </div>
    </div>
  );
}
