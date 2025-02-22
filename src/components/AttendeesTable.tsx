"use client";
import {parse} from 'papaparse';
import React, {useState, useEffect} from "react";

// TODO: displays attendees in table format on the event page, allows user to modify db if needed (delete, update, create)

interface AttendeesTableProps{
    eventAttendees: string[];
}

export default function AttendeesTable({eventAttendees}: AttendeesTableProps){


    return(
        <div className="w-screen max-w-2xl mx-auto">
            <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Attendees</h3>
            </div>


            <div className="space-y-1 w-full">
                {eventAttendees.map((attendee) => (
                    <div
                        key={attendee.user_id}
                        className="px-2 border rounded-lg"
                    >
                        <div className="flex items-center justify-between">
                            <p className="font-semibold">{attendee.users?.name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{attendee.users?.job_title || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{attendee.users?.company_name || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{attendee.users?.school || 'N/A'}</p>
                            <p className="text-sm text-gray-600">{attendee.users?.class_year || 'N/A'}</p>

                            <span className="inline-block mt-2 mb-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    {attendee.wants_intro ? 'Wants Intro' : 'No Intro'}
                                </span>
                            <span className="inline-block mt-2 mb-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    {'x'}
                                </span>
                            <span className="inline-block mt-2 mb-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    {'edit'}
                                </span>

                        </div>
                    </div>
                ))}
            </div>

        </div>
    )
}