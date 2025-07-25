import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import {createConnectionThread, getConnectionDetailsForEmail} from "@/app/actions/updateData";
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
    const { connectionIds } = await req.json();

    if (!Array.isArray(connectionIds)) {
        return NextResponse.json({ error: 'connectionIds must be an array' }, { status: 400 });
    }

    let emailsSent = 0;

    for (const connectionId of connectionIds) {
        if (!connectionId || typeof connectionId !== 'string') {
            console.warn('Skipping invalid connectionId:', connectionId);
            continue;
        }

        try {
            const details = await getConnectionDetailsForEmail(connectionId);

            if (!details || !details.user1 || !details.user2 || !details.event || !details.group) {
                console.warn(`Missing data for connection ${connectionId}`);
                continue;
            }

            const {user1, user2, event, group} = details;

            if (!user1.email || !user2.email) {
                console.warn(`Missing email for users in connection ${connectionId}`);
                continue;
            }

            const dateStr = event.event_date ? new Date(event.event_date).toLocaleDateString() : '[date unavailable]';
            const subject = `👋 Your ${group.group_name} Connection!`;
            const html = `
        <p>Hi ${user1.first_name} & ${user2.first_name},</p>
        <p>We're excited to introduce you both through this thread ahead of our <strong>${event.event_name}</strong> on <strong>${dateStr}</strong>.</p>
        <p>Feel free to reply-all and connect directly.</p>
        <p>– Your ${group.group_name} Team</p>
    `;

            await resend.emails.send({
                from: 'Connections <team@connections.columbiaintech.com>',
                to: [user1.email, user2.email],
                subject,
                html,

                headers: {
                    'Message-ID': `<${connectionId}@connections.columbiaintech.com>`,
                    'References': `<${connectionId}@connections.columbiaintech.com>`,
                    'In-Reply-To': `<${connectionId}@connections.columbiaintech.com>`
                },
                replyTo: 'maya@columbiaintech.com'
            });
            const senderEmail = 'team@connections.columbiaintech.com'
            await createConnectionThread(connectionId, senderEmail, subject, html)
            emailsSent++;
        } catch (err) {
            console.error(`Failed to send email for connection ${connectionId}:`, err);
            continue;
        }
    }
        return NextResponse.json({ success: true });
    }
