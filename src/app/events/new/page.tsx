"use server";
import EventForm from "@/components/EventForm";
import {fetchAllUserGroups, fetchColumns} from "@/app/actions/updateData";
import {createClient} from "@utils/supabase/server";
import {redirect} from "next/navigation";

export default async function NewEvent({ searchParams }: { searchParams: { group?: string } }) {
    const supabase = await createClient()

    const { data:userData, error } = await supabase.auth.getUser()
    if (error || !userData?.user) {
        redirect('/signin')
    }

    const user = userData.user;

    const groupId = searchParams.group || null;
    const [dbColumns, groupList] = await Promise.all([
        fetchColumns(),
        fetchAllUserGroups(user.id)
    ]);

    const validGroup = groupList.find((g) => g.group_id === groupId);

    return (
        <div className="items-center justify-items-center p-8 pb-20 gap-16 sm:p-20">
            <main className="w-full flex flex-col gap-8 row-start-2 items-center sm:items-start">
                <div className="w-full list-inside text-sm text-center sm:text-left">
                    <EventForm dbColumns={dbColumns} groupId={validGroup?.group_id||null} groupList={groupList}/>
                </div>
            </main>
        </div>
    );
}

