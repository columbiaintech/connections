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

type EventAttendee = {
    event_id: string;
    user_id: string;
    wants_intro: boolean;
    registered_status: string;
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

async function findExistingUsers(emails: string[]){
    const supabase = await createClient();
    try {
        const {data: existingUsers, error} = await supabase
            .from('users')
            .select('user_id, email')
            .in('email', emails);
        if(error) throw error;
        return new Map(existingUsers?.map(user=>[user.email, user.user_id])||[]);
    } catch(error){
        console.error('Error finding existing users:', error);
        throw error;
    }
}

async function createUsers(userData: any[]){
    const supabase = await createClient();
    try {
        const newUsers = userData.map(user=>({
            user_id: uuidv4(),
            ...user,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));
        const {data: insertedUsers, error} = await supabase
            .from('users')
            .insert(newUsers)
            .select();
        if (error) throw error;
        return insertedUsers;
        }
        catch(error){
            console.error('Error creating users:', error);
            throw error;
        }
}

async function processUsers(userData: any[]){
    const existingUsers = await findExistingUsers(userData.map(user=>user.email));
    const newUsers = userData.filter(user=>!existingUsers.has(user.email));
    const createdUsers = await createUsers(newUsers);

    createdUsers.forEach(user=>existingUsers.set(user.email, user.user_id));

    return{
        userMap: existingUsers,
        processedUsers: userData.map(user=>({
            ...user,
            user_id: existingUsers.get(user.email)
        }))
    };
}

async function createEventAttendees(eventId: string, attendees: any[]){
    const supabase = await createClient();
    try{
        const eventAttendeeRecords = attendees.map(attendee => ({
            event_id: eventId,
            user_id: attendee.user_id,
            wants_intro: attendee.wants_intro || false,
            registered_status: attendee.registered_status || null,
        }));

        const { data, error } = await supabase
            .from('event_attendees')
            .insert(eventAttendeeRecords);
        if (error) throw error;
        return data;
    } catch(error){
        console.error('Error creating event attendees:', error);
        throw error;
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

        const {processedUsers} = await processUsers(mappedData);
        const attendeeData = await createEventAttendees(eventId, processedUsers);

        return {
            event: eventData,
            event_attendees: attendeeData,
            users: processedUsers,
            message: 'Successfully created event & added users to the database.'
        };

    } catch (error) {
        console.error('Error in createEvent:', error);
        throw error;
    }
}

export async function fetchEventDetails(eventId: string): Promise<Event | null> {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('events')
            .select('*')
            .eq('event_id', eventId)
            .single();

        if (error) {
            throw error;
        }

        return data;

    } catch (error) {
        console.error('Error fetching events:', error);
        return null;
    }
}

export async function fetchEventAttendees(eventId: string) {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('event_attendees')
            .select(`
                *,
                users (
*                )
            `)
            .eq('event_id', eventId);

        if (error) {
            throw error;
        }

        return data;

    } catch (error) {
        console.error('Error fetching attendees:', error);
        return [];
    }
}