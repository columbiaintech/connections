"use server";
import {fetchEventDetails} from "@/app/actions/updateData";
import {fetchEventAttendees} from "@/app/actions/updateData";
import AttendeesTable from "@/components/AttendeesTable";
import ConnectionsTable from "@/components/ConnectionsTable";
import TabNavigator from "@/components/TabNavigator";

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

            <div className=" items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
                <main className="w-full flex flex-col gap-8 row-start-2 items-center sm:items-start">
                    <div
                        className="w-full bg-style2 bg-cover bg-no-repeat bg-center list-inside text-sm text-center sm:text-left shadow-sm sm:rounded-lg">
                        <TabNavigator tabs={[
                            {id: 'attendees', label:'Attendees', content: <AttendeesTable eventAttendees={eventAttendees} eventId={eventId}/>},
                            {id: 'connections', label:'Connections', content: <ConnectionsTable eventAttendees={eventAttendees} eventId={eventId}/>}
                            ]}/>
                    </div>
                </main>
            </div>
        );
    }
    catch{
        return <div>Failed to load event details</div>;
    }
}
