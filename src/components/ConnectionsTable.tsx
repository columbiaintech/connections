"use client";

// TODO: update the table to display user names instead of IDs, add Send Email button for each row

import React, { useState, useEffect } from 'react';
import {fetchEventConnections, generateRandomConnections} from "@/app/actions/updateData";

interface ConnectionsTableProps {
    eventId: string;
}

export default function ConnectionsTable({ eventId }: ConnectionsTableProps) {
    const [connections, setConnections] = useState([]);
    const [attendees, setAttendees] = useState([]);
    const [selectedAttendees, setSelectedAttendees] = useState([]);

    const [wants_intro, setWantsIntro] = useState(false);
    const [loading, setLoading] = useState(true);
    const [generatingConnections, setGeneratingConnections] = useState(false);

    useEffect(() => {
        const loadConnections = async () => {
            setLoading(true);
            try {
                const data = await fetchEventConnections(eventId);
                setConnections(data);
                const introAttendees = data.filter(attendee => attendee.wants_intro);
                setAttendees(introAttendees);
                setSelectedAttendees(introAttendees.map(a => a.users.user_id));
            } catch (error) {
                console.error("Error fetching connections:", error);
            } finally {
                setLoading(false);
            }
        };

        loadConnections();
    }, [eventId]);

    const handleGenerateConnections = async () => {
        setGeneratingConnections(true);
        try {
            const result = await generateRandomConnections(eventId);
            if (result.success) {
                const data = await fetchEventConnections(eventId);
                setConnections(data);
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error generating connections:", error);
            alert("Failed to generate connections");
        } finally {
            setGeneratingConnections(false);
        }
    };

    const handleAttendeeSelection = (userId: string) => {
        setSelectedAttendees(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleAllAttendees = () => {
        if (selectedAttendees.length === attendees.length) {
            setSelectedAttendees([]);
        } else {
            setSelectedAttendees(attendees.map(a => a.users.user_id));
        }
    };


    const handleSendEmails = async () => {
    };

    const getStatusBadgeClass = (status: string) => {
        switch (status.toLowerCase()) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'connected':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };


    return (
        <div className="w-full h-full container mx-auto p-4">
            <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4 font-[family-name:var(--font-sourceSans3)]">Existing Connections</h2>
                {loading ? (
                    <div className="text-center py-10">Loading connections...</div>
                ) : connections.length > 0 ? (
                    <div className="overflow-x-auto shadow-xs sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 table-auto">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connection ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User 1 ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User 2 ID</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {connections.map(connection => (
                                <tr key={connection.connection_id}>
                                    <td className="px-4 py-2 whitespace-nowrap">{connection.connection_id}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded ${getStatusBadgeClass(connection.status)}`}>
                                                {connection.status}
                                            </span>
                                    </td>
                                    <td className="px-4 py-2 whitespace-nowrap">{connection.user1_id}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">{connection.user2_id}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 p-4 bg-gray-50 rounded-lg font-[family-name:var(--font-sourceSans3)]">
                        <p className="text-lg text-gray-600">No connections have been generated yet.</p>
                    </div>
                )}
            </div>

            <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold font-[family-name:var(--font-sourceSans3)]">Attendees Eligible for Connections</h2>
                    <div className="space-x-3 font-[family-name:var(--font-fragment-mono)]">
                        <button
                            onClick={handleGenerateConnections}
                            disabled={generatingConnections || selectedAttendees.length === 0}
                            className={`
                                ${selectedAttendees.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-sea-600 hover:bg-sea-500'
                            } 
                                text-white py-2 px-4 rounded
                            `}
                        >
                            {generatingConnections ? 'Generating...' : 'Generate Connections'}
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-10">Loading attendees...</div>
                ) : attendees.length > 0 ? (
                    <div className="overflow-x-auto shadow-xs sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 table-auto">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedAttendees.length === attendees.length}
                                        onChange={toggleAllAttendees}
                                        className="form-checkbox h-5 w-5 text-sea-600"
                                    />
                                </th>
                                {Object.keys(attendees[0].users)
                                    .filter(key => !['user_id', 'created_at', 'updated_at'].includes(key))
                                    .map(field => (
                                        <th
                                            key={field}
                                            className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            {field.replace(/_/g, ' ').charAt(0).toUpperCase() + field.replace(/_/g, ' ').slice(1)}
                                        </th>
                                    ))
                                }
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User ID
                                </th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {attendees.map(attendee => (
                                <tr key={attendee.users.user_id}>
                                    <td className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedAttendees.includes(attendee.users.user_id)}
                                            onChange={() => handleAttendeeSelection(attendee.users.user_id)}
                                            className="form-checkbox h-5 w-5 text-sea-600"
                                        />
                                    </td>
                                    {Object.keys(attendee.users)
                                        .filter(key => !['user_id', 'created_at', 'updated_at'].includes(key))
                                        .map(field => (
                                            <td
                                                key={field}
                                                className="px-4 py-2 whitespace-nowrap"
                                            >
                                                {attendee.users[field] || 'N/A'}
                                            </td>
                                        ))
                                    }
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {attendee.users.user_id}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="text-center py-10 p-4 bg-gray-50 rounded-lg font-[family-name:var(--font-sourceSans3)]">
                        <p className="text-lg text-gray-600">No attendees want introductions.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
