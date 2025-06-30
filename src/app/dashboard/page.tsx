"use server"
import { redirect } from 'next/navigation'

import { createClient } from '../../../utils/supabase/server'
import {logout} from "@/app/actions/auth";
import React from "react";
import EventForm from "@/components/EventForm";
import EventDisplay from "@/components/EventDisplay";
import TabNavigator from "@/components/TabNavigator";
import AttendeesTable from "@/components/AttendeesTable";
import ConnectionsTable from "@/components/ConnectionsTable";
import GroupInfo from "@/components/GroupInfo";
import NewGroupForm from "@/components/NewGroupForm";
import Navbar from "@/components/Navbar";
import { userHasGroups, fetchUserGroupDetails } from "@/app/actions/updateData";
import Link from "next/link";

export default async function Dashboard() {
    const supabase = await createClient()

    const { data:userData, error } = await supabase.auth.getUser()
    if (error || !userData?.user) {
        redirect('/signin')
    }

    const user = userData.user;
    const hasGroup = await userHasGroups(user.id);
    const group = hasGroup ? await fetchUserGroupDetails(user.id) : null;

    return(
        <div className="items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
            <main className="w-full flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <div className="w-full  list-inside p-2 text-sm text-center sm:text-left sm:rounded-lg">
                    <p>Hello {userData.user.email}</p>
                    {hasGroup && group ? (
                        <div className="space-y-4">
                            <h2 className="text-xl font-bold">Your Organization</h2>
                            <GroupInfo userId={user.id} org={group}/>
                        </div>
                    ) : (
                        <div className="space-y-4 p-4">
                            <h2 className="text-xl font-bold">Create an Organization</h2>
                            <div className="text-center py-10 p-4 bg-teal-100/25  border border-loch/25 rounded-lg font-[family-name:var(--font-sourceSans3)]">
                                <p className="text-lg text-loch">You don’t have an organization yet.</p>
                                <p className="text-sm text-steel">Once you make an organization, you can import data and create events.</p>
                                <Link href="/dashboard/new" className="btn-primary">Create org</Link>
                                <Link href="/dashboard/new" className="btn-outline">Create org</Link>
                                <Link href="/dashboard/new" className="btn-secondary">Create org</Link>
                                <Link href="/dashboard/new" className="btn-tertiary">Create org</Link>

                                <Link href="/dashboard/new" className="btn-destructive">Create org</Link>

                            </div>
                            <div className="text-center py-10 p-4 bg-rose-100/25  border border-berry/25 rounded-lg font-[family-name:var(--font-sourceSans3)]">
                                <p className="text-lg text-berry">You don’t have an organization yet.</p>
                                <p className="text-sm text-steel">Once you make an organization, you can import data and create events.</p>

                            </div>
                            <div className="text-center py-10 p-4 bg-teal-100/25  border border-steel/25 rounded-lg font-[family-name:var(--font-sourceSans3)]">
                                <p className="text-lg text-steel">You don’t have an organization yet.</p>
                                <p className="text-sm text-steel">Once you make an organization, you can import data and create events.</p>

                            </div>


                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">

                            <button
                                type="submit"
                                className="text-white px-3 py-1 rounded border border-sea-600 bg-gradient-to-r from-sea-600 to-sea hover:opacity-80"
                            >
                            <Link href="/dashboard/new" className="text-s text-white font-[family-name:var(--font-sourceSans3)]">Create a new group</Link>
                            </button>

                            <button
                                type="submit"
                                className="px-3 py-1 rounded border border-berry/25 bg-rose-200 hover:opacity-80"
                            >
                                <Link href="/dashboard/new" className="text-s text-midnight font-[family-name:var(--font-sourceSans3)]">Create a new group</Link>
                            </button>

                                <button
                                    type="submit"
                                    className="px-3 py-1 rounded border border-loch/25 bg-teal-200 hover:opacity-80"
                                >
                                    <Link href="/dashboard/new" className="text-s text-midnight font-[family-name:var(--font-sourceSans3)]">Create a new group</Link>
                                </button>

                                <button
                                    type="submit"
                                    className="px-3 py-1 rounded border border-steel/25 bg-teal-200 hover:opacity-80"
                                >
                                    <Link href="/dashboard/new" className="text-s text-midnight font-[family-name:var(--font-sourceSans3)]">Create a new group</Link>
                                </button>

                            </div>


                        </div>


                    )}
                </div>
            </main>
        </div>
    );
}
