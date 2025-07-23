"use client";
import React from "react";
import {useState, FormEvent} from "react";
import {createGroupWithInvites} from "@/app/actions/updateData";
import {useRouter} from "next/navigation";
import Link from "next/link";
import {GroupInvite, GroupRole, InviteField} from "@/types/types";
// TODO: get event details as textinput: event name, location, date, time

export default function NewGroupForm() {
    const [groupName, setGroupName] = useState('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    const [invites, setInvites] = useState<GroupInvite[]>([]);

    const handleInviteChange = (index: number, field: InviteField, value: string) => {
        const updated = [...invites];
        if (field === 'role' && ['member', 'admin', 'owner'].includes(value)) {
            updated[index].role = value as GroupRole;
        } else if (field === 'email') {
            updated[index].email = value;
        }
        setInvites(updated);
    };

    const addInvite = () => setInvites([...invites, { email: '', role: 'member' }]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            if (!groupName.trim()) throw new Error("Group name is required");
            const trimmedGroupName = groupName.trim();
            const validInvites = invites.filter(invite => invite.email.trim());

            const result = await createGroupWithInvites(trimmedGroupName, validInvites);
            if (result?.groupId) {
                router.push('/dashboard');
            } else {
                throw new Error("Failed to create group.");
            }
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unknown error occurred.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="card-white max-w-xl mx-auto">

            <form onSubmit={handleSubmit} className="p-6">
                <div className=" flex items-center m-2">
                    <div><h3 className="text-lg mb-2">Create a new group</h3></div>
                </div>

                <input
                    type="text"
                    value={groupName}
                    onChange={(e) => setGroupName(e.target.value)}
                    placeholder="Organization Name"
                    className="w-full mb-4 p-2 flex-1 border border-steel-100/50 rounded focus-visible:outline-4 focus-visible:outline-offset-1 focus-visible:outline-steel-100/50 focus-visible:ring-2"
                />

                <h3 className="text-lg mb-2">Invite Members</h3>

                {invites.map((invite, idx) => (
                    <div key={idx} className="flex items-center gap-2 mb-2">
                        <input
                            type="email"
                            placeholder="Email"
                            value={invite.email}
                            onChange={(e) => handleInviteChange(idx, 'email', e.target.value)}
                            className="p-2 border rounded flex-1 border border-steel-100/50 rounded focus-visible:outline-4 focus-visible:outline-offset-1 focus-visible:outline-steel-100/50 focus-visible:ring-2"
                        />
                        <select
                            value={invite.role}
                            onChange={(e) => handleInviteChange(idx, 'role', e.target.value)}
                            className="p-2 border rounded gap-2 leading-4 flex-1 border border-steel-100/50 rounded focus-visible:outline-4 focus-visible:outline-offset-1 focus-visible:outline-steel-100/50 focus-visible:ring-2"
                        >
                            <option value="member">Member</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                ))}
                <button
                    type="button"
                    onClick={addInvite}
                    className="text-steel underline mb-4"
                >
                    + Add invite
                </button>

                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="btn-outline text-s text-steel">
                        Cancel
                    </Link>

                    <button
                    type="submit"
                    className="btn-primary"
                    disabled={isLoading}
                    >
                    {isLoading ? "Creating..." : "Create Group"}
                </button>
                </div>

                {error && <p className="text-red-500 mt-2">{error}</p>}
            </form>
        </div>
    );
}
