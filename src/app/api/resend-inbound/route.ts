import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
    const payload = await req.json();
    const supabase = await createClient();

    const {
        from,
        subject,
        html,
        headers
    } = payload;

    const connectionIdMatch = /<(.*?)@/.exec(headers['In-Reply-To'] || '');
    const connectionId = connectionIdMatch?.[1];

    if (!connectionId) {
        return NextResponse.json({ error: 'Missing connection ID' }, { status: 400 });
    }

    await supabase.from('connection_threads').insert({
        connection_id: connectionId,
        sender_email: from.address,
        subject,
        body: html
    });

    return NextResponse.json({ success: true });
}
