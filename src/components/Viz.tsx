"use client";
import React, { useRef } from 'react';
import { Tables, TablesInsert, TablesUpdate, Enums } from '@/types/supabase';

type Member = Tables<'members'>;
type Event = Tables<'events'>;
type EventAttendee = Tables<'event_attendees'>;
type EnrichedConnection = Tables<'enriched_connections'>;

interface GroupData {
    members: Member[];
    events: Event[];
    attendees: EventAttendee[];
    enriched_connections: EnrichedConnection[];
}

interface VizProps {
    groupData: GroupData;
}

const Viz = ({ groupData }: VizProps) => {
    const { members, events, attendees, enriched_connections=[] } = groupData;

    const svgRef = useRef<SVGSVGElement | null>(null);

    if (!events?.length) {
        return (
            <div className="card-pink p-6 rounded-lg text-center space-y-3">
                <p className="text-lg text-berry">No events data available for network visualization.</p>
                <p className="text-sm text-steel">Create events and add attendees to see the network connections.</p>
            </div>
        );
    }

    const width = 800;
    const height = 600;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = 200;

    const positions = new Map<string, { x: number; y: number }>();
    const validMembers = members.filter((m) => m.user_id);

    validMembers.forEach((member, i) => {
        const angle = (i * 2 * Math.PI) / validMembers.length;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        positions.set(member.user_id, { x, y });
    });

    const renderedConnections = enriched_connections
        .map((conn: EnrichedConnection) => {
            const from = positions.get(conn.user1_id ?? '');
            const to = positions.get(conn.user2_id ?? '');
            return from && to
                ? { from, to, status: conn.status, users: [conn.user1_id, conn.user2_id] }
                : null;
        })
        .filter((conn): conn is NonNullable<typeof conn> => conn !== null);

    const getUserById = (id: string):Member|undefined => members.find((m) => m.user_id === id);

    return (
        <div className="space-y-6">
            <section>
                <h3 className="text-xl font-semibold mb-4">Network Visualization</h3>

                <div className="mb-4 flex gap-6 text-sm text-steel">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-1 bg-rose-600"></div>
                        <span>Connections</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-loch rounded-full"></div>
                        <span>Member</span>
                    </div>
                </div>

                <div className="card-white border rounded-lg overflow-hidden">
                    <svg ref={svgRef} width="800" height="600" className="w-full bg-gray-50">
                        {renderedConnections.map((conn, i) => (
                            <line
                                key={i}
                                x1={conn.from.x}
                                y1={conn.from.y}
                                x2={conn.to.x}
                                y2={conn.to.y}
                                stroke="#e11d48"
                                strokeWidth="2"
                                opacity={0.6}
                            />
                        ))}

                        {validMembers.map((member) => {
                            const pos = positions.get(member.user_id);
                            if (!pos) return null;


                            return (
                                <g key={member.user_id}>
                                    <circle
                                        cx={pos.x}
                                        cy={pos.y}
                                        r="18"
                                        fill="#164e63"
                                        stroke="#0e7490"
                                        strokeWidth="2"
                                        className="cursor-pointer hover:fill-cyan-700 transition-colors"
                                        onMouseEnter={() => {
                                            const tooltip = document.getElementById(`tooltip-${member.user_id}`);
                                            if (tooltip) tooltip.style.display = 'block';
                                        }}
                                        onMouseLeave={() => {
                                            const tooltip = document.getElementById(`tooltip-${member.user_id}`);
                                            if (tooltip) tooltip.style.display = 'none';
                                        }}
                                    />
                                    <text
                                        x={pos.x}
                                        y={pos.y + 4}
                                        textAnchor="middle"
                                        className="text-xs font-medium fill-white pointer-events-none"
                                    >
                                        {member.email?.[0]?.toUpperCase() || 'U'}
                                    </text>

                                    <foreignObject
                                        x={pos.x + 25}
                                        y={pos.y - 30}
                                        width="200"
                                        height="60"
                                        id={`tooltip-${member.user_id}`}
                                        style={{ display: 'none' }}
                                        className="pointer-events-none"
                                    >
                                        <div className="bg-gray-800 text-white text-xs p-2 rounded shadow-lg">
                                            <div className="font-semibold">{member.email}</div>
                                            <div className="text-gray-300">Role: { 'member'}</div>
                                        </div>
                                    </foreignObject>
                                </g>
                            );
                        })}
                    </svg>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="card-teal p-4 rounded-lg">
                        <h4 className="font-semibold text-lg">Total Events</h4>
                        <p className="text-2xl font-bold text-loch">{events.length}</p>
                    </div>
                    <div className="card-teal p-4 rounded-lg">
                        <h4 className="font-semibold text-lg">Active Members</h4>
                        <p className="text-2xl font-bold text-loch">{validMembers.length}</p>
                    </div>
                    <div className="card-teal p-4 rounded-lg">
                        <h4 className="font-semibold text-lg">Total Connections</h4>
                        <p className="text-2xl font-bold text-loch">{renderedConnections.length}</p>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Viz;