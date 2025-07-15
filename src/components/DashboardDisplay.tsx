"use server"
import { createClient } from '../../utils/supabase/server'
import {fetchAllUserGroups, fetchUserGroupDetails} from "@/app/actions/updateData";
import Link from "next/link";
import GroupInfo from "@/components/GroupInfo";
import {redirect} from "next/navigation";

export default async function DashboardDisplay({searchParams}){
    const supabase = await createClient()

    const { data:userData, error } = await supabase.auth.getUser()
    if (error || !userData?.user) {
        redirect('/signin')
    }

    const user = userData.user;
    const groupList = await fetchAllUserGroups(user.id);



    if (groupList.length===0) {
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

    const selectedGroupId = searchParams.group || groupList[0].group_id;
    const hasAccessToGroup = groupList.some(group => group.group_id === selectedGroupId);
    const finalGroupId = hasAccessToGroup ? selectedGroupId : groupList[0].group_id;
    if (!hasAccessToGroup && searchParams.group) {
        redirect(`/dashboard?group=${groupList[0].group_id}`);
    }
    const groupData = await fetchUserGroupDetails(finalGroupId);

    return (

        <div className=" card-white">

            <nav className="flex -mb-px gap-6 font-[family-name:var(--font-fragment-mono)]">
                {groupList.map((group) => (
                    <Link
                        key={group.group_id}
                        href={`/dashboard?group=${group.group_id}`}
                        className={`text-sm text-base border-b-2 ${
                            finalGroupId === group.group_id
                                ? 'border-rose-600 text-gray-700'
                                : 'border-transparent text-gray-500 hover:text-gray-400'
                        }`}
                    >
                        {group.group_name}
                    </Link>
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
