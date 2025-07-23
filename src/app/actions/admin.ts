import {createClient} from "@utils/supabase/server";

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
