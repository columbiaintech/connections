"use client";
import React from "react";
import Link from "next/link";
import Viz from "@/components/Viz";

export default function GroupInfo({ groupData}:{groupData: any}) {
    const { group, events, members, attendees, connections } = groupData;

    const eventStats = events.map((event: any) => {
        const eventAttendees = attendees.filter((a: any) => a.event_id === event.event_id);
        const total = eventAttendees.length;
        const eligible = eventAttendees.filter((a: any) => a.wants_intro).length;
        const connected = eventAttendees.filter((a: any) => a.connected).length;

        return {
            ...event,
            totalAttendees: total,
            totalEligibleForConnection: eligible,
            totalConnected: connected,
        };
    });

    return (
        <div className="space-y-6">
            <header>
                <h1 className="w-full font-[family-name:var(--font-sourceSans3)] text-3xl  rounded-sm"> {group.group_name} </h1>
            </header>

            <section>
                <h3 className="text-xl font-semibold mb-2">Events</h3>
                {events.length === 0 ? (
                    <div className="card-pink p-6 rounded-lg text-center space-y-3">
                        <p className="text-lg text-berry">No events found for this organization.</p>
                        <p className="text-sm text-steel">Create an event to invite members and start connecting.</p>
                        <div className="mt-4">
                            <Link href={`/events/new?group=${group.group_id}`} className="btn-primary">
                                Create Event
                            </Link>
                        </div>
                    </div>
                ) : (

                    <div className="space-y-4">
                        <div className="mt-4">
                            <Link href={`/events/new?group=${group.group_id}`} className="btn-primary">
                                Create Event
                            </Link>
                        </div>

                        {eventStats.map((event: any) => (
                            <div key={event.event_id} className="border rounded card-teal ">
                                <Link
                                    key={event.event_id}
                                    href={`/events/${event.event_id}`}
                                    className="flex justify-between items-start rounded-lg no-underline gap-4"
                                >
                                    <div className="flex-1 gap-6 text-center">
                                        <p className="text-xm">{event.event_date}</p>
                                        <h4 className="text-2xl font-semibold">{event.event_name}</h4>
                                    </div>

                                    <div className="flex gap-6 text-center">
                                        <div>
                                            <p className="text-sm">Attendees</p>
                                            <p className="text-2xl font-semibold text-loch">{event.totalAttendees}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm">Want Connection</p>
                                            <p className="text-2xl font-semibold text-loch">{event.totalEligibleForConnection}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm">Connected</p>
                                            <p className="text-2xl font-semibold text-loch">{event.totalConnected}</p>
                                        </div>
                                    </div>

                                </Link>

                            </div>
                        ))}
                    </div>
                )}
            </section>
            <Viz groupData={groupData} />


        </div>
    );
}
