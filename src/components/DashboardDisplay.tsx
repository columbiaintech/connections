"use client"
import {fetchAllUserGroups, fetchUserGroupDetails} from "@/app/actions/updateData";
import {useEffect, useState} from "react";
import Link from "next/link";
import GroupInfo from "@/components/GroupInfo";

export default function DashboardDisplay({user}){
    const [loading, setLoading] = useState(true);
    const [groupData, setGroupData] = useState(null);
    const [groupList, setGroupList] = useState<any[]>([]);
    const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);

    useEffect(() => {
        async function loadGroups() {
            try {
                const data = await fetchAllUserGroups(user.id);
                setGroupList(data);
                if (data.length>0){
                    setSelectedGroupId(data[0].group_id)
                }
            } finally {
                setLoading(false);
            }
        }
        loadGroups();
    }, [user.id]);

    useEffect(() => {
        async function loadGroupData() {
            if (!selectedGroupId) return;
            setLoading(true);
            try {
                const data = await fetchUserGroupDetails(selectedGroupId);
                setGroupData(data);
            } finally {
                setLoading(false);
            }
        }
        loadGroupData();
    }, [selectedGroupId]);

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

        <div className=" card-white">

            <nav className="flex -mb-px gap-6 font-[family-name:var(--font-fragment-mono)]">
                {groupList.map((group) => (
                    <button
                        key={group.group_id}
                        onClick={() => setSelectedGroupId(group.group_id)}
                        className={`text-sm text-base border-b-2 ${
                            selectedGroupId === group.group_id
                                ? 'border-rose-600 text-gray-700'
                                : 'border-transparent text-gray-500 hover:text-gray-400'
                        }`}
                    >
                        {group.group_name}
                    </button>
                ))}
                <Link
                    href="/dashboard/new"
                    className="text-xl text-base border-b-2 border-transparent text-gray-500 hover:text-gray-400 ml-4">+</Link>
            </nav>
            <div className="space-y-6 py-4">
                <GroupInfo groupData={groupData} />
            </div>
        </div>
    );
}
