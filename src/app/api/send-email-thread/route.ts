import { Resend } from 'resend';
import { NextResponse } from 'next/server';
import {createConnectionThread, getConnectionDetailsForEmail} from "@/app/actions/updateData";
import * as fs from "fs";
import path from "path";
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

            const dateStr = event?.event_date ?
                new Date(event.event_date).toLocaleDateString('en-US', { timeZone: 'UTC' }) :
                '[date unavailable]';
            const subject = `👋 Your ${group.group_name} Connection on ${dateStr}!`;
            const html = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>👋 Your ${group.group_name} Connection on ${dateStr}!</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0 auto; padding: 20px;">
        <div style="font-family: 'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; ">
            <div style="color: #46948D; font-size: 1.375rem; margin-top: 8px;">Your ${group.group_name} Connection on ${dateStr}!</div>
            <p style="font-size: 1.125rem; color: #3C6783;"> ${user1.name} (${user1.school} ${user1.class_year}) 🤝 ${user2.name} (${user2.school} ${user2.class_year})</p>
        </div>

        <p>Hi ${user1.first_name} & ${user2.first_name},</p>
        <p>We're excited to introduce you both through this thread ahead of our ${event.event_name}.</p>        
        <p>Feel free to reply-all and connect directly. If you haven't met before, we hope nametags will make it easy for you to find each other at the event!</p>
        <p>Thank you so much for participating in our little pilot - this is the first time we've done this! We'll follow up to get your thoughts afterwards.</p>
        <p>– Maya, on behalf of the ${group.group_name} Team</p>
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
                replyTo: ['maya@columbiaintech.com'],
                cc: ['maya@columbiaintech.com'],
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
