import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import {createConnectionThread} from "@/app/actions/updateData";

export async function POST(req: Request) {
    const payload = await req.json();
    const supabase = await createClient();

    const {
        from,
        subject,
        html,
        headers
    } = payload;

    const connectionIdMatch = /<(.*?)@/.exec(headers['In-Reply-To'] || headers['References']);
    const connectionId = connectionIdMatch?.[1];

    if (!connectionId) {
        return NextResponse.json({ error: 'Missing connection ID' }, { status: 400 });
    }

    const senderEmail = from.address
    await createConnectionThread(connectionId, senderEmail, subject, html)

    return NextResponse.json({ success: true });
}
