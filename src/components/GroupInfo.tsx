"use client";
import React, { useEffect, useState } from "react";
import { fetchUserGroupDetails } from "@/app/actions/updateData";
import AttendeesTable from "@/components/AttendeesTable";
import Link from "next/link";
import Viz from "@/components/Viz";


export default function GroupInfo({ groupData}:{groupData: any}) {
    const { group, events, members, attendees } = groupData;
    const getAttendeesForEvent = (eventId: string) => {
        return attendees.filter((a: any) => a.event_id === eventId);
    };

    return (
        <div className="space-y-6">
            <header>
                <h1 className="text-loch w-full font-[family-name:var(--font-sourceSans3)] text-3xl  rounded-sm"> {group.group_name} </h1>
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

                        {events.map((event: any) => (
                            <div key={event.event_id} className="border p-4 rounded card-teal">
                                <Link
                                    key={event.event_id}
                                    href={`/events/${event.event_id}`}
                                    className="block p-6 rounded-lg no-underline"
                                >
                                <h4 className="text-lg font-semibold">{event.event_name}</h4>
                                <p className="text-sm text-gray-600">{event.event_date}</p>
                                </Link>

                            </div>
                        ))}

                        <h3 className="text-xl font-semibold mb-2">Members</h3>
                        <ul className="list-disc ml-6 space-y-1">
                            {members.map((member: any) => (
                                <li key={member.user_id}>
                                    {member.email} – {member.role || "member"}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </section>
            <Viz groupData={groupData} />


        </div>
    );
}
