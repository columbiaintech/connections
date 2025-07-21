'use server'
import {fetchConnectionThread} from "@/app/actions/updateData";

export default async function ThreadView({ connectionId }: { connectionId: string }) {
    const thread = await fetchConnectionThread(connectionId);

    if (!thread.length) return (
        <div className="card-pink p-6">
            <p className="text-lg text-steel">No emails found for this connection.</p>
        </div>
    );

    return(
        <div>
        {thread.map((msg)=>(
            <div key={msg.created_at}>
                <p>{msg.sender_email}</p>
                <div dangerouslySetInnerHTML={{__html: msg.body ?? ''}} className="text-steel" />
            </div>
                ))}
        </div>
    );
}