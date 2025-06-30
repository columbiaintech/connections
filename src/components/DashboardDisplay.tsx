"use client"
import {fetchUserGroupDetails} from "@/app/actions/updateData";
import {useEffect, useState} from "react";
import Link from "next/link";
import GroupInfo from "@/components/GroupInfo";

export default function DashboardDisplay({user}){
    const [loading, setLoading] = useState(true);
    const [groupData, setGroupData] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                const data = await fetchUserGroupDetails(user.id);
                setGroupData(data);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [user.id]);

    if (loading) return <p>Loading...</p>;

    if (!groupData?.group) {
        return (
            <div className="card-pink p-6">
                <p className="text-lg text-berry">You don’t have an organization yet.</p>
                <p className="text-sm text-steel">Once you make an organization, you can import data and create events.</p>
                <div className="mt-4">
                    <Link href="/dashboard/new" className="btn-primary">Create org</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <GroupInfo groupData={groupData} />
        </div>
    );
}
