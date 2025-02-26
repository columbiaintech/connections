"use client";
import {parse} from 'papaparse';
import React, {useState, useEffect} from "react";
import {createAttendee, deleteAttendee, updateAttendee} from "@/app/actions/updateData";


// TODO: displays attendees in table format on the event page, allows user to modify db if needed (delete, update, create)

interface AttendeesTableProps{
    eventAttendees: string[];
    eventId: string;
}

export default function AttendeesTable({eventAttendees, eventId}: AttendeesTableProps){
    const userFields = eventAttendees.length>0 ? Object.keys(eventAttendees[0].users).filter(key=>!['user_id', 'created_at', 'updated_at'].includes(key)):[];
    const [attendees, setAttendees] = useState(eventAttendees);
    const [editing, setEditing] = useState(null);
    const [isAddingNew, setIsAddingNew] = useState(false);

    const createEmptyAttendee = () => {
        const userObject = userFields.reduce((acc, field)=>{
            acc[field] = '';
            return acc;
        },{});
        return{
            users: userObject,
            wants_intro: false
        }
    };

    const [newAttendee, setNewAttendee] = useState(createEmptyAttendee());

    const handleEdit = (attendee) => {
        if (isAddingNew) return;
        setEditing(attendee.users.user_id);
    };

    const handleSave = async (attendee) => {
        try{
            const eventAttendeeData = {
                wants_intro: attendee.wants_intro
            }
            const updated = await updateAttendee(eventAttendeeData, attendee.users.user_id, attendee.users, eventId);
            if (updated?.event_attendees){
                setAttendees(updated.event_attendees);
            }
            setEditing(null);
        }
        catch(err){
            console.error('Error saving attendee:',err);
        }
    };

    const handleDelete = async (attendee) => {
        try{
            const updated = await deleteAttendee(attendee.users.user_id, eventId)
            if (updated?.event_attendees){
                setAttendees(updated.event_attendees);
            }
        }
        catch(err){
            console.error('Error deleting attendee:',err);
        }
    };

    const handleCreate = async () => {
        try{
            const created = await createAttendee(eventId, newAttendee);
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
                a.users.user_id === userId ? {...a, wants_intro: checked} : a
            ));
    };

    return(
        <div className="container mx-auto py-2 px-4 ">
            <h2 className="text-2xl font-semibold mt-4 mb-4 font-[family-name:var(--font-sourceSans3)]">Attendees</h2>
            <div className="overflow-x-auto shadow-xs sm:rounded-lg box-border border-2 border-gray-100 font-[family-name:var(--font-fragment-mono)]">
                <table className="min-w-full divide-y divide-gray-200 table-auto ">
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
                                        onChange={e => setNewAttendee(prev => ({ ...prev, users: { ...prev.users, [field]: e.target.value } }))}
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
                                <button onClick={handleCreate} className="bg-sea-600 hover:bg-sea-500 text-white font-bold py-2 px-4 rounded">
                                    Create
                                </button>
                            </td>
                        </tr>
                    )}
                    {attendees.map(attendee => (
                        <tr key={attendee.users.user_id}>
                            {userFields.map(field => (
                                <td key={field} className="px-4 py-2 whitespace-nowrap">
                                    {editing === attendee.users.user_id ? (
                                        <input
                                            type="text"
                                            defaultValue={attendee.users[field] || ''}
                                            onChange={e => {
                                                const updatedAttendee = { ...attendee, users: { ...attendee.users, [field]: e.target.value } };
                                                setAttendees(current => current.map(a => a.users.user_id === attendee.users.user_id ? updatedAttendee : a));
                                            }}
                                            className="w-full p-1 border rounded"
                                        />
                                    ) : (
                                        attendee.users[field] || 'N/A'
                                    )}
                                </td>
                            ))}
                            <td className="px-4 py-2 whitespace-nowrap">
                                {editing === attendee.users.user_id ? (
                                    <input
                                        type="checkbox"
                                        defaultChecked={attendee.wants_intro}
                                        onChange={e => {
                                            handleCheckboxChange(attendee.users.user_id, e.target.checked);
                                        }}
                                    />
                                ) : (
                                    attendee.wants_intro ? 'Yes' : 'No'
                                )}
                            </td>
                            <td className="px-4 py-2 whitespace-nowrap">
                                {!isAddingNew && editing === attendee.users.user_id ? (
                                    <>
                                        <button onClick={() => handleSave(attendee)} className="bg-sea-600 hover:bg-sea-500 text-white font-bold py-2 px-4 rounded mr-2">
                                            Save
                                        </button>
                                        <button onClick={() => setEditing(null)} className="bg-sea-300 hover:bg-sea-400 text-gray-800  py-2 px-4 rounded">
                                            Cancel
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => handleEdit(attendee)} className=" sticky bg-rose-100 hover:bg-rose-200 text-black  py-2 px-4 rounded mr-2">
                                            Edit
                                        </button>
                                        <button onClick={() => handleDelete(attendee)} className="sticky bg-rose-600 hover:bg-rose text-white font-bold py-2 px-4 rounded">
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

            <div className="font-[family-name:var(--font-fragment-mono)]">
            {!isAddingNew ? (
                <button onClick={() => setIsAddingNew(true)} className="bg-sea-600 hover:bg-sea-500 text-white py-2 px-4 rounded mt-4">
                    Add New Attendee
                </button>
            ) : (
                <button onClick={() => setIsAddingNew(false)} className="bg-rose-400 hover:bg-rose-500 text-gray-800 py-2 px-4 rounded mt-4">
                    Cancel Add
                </button>
            )}
            </div>
        </div>
    );
};