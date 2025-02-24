"use server";
import Image from "next/image";
import {fetchEventDetails} from "@/app/actions/updateData";
import {fetchEventAttendees} from "@/app/actions/updateData";
import EventDisplay from "@/components/EventDisplay";
import AttendeesTable from "@/components/AttendeesTable";

type EventPageProps = {
    params: {
        eventId: string
    }
}

export default async function Home({params}:EventPageProps) {
    const param = await params
    const eventId = await param.eventID;
    if (!eventId) {
        return <div>Event ID is required</div>;
    }

    try {
        const [eventDetails, eventAttendees] = await Promise.all([
            fetchEventDetails(eventId),
            fetchEventAttendees(eventId)
        ]);
        console.log('Event details:', eventDetails);
        console.log('Event attendees:', eventAttendees);
        if (!eventDetails) {
            return <div>Event not found</div>;
        }

        return (
            <div
                className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
                <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
                    <p className="text-4xl font-[family-name:var(--font-geist-mono)]">Connections</p>
                    <div
                        className="list-inside text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
                        <div className="mb-2 text-xl">
                            Event Page:
                        </div>
                        {/*<EventDisplay eventDetails={eventDetails} eventAttendees={eventAttendees} />*/}
                        <AttendeesTable eventAttendees={eventAttendees} eventId={eventId}/>

                        {/*    TODO:
                    show event details and display registered users (fetch from db)
                    components: generate-pairs.tsx, send-email.tsx
                */}


                    </div>
                </main>
            </div>
        );
    }
    catch{
        return <div>Failed to load event details</div>;
    }
}
