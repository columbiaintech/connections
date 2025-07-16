"use client";
import React, { useState, useEffect } from 'react';
import {fetchConnectionThread, fetchEventAttendees, fetchEventConnections, generateRandomConnections} from "@/app/actions/updateData";
import EmailThreadButton from "@/components/EmailThreadButton";
import ThreadView from "@/components/ThreadView";

interface ConnectionsTableProps {
    eventId: string;
}

export default function ConnectionsTable({ eventId }: ConnectionsTableProps) {
    const [connections, setConnections] = useState([]);
    const [attendees, setAttendees] = useState([]);
    const [selectedAttendees, setSelectedAttendees] = useState([]);
    const [expandedThreads, setExpandedThreads] = useState<{ [key: string]: any }>({});
    const [loading, setLoading] = useState(true);
    const [generatingConnections, setGeneratingConnections] = useState(false);

    useEffect(() => {
        const loadConnections = async () => {
            setLoading(true);
            try {
                const attendeesData = await fetchEventAttendees(eventId);
                const introAttendees = attendeesData.filter(attendee => attendee.wants_intro);
                setAttendees(introAttendees);
                setSelectedAttendees(introAttendees.map(a => a.members.user_id));
                const connectionsData = await fetchEventConnections(eventId);
                setConnections(connectionsData);
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
            setSelectedAttendees(attendees.map(a => a.members.user_id));
        }
    };
    
    const getStatusBadgeClass = (status: string) => {
        switch (status) {
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

    const toggleThread = async (connectionId) => {
        setExpandedThreads((prev) => {
            const isOpen = prev[connectionId]?.open
            return {
                ...prev,
                [connectionId]: {
                    open: !isOpen,
                    messages: isOpen ? prev[connectionId]?.messages : null,
                    loading: !isOpen && !prev[connectionId]?.messages,
                },
            }
        })

        if (!expandedThreads[connectionId]?.messages && !expandedThreads[connectionId]?.open) {
            const messages = await fetchConnectionThread(connectionId)
            setExpandedThreads((prev) => ({
                ...prev,
                [connectionId]: { open: true, messages, loading: false },
            }))
        }
    }

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
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thread</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {connections.map(connection => (
                                <React.Fragment key={connection.connection_id}>
                                    <tr>
                                    <td className="px-4 py-2 whitespace-nowrap">{connection.connection_id}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded ${getStatusBadgeClass(connection.status)}`}>
                                                {connection.status}
                                            </span>
                                    </td>
                                    <td className="px-4 py-2">{connection.user1_name}</td>
                                    <td className="px-4 py-2">{connection.user2_name}</td>
                                    <td className="px-4 py-2">{connection.latest_subject || 'No email sent'}</td>
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        <div className="px-4 py-2 whitespace-nowrap">
                                        {/*<button onClick={()=>toggleThread(connection.connection_id)} className="text-sm text-blue-600 underline">*/}
                                        {/*    {expandedThreads[connection.connection_id]?.open ? 'Hide' : 'Show'} Thread*/}
                                        {/*</button>*/}
                                        </div>
                                        {connection.latest_subject ? null : (
                                            <EmailThreadButton connectionId={connection.connection_id} />
                                        )}
                                    </td>
                                </tr>
                            {expandedThreads[connection.connection_id]?.open && (
                                <tr className="bg-gray-50">
                                <td colSpan={7} className="px-6 py-4">
                                <ThreadView connectionId={connection.connection_id} />
                                </td>
                                </tr>
                                )}
                                </React.Fragment>
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
                    <div className="space-x-3">
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
                                {Object.keys(attendees[0].members)
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
                                <tr key={attendee.members.user_id}>
                                    <td className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedAttendees.includes(attendee.members.user_id)}
                                            onChange={() => handleAttendeeSelection(attendee.members.user_id)}
                                            className="form-checkbox h-5 w-5 text-sea-600"
                                        />
                                    </td>
                                    {Object.keys(attendee.members)
                                        .filter(key => !['user_id', 'created_at', 'updated_at'].includes(key))
                                        .map(field => (
                                            <td
                                                key={field}
                                                className="px-4 py-2 whitespace-nowrap"
                                            >
                                                {attendee.members[field] || 'N/A'}
                                            </td>
                                        ))
                                    }
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {attendee.members.user_id}
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
