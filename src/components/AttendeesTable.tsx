"use client";
import React, {useState} from "react";
import {createAttendee, deleteAttendee, updateAttendee} from "@/app/actions/updateData";
import {Tables} from "@/types/supabase";

type Member = Tables<'members'> & { [key: string]: any };
type EventAttendee = {
    members: Member;
    wants_intro: boolean;
};

type NewAttendee = {
    members: Record<string, string>;
    wants_intro: boolean;
};

export default function AttendeesTable({eventAttendees, eventId}: {eventAttendees: any[], eventId: string}){
    const userFields = eventAttendees.length>0 ? Object.keys(eventAttendees[0].members).filter(key=>!['user_id', 'created_at', 'updated_at', 'email'].includes(key)):[];
    const [attendees, setAttendees] = useState<EventAttendee[]>(eventAttendees);
    const [editing, setEditing] = useState<string | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    function createEmptyAttendee(): NewAttendee {
        const userObject: Record<string, string> = {
            email: '',
        };

        userFields.forEach((field) => {
            if (!(field in userObject)) {
                userObject[field] = '';
            }
        });
        return{
            members: userObject,
            wants_intro: false
        }
    }

    const [newAttendee, setNewAttendee] = useState<NewAttendee>(createEmptyAttendee());

    const handleEdit = (attendee: EventAttendee) => {
        if (isAddingNew) return;
        setEditing(attendee.members.user_id);
    };

    const handleSave = async (attendee: EventAttendee) => {
        try{
            const eventAttendeeData = {
                wants_intro: attendee.wants_intro
            }
            const updated = await updateAttendee(eventAttendeeData, attendee.members.user_id, attendee.members, eventId);
            if (updated?.event_attendees){
                setAttendees(updated.event_attendees);
            }
            setEditing(null);
        }
        catch(err){
            console.error('Error saving attendee:',err);
        }
    };

    const handleDelete = async (attendee: EventAttendee) => {
        try{
            const updated = await deleteAttendee(attendee.members.user_id, eventId)
            if (updated?.event_attendees){
                setAttendees(updated.event_attendees);
            }
        }
        catch(err){
            console.error('Error deleting attendee:',err);
        }
    };

    const handleCreate = async () => {
        if (!newAttendee.members.email) {
            alert("Email is required.");
            return;
        }

        try{
            const created = await createAttendee(eventId, { members: { ...newAttendee.members, email: newAttendee.members.email || '' } });
            if (created?.event_attendees){
                setAttendees(created.event_attendees);
            }
            setNewAttendee(createEmptyAttendee());
            setIsAddingNew(false);
        }
        catch(err){
            console.error('Error creating attendee:', err);
        }
    };

    const handleCheckboxChange = (userId: string, checked: boolean) => {
        setAttendees(current =>
            current.map(a =>
                a.members.user_id === userId ? {...a, wants_intro: checked} : a
            ));
    };

    return(
        <div className="w-full container mx-auto py-2 px-4 ">
            <h2 className="text-2xl font-semibold mt-4 mb-4">Attendees</h2>
            <div className="overflow-x-auto shadow-xs sm:rounded-lg box-border border-2 border-gray-100">
                <table className="w-full divide-y divide-gray-200 table-auto ">
                    <thead className="bg-gray-50">
                    <tr>
                        {userFields.map(field => (
                            <th key={field} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                {field.replace(/_/g, ' ').charAt(0).toUpperCase() + field.replace(/_/g, ' ').slice(1)}
                            </th>
                        ))}
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wants Intro</th>
                        <th className="sticky px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                    {isAddingNew && (
                        <tr>
                            {userFields.map(field => (
                                <td key={field} className="px-4 py-2 whitespace-nowrap">
                                    <input
                                        type="text"
                                        onChange={e => setNewAttendee(prev => ({ ...prev, members: { ...prev.members, [field]: e.target.value } }))}
                                        className="w-full p-1 border rounded"
                                    />
                                </td>
                            ))}
                            <td className="px-4 py-2 whitespace-nowrap">
                                <input
                                    type="checkbox"
                                    onChange={e => setNewAttendee(prev => ({ ...prev, wants_intro: e.target.checked }))}
                                />
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                                <button onClick={handleCreate} className="btn-primary">
                                    Create
                                </button>
                            </td>
                        </tr>
                    )}
                    {attendees.map(attendee => (
                        <tr key={attendee.members.user_id}>
                            {userFields.map(field => (
                                <td key={field} className="px-4 py-2 whitespace-nowrap">
                                    {editing === attendee.members.user_id ? (
                                        <input
                                            type="text"
                                            defaultValue={String(attendee.members[field as keyof Member] ?? 'N/A')}
                                            onChange={e => {
                                                const updatedAttendee = { ...attendee, members: { ...attendee.members, [field]: e.target.value } };
                                                setAttendees(current => current.map(a => a.members.user_id === attendee. members.user_id ? updatedAttendee : a));
                                            }}
                                            className="w-full p-1 border rounded"
                                        />
                                    ) : (
                                        String(attendee.members[field as keyof Member] ?? 'N/A')
                                    )}
                                </td>
                            ))}
                            <td className="px-4 py-2 whitespace-nowrap">
                                {editing === attendee.members.user_id ? (
                                    <input
                                        type="checkbox"
                                        defaultChecked={attendee.wants_intro}
                                        onChange={e => {
                                            handleCheckboxChange(attendee.members.user_id, e.target.checked);
                                        }}
                                    />
                                ) : (
                                    attendee.wants_intro ? 'Yes' : 'No'
                                )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                                {!isAddingNew && editing === attendee.members.user_id ? (
                                    <>
                                        <button onClick={() => handleSave(attendee)} className="btn-primary mr-2">
                                            Save
                                        </button>
                                        <button onClick={() => setEditing(null)} className="btn-secondary mr-2">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(attendee)} className=" sticky  btn-tertiary mr-2">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(attendee)} className="sticky btn-destructive mr-2">
                                            Delete
                                        </button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-4">
            {!isAddingNew ? (
                <button onClick={() => setIsAddingNew(true)} className="btn-primary">
                    Add New Attendee
                </button>
            ) : (
                <button onClick={() => setIsAddingNew(false)} className="btn-outline">
                    Cancel Add
                </button>
            )}
            </div>
        </div>
    );
};