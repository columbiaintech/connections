"use server";
import {createClient} from '@utils/supabase/server'
import { v4 as uuidv4 } from 'uuid';
// TODO: initialize supabase client, create functions to update event, users, connections data

type Event = {
    event_id: string;
    event_name: string;
    event_date: Date;
    created_at: Date;
};

type User = {
    user_id: string;
    name: string;
    first_name: string;
    last_name: string;
    email: string;
    wants_intro: boolean;
    created_at: Date;
    updated_at: Date;
    school: string;
    class_year: number;
    job_title: string;
    company_name: string;
}

type Connection = {
    connection_id: string;
    user1_id: number;
    user2_id: number;
    event_id: string;
    created_at: Date;
    status: string;
}

export async function fetchColumns() {
    const supabase = await createClient()
    try {
        const { data, error } = await supabase.rpc('get_user_columns');

        if (error) {
            throw error;
        }

        return data.filter(column =>
            !['created_at', 'updated_at', 'user_id'].includes(column)
        );

    } catch (error) {
        console.error('Error fetching columns:', error);
        return [];
    }
}

export async function createEvent({ eventName, eventDate, mappedData }) {
    const supabase = await createClient();
    try {
        const eventId = uuidv4();
        const eventRecord = {
            event_id: eventId,
            event_name: eventName,
            event_date: eventDate.toISOString(),
            created_at: new Date(),
        };

        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .insert(eventRecord)
            .select()
            .single();

        if (eventError) throw eventError;

        const emails = mappedData.map(user => user.email);
        const { data: existingUsers, error: existingError } = await supabase
            .from('users')
            .select('user_id, email')
            .in('email', emails);

        if (existingError) throw existingError;

        const existingUsersMap = new Map(
            existingUsers?.map(user => [user.email, user.user_id]) || []
        );

        const newUsers = mappedData
            .filter(user => !existingUsersMap.has(user.email))
            .map(user => ({
                user_id: uuidv4(),
                ...user,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                wants_intro: user.wants_intro || false,
            }));

        if (newUsers.length > 0) {
            const { data: insertedUsers, error: insertError } = await supabase
                .from('users')
                .insert(newUsers)
                .select();

            if (insertError) throw insertError;

            insertedUsers.forEach(user => existingUsersMap.set(user.email, user.user_id));
        }

        const processedUsers = [...existingUsers, ...newUsers];

        return {
            event: eventData,
            users: processedUsers,
            message: 'Successfully created event and users'
        };

    } catch (error) {
        console.error('Error in updateEvent:', error);
        throw error;
    }
}