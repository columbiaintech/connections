"use client";
import React, { useState, useEffect } from 'react';
import {
    fetchConnectionThread,
    fetchEligibleAttendees,
    fetchEventConnections,
    generateRandomConnections,
    updateConnectionStatus
} from "@/app/actions/updateData";
import EmailThreadButton from "@/components/EmailThreadButton";
import ThreadView from "@/components/ThreadView";
import type {Enums, Tables} from "@/types/supabase";

type EventAttendee = Tables<'event_attendees'>;
type Connection = Tables<'connections'>;
type EnrichedConnection = Tables<'enriched_connections'>;
type ConnectionThread = Tables<'connection_threads'>;
type ConnectionStatus = Enums<'connection_status'>;

interface ConnectionsTableProps {
    eventId: string;
}

export default function ConnectionsTable({ eventId }: ConnectionsTableProps) {
    const [connections, setConnections] = useState<EnrichedConnection[]>([]);
    const [attendees, setAttendees] = useState<EventAttendee[]>([]);
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
    const [expandedThreads, setExpandedThreads] = useState<{ [key: string]: any }>({});
    const [loading, setLoading] = useState(true);
    const [generatingConnections, setGeneratingConnections] = useState(false);
    const [editing, setEditing] = useState<{ [key: string]: boolean }>({});
    const [selectedConnections, setSelectedConnections] = useState<string[]>([]);

    useEffect(() => {
        const loadConnections = async () => {
            setLoading(true);
            try {
                const attendeesData = await fetchEligibleAttendees(eventId) as EventAttendee[];
                const introAttendees = attendeesData.filter(attendee => attendee.wants_intro);
                setAttendees(introAttendees);
                setSelectedAttendees(introAttendees.map(a => a.user_id));
                const connectionsData = await fetchEventConnections(eventId) as EnrichedConnection[];
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
                const data = await fetchEventConnections(eventId) as EnrichedConnection[];
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

    const handleConnectionSelection = (connectionId: string) => {
        setSelectedConnections(prev =>
            prev.includes(connectionId)
                ? prev.filter(id => id !== connectionId)
                : [...prev, connectionId]
        );
    };

    const toggleAllAttendees = () => {
        if (selectedAttendees.length === attendees.length) {
            setSelectedAttendees([]);
        } else {
        }
    };

    const toggleAllConnections = () => {
        const emailNotSentConnections = connections.filter(c => c.status === 'email_not_sent');
        if (selectedConnections.length === emailNotSentConnections.length) {
            setSelectedConnections([]);
        } else {
            setSelectedConnections(emailNotSentConnections.map(c => c.connection_id).filter((id): id is string => id !== null));
        }
    };

    const getStatusBadgeClass = (status: string | null): string => {
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

    const handleStatusChange = async (connectionId: string, newStatus: string) => {
        try {
            const result = await updateConnectionStatus(connectionId, newStatus as ConnectionStatus);
            if (result.success) {
                const data = await fetchEventConnections(eventId) as EnrichedConnection[];
                setConnections(data);
                setEditing(prev => ({ ...prev, [connectionId]: false }));
            } else {
                alert(result.message);
            }
        } catch (error) {
            console.error("Error updating connection status:", error);
            alert("Failed to update connection status");
        }
    };

    const toggleThread = async (connectionId: string) => {
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
    const renderFieldValue = (value: any) => {
        if (value === null || value === undefined) return "N/A";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
    };

    const emailNotSentConnections = connections.filter(c => c.status === 'email_not_sent');

    return (
        <div className="w-full h-full container mx-auto p-4">
            <div className="mb-8">
                <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold mb-4 font-[family-name:var(--font-sourceSans3)]">Existing Connections</h2>
                <div className="space-x-3">
                    {emailNotSentConnections.length > 0 && (
                        <EmailThreadButton connectionIds={selectedConnections}/>
                    )}
                </div>
                </div>
                {loading ? (
                    <div className="text-center py-10">Loading connections...</div>
                ) : connections.length > 0 ? (
                    <div className="overflow-x-auto shadow-xs sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 table-auto">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedConnections.length === emailNotSentConnections.length && emailNotSentConnections.length > 0}
                                        onChange={toggleAllConnections}
                                        disabled={emailNotSentConnections.length === 0}
                                        className="form-checkbox h-5 w-5 text-blue-600"
                                    />
                                </th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Connection ID</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User 1</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User 2</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thread</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {connections.map(connection => (
                                <React.Fragment key={connection.connection_id}>
                                    <tr>
                                        <td className="px-4 py-2">
                                            <input
                                                type="checkbox"
                                                checked={connection.connection_id !== null && selectedConnections.includes(connection.connection_id)}
                                                onChange={() => connection.connection_id && handleConnectionSelection(connection.connection_id)}
                                                disabled={connection.status !== 'email_not_sent'}
                                                className="form-checkbox h-5 w-5 text-blue-600"
                                            />
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">{connection.connection_id}</td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {typeof connection.connection_id === 'string' && editing[connection.connection_id] ? (
                                                <select
                                                    value={connection.status ?? 'email_not_sent'}
                                                    onChange={(e) => connection.connection_id && handleStatusChange(connection.connection_id, e.target.value)}
                                                    onBlur={() => setEditing(prev => ({ ...prev, [connection.connection_id!]: false }))}
                                                    className="px-2 py-1 border rounded"
                                                    autoFocus
                                                >
                                                    <option value="email_not_sent">Email Not Sent</option>
                                                    <option value="pending">Pending</option>
                                                    <option value="accepted">Accepted</option>
                                                    <option value="declined">Declined</option>
                                                </select>
                                            ) : (
                                                <span
                                                    className={`px-2 py-1 rounded cursor-pointer ${getStatusBadgeClass(connection.status)}`}
                                                    onClick={() => setEditing(prev => ({ ...prev, [connection.connection_id!]: true }))}
                                                >
                                                    {connection.status ?? "email_not_sent"}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {connection.user1_name}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {connection.user2_name}
                                        </td>
                                        <td className="px-4 py-2 whitespace-nowrap">
                                            {connection.latest_subject ?? "No email sent"}
                                        </td>
                                    </tr>
                                    {typeof connection.connection_id === 'string' && expandedThreads[connection.connection_id]?.open && (
                                        <tr className="bg-gray-50">
                                            <td colSpan={6} className="px-6 py-4">
                                                {connection.connection_id && <ThreadView connectionId={connection.connection_id} />}
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
                            className={`btn-primary
                                ${selectedAttendees.length === 0
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-sea-600 hover:bg-sea-500'
                            } 
                                text-white py-1 px-3 rounded
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
                                {attendees.length > 0 && Object.keys(attendees[0])
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
                                <tr key={attendee.user_id}>
                                    <td className="px-4 py-2">
                                        <input
                                            type="checkbox"
                                            checked={selectedAttendees.includes(attendee.user_id)}
                                            onChange={() => handleAttendeeSelection(attendee.user_id)}
                                            className="form-checkbox h-5 w-5 text-sea-600"
                                        />
                                    </td>
                                    {Object.keys(attendee)
                                        .filter(key => !['user_id', 'created_at', 'updated_at'].includes(key))
                                        .map(field => (
                                            const value = attendee[field as keyof typeof attendee];
                                        return (
                                        <td
                                                key={field}
                                                className="px-4 py-2 whitespace-nowrap"
                                            >
                                                {renderFieldValue(value)}
                                            </td>
                                        );
                                        ))
                                    }
                                    <td className="px-4 py-2 whitespace-nowrap">
                                        {attendee.user_id}
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