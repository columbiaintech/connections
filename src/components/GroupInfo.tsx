"use client";
import React, { useEffect, useState } from "react";
import { fetchUserGroupDetails } from "@/app/actions/updateData";
import AttendeesTable from "@/components/AttendeesTable";


export default function GroupInfo({ groupData}:{groupData: any}) {
    const { group, events, members, attendees } = groupData;
    const getAttendeesForEvent = (eventId: string) => {
        return attendees.filter((a: any) => a.event_id === eventId);
    };

    return (
        <div className="space-y-10 card-white">
            <header>
                <h1 className="ps-2 text-loch w-full font-[family-name:var(--font-sourceSans3)] text-3xl  rounded-sm">Your {group.group_name} Organization</h1>
            </header>

            <section>
                <h3 className="text-xl font-semibold mb-2">Events</h3>
                {events.length === 0 ? (
                    <div className="card-pink p-6 rounded-lg text-center space-y-3">
                        <p className="text-lg text-berry">No events found for this organization.</p>
                        <p className="text-sm text-steel">Create an event to invite members and start connecting.</p>
                        <div className="mt-4">
                            <a href="/dashboard/create-event" className="btn-primary">Create Event</a>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {events.map((event: any) => (
                            <div key={event.event_id} className="border p-4 rounded">
                                <h4 className="text-lg font-semibold">{event.event_name}</h4>
                                <p className="text-sm text-gray-600">{event.event_date}</p>
                                <AttendeesTable
                                    eventAttendees={getAttendeesForEvent(event.event_id)}
                                    eventId={event.event_id}
                                />
                            </div>
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h3 className="text-xl font-semibold mb-2">Members</h3>
                <ul className="list-disc ml-6 space-y-1">
                    {members.map((member: any) => (
                        <li key={member.user_id}>
                            {member.email} – {member.role || "member"}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
