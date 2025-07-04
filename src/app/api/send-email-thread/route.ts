import { createClient } from '../../../../utils/supabase/server'
import { Resend } from 'resend';
import { NextResponse } from 'next/server';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    const { connectionId } = await req.json();

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

    const { user1, user2 } = connectionData;

    const subject = `👋 You're connected!`;
    const html = `
        <p>Hi ${user1.name} & ${user2.name},</p>
        <p>We're excited to introduce you both through this thread!</p>
        <p>Feel free to reply-all and connect directly.</p>
        <p>– Your Team</p>
    `;

    try {
        await resend.emails.send({
            from: 'Maya <team@updates.mayasundar.com>',
            to: [user1.email, user2.email],
            subject,
            html
        });

        return NextResponse.json({ success: true });
    } catch (err) {
        return NextResponse.json({ error: 'Email failed to send' }, { status: 500 });
    }
}
