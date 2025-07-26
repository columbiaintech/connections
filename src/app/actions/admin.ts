import {createClient} from "@utils/supabase/server";
import {GroupRole} from "@/types/types";
import {supabaseAdmin} from "@utils/supabase/admin";
import { Resend } from 'resend';
const resend = new Resend(process.env.RESEND_API_KEY);

export async function backfillMissingGroupIds(): Promise<{ updated: number }> {
    const supabase = await createClient();

    try {
        const { data: missingConnections, error: fetchError } = await supabase
            .from('connections')
            .select('connection_id, event_id')
            .is('group_id', null);

        if (fetchError) throw fetchError;

        if (!missingConnections || missingConnections.length === 0) {
            console.log('No connections missing group_id.');
            return { updated: 0 };
        }

        let updateCount = 0;

        for (const conn of missingConnections) {
            const { connection_id, event_id } = conn;

            const { data: event, error: eventError } = await supabase
                .from('events')
                .select('group_id')
                .eq('event_id', event_id)
                .single();

            if (eventError) {
                console.warn(`Skipping connection ${connection_id} due to event lookup error:`, eventError);
                continue;
            }

            if (!event?.group_id) {
                console.warn(`Event ${event_id} has no group_id. Skipping connection ${connection_id}.`);
                continue;
            }

            const { error: updateError } = await supabase
                .from('connections')
                .update({ group_id: event.group_id })
                .eq('connection_id', connection_id);

            if (updateError) {
                console.warn(`Failed to update connection ${connection_id}:`, updateError);
                continue;
            }
            updateCount++;
        }

        console.log(`Successfully updated ${updateCount} connections with missing group_id.`);
        return { updated: updateCount };

    } catch (error) {
        console.error('Error during backfillMissingGroupIds:', error);
        throw error;
    }
}

export async function sendGroupInvitation(email: string, groupId: string, role:GroupRole, groupName:string):Promise<void>{
    console.log(`📨 Sending invite to ${email}`);
    const acceptUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/accept-invitation?group=${groupId}&role=${role}`;
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: false,
        user_metadata: {
            invited_group_id: groupId,
            invited_group_name: groupName,
            invited_role: role,
        },
    });

    if (createError && createError.message !== 'User already registered') {
        console.error('Failed to create user:', createError);
        throw createError;
    }

    const {error:emailError} = await resend.emails.send({
        from: 'team@connections.columbiaintech.com',
        to: email,
        subject: `Invitation to join ${groupName} on Connections`,
        html: `
      <div style="font-family: sans-serif">
        <h2>You've been invited to join ${groupName}</h2>
        <p>Click the link below to accept your invitation and get started:</p>
        <a href="${acceptUrl}" style="background:#3b82f6;color:white;padding:10px 16px;border-radius:4px;text-decoration:none;">Accept Invitation</a>
      </div>
    `,
    })
    if (emailError) {
        console.error('Failed to send invite email:', emailError);
        throw emailError;
    }
    console.log(`Invite sent to ${email}`);
}