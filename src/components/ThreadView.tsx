'use client'
import {fetchConnectionThread} from "@/app/actions/updateData";
import { Tables, TablesInsert, TablesUpdate, Enums } from '@/types/supabase';
import {useEffect, useState} from "react";


export default function ThreadView({ connectionId }: { connectionId: string }) {
    type ConnectionThread = Tables<'connection_threads'>;
    const [thread, setThread] = useState<ConnectionThread[]>([]);
    const [reply, setReply] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchConnectionThread(connectionId).then(setThread).finally(() => setLoading(false));
    }, [connectionId]);

    const sendReply = async () => {
        await fetch('/api/resend-inbound', {
            method: 'POST',
            body: JSON.stringify({ connectionId, reply }),
            headers: { 'Content-Type': 'application/json' }
        });
        setReply('');
        const updated = await fetchConnectionThread(connectionId);
        setThread(updated);
    };


    if (!thread.length) return (
        <div className="card-pink p-6">
            <p className="text-lg text-steel">No emails found for this connection.</p>
        </div>
    );

    return(
        <div className="card-white p-6">
        {thread.map((msg)=>(
            <div key={msg.created_at}>
                <p className="text-lg text-loch">{msg.subject}</p>
                <p className="text-sm">{msg.sender_email}</p>
                <div dangerouslySetInnerHTML={{__html: msg.body ?? ''}} className="text-sm p-4" />
            </div>
                ))}
        <div className="m-2">
            <textarea value={reply} onChange={e=> setReply(e.target.value)} className="card-white w-full h-24 p-2 border rounded-md" placeholder="Send a reply..."></textarea>
            <button onClick={sendReply} className="btn-primary">Send Reply</button>
        </div>
        </div>
    );
}