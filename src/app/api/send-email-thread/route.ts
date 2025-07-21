import { createClient } from '../../../../utils/supabase/server'
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
const resend = new Resend(process.env.RESEND_API_KEY);

interface UserInfo {
    email: string | null;
    name: string | null;
}

interface ConnectionData {
    connection_id: string;
    user1: UserInfo[];
    user2: UserInfo[];
}

export async function POST(req: Request) {
    const { connectionId }: {connectionId: string} = await req.json();

    const supabase = await createClient();

    const { data: connectionData, error: connError } = await supabase
        .from('connections')
        .select(`
            connection_id,
            user1: user1_id (email, name),
            user2: user2_id (email, name)
        `)
        .eq('connection_id', connectionId)
        .single();

    if (connError || !connectionData) {
        return NextResponse.json({ error: 'Connection not found' }, { status: 404 });
    }

    const user1 = Array.isArray(connectionData.user1) ? connectionData.user1[0] : null;
    const user2 = Array.isArray(connectionData.user2) ? connectionData.user2[0] : null;

    if (!user1?.email || !user2?.email) {
        return NextResponse.json({ error: 'User emails not found' }, { status: 500 });
    }

    const subject = `👋 You're connected!`;
    const html = `
        <p>Hi ${user1.name} & ${user2.name},</p>
        <p>We're excited to introduce you both through this thread!</p>
        <p>Feel free to reply-all and connect directly.</p>
        <p>– Your Columbia in Tech Team</p>
    `;

    try {
        await resend.emails.send({
            from: 'Maya <team@updates.mayasundar.com>',
            to: [user1.email, user2.email],
            subject,
            html,
            headers:{
                'Message-ID': `<${connectionId}@updates.mayasundar.com>`,
                'References': `<${connectionId}@updates.mayasundar.com>`,
                'In-Reply-To': `<${connectionId}@updates.mayasundar.com>`
            }
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Email failed to send' }, { status: 500 });
    }
}
