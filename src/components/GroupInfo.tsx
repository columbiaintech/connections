"use client";
import React, { useEffect, useState } from "react";
import { fetchUserGroupDetails } from "@/app/actions/updateData";
import AttendeesTable from "@/components/AttendeesTable";


async function GroupInfo({ userId }: { userId: string }) {
    const [loading, setLoading] = useState(true);
    const [events, setEvents] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadGroupData() {
            try {
                const { events, members } = await fetchGroupEventsAndMembers(org.group_id);
                setEvents(events);
                setMembers(members);
            } catch (err) {
                setError("Failed to fetch group data");
            } finally {
                setLoading(false);
            }
        }

        loadGroupData();
    }, [org.group_id]);

    if (loading) return <p>Loading group info...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{org.group_name}</h2>

            <section>
                <h3 className="text-xl font-semibold">Events</h3>
                {events.length === 0 ? (
                    <p>No events found.</p>
                ) : (
                    events.map(event => (
                        <div key={event.event_id} className="border p-4 rounded">
                            <h4 className="text-lg font-semibold">{event.event_name}</h4>
                            <p className="text-sm text-gray-600">{event.event_date}</p>
                            <AttendeesTable eventAttendees={event.attendees} eventId={event.event_id} />
                        </div>
                    ))
                )}
            </section>

            <section>
                <h3 className="text-xl font-semibold">Members</h3>
                <ul className="list-disc ml-6">
                    {members.map(member => (
                        <li key={member.user_id}>
                            {member.email} - {member.role}
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
