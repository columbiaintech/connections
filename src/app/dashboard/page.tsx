"use server"
import { redirect } from 'next/navigation'
import { createClient } from '../../../utils/supabase/server'
import React from "react";
import GroupInfo from "@/components/GroupInfo";
import { userHasGroups, fetchUserGroupDetails } from "@/app/actions/updateData";
import Link from "next/link";
import DashboardDisplay from "@/components/DashboardDisplay";

export default async function Dashboard() {
    const supabase = await createClient()

    const { data:userData, error } = await supabase.auth.getUser()
    if (error || !userData?.user) {
        redirect('/signin')
    }

    const user = userData.user;
    const hasGroup = await userHasGroups(user.id);
    const group = hasGroup ? await fetchUserGroupDetails(user.id) : null;

    return (
        <div className="p-8">
            <DashboardDisplay user={userData.user} />
        </div>
    );
}
