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
        const {data:userData, error:userError } = await supabase.rpc('get_user_columns');
        if (userError) {
            throw userError;
        }

        const { data:attendeeData, error:attendeeError } = await supabase
            .from('event_attendees')
            .select('*')
            .limit(1)
            .then(result => {
                if (result.data && result.data.length > 0) {
                    return {
                        data: Object.keys(result.data[0]),
                        error: null
                    };
                }
                console.error('Ok here:', error);

                return supabase.rpc('get_event_attendee_columns');
                console.error('Failed here:', error);

            });

        if (attendeeError) {
            throw attendeeError;
        }

        const userCols = userData.filter(column =>
            !['created_at', 'updated_at', 'user_id'].includes(column)
        );
        const attendeeCols = attendeeData.filter(column =>
            !['event_id', 'user_id', 'created_at'].includes(column)
        );

        return [...userCols, ...attendeeCols];


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
    if (!userData.length) return [];
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
            .select(`*`);
        if (error) throw error;
        return insertedUsers || [];
        }
        catch(error){
            console.error('Error creating users:', error);
            throw error;
        }
}

async function processUsers(userData: any[]){
    const emails = userData.map(user=>user.email);
    const existingUsers = await findExistingUsers(emails);
    const newUsers = userData.filter(user=>!existingUsers.has(user.email));
    const createdUsers = newUsers.length>0 ? await createUsers(newUsers):[];

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
    if (!attendees.length) return [];
    const supabase = await createClient();
    try{
        const eventAttendeeRecords = attendees.map(attendee => ({
            event_id: eventId,
            user_id: attendee.user_id,
            wants_intro: attendee.wants_intro||false,
            registered_status: null,
        }));

        const { data, error } = await supabase
            .from('event_attendees')
            .insert(eventAttendeeRecords)
            .select();
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
            .select(`*, users (*)`)
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

export async function createAttendee(eventId: string, userData: any){
    try{
        const {processedUsers} = await processUsers([userData.users]);
        const processedUser = processedUsers[0];
        await createEventAttendees(eventId, [processedUser]);
        const updatedAttendees = await fetchEventAttendees(eventId);
        return {
            event_attendees: updatedAttendees,
            message: 'Successfully added user to the event.'
        };
    }catch(error){
        console.error('Error in createAttendee:', error);
    }
}

export async function updateAttendee(eventAttendeeData: any, userId: string, userData: any, eventId: string){
    const supabase = await createClient();
    try{
        const {error} = await supabase
            .from('users')
            .update({...userData, updated_at: new Date().toISOString()})
            .eq('user_id', userId)
            .select();
        if (error) throw error;

        if (eventAttendeeData){
            const{error}=await supabase
                .from('event_attendees')
                .update({wants_intro: eventAttendeeData.wants_intro})
                .eq('user_id', userId)
                .eq('event_id', eventId);
            if (error) throw error;
        }

        const updatedAttendees = await fetchEventAttendees(eventId);
        return {
            event_attendees: updatedAttendees,
            message: 'Successfully updated attendee data.'
        };
    }catch(error){
        console.error('Error updating attendee data:', error);
        throw error;
    }
}

export async function deleteAttendee(userId: string, eventId: string){
    const supabase = await createClient();
    try{
        const {error}= await supabase
            .from('event_attendees')
            .delete()
            .eq('user_id', userId)
            .eq('event_id', eventId);
        if (error) throw error;
        const updatedAttendees = await fetchEventAttendees(eventId);
        return {
            event_attendees: updatedAttendees,
            message: 'Successfully deleted attendee.'
        };
    }catch(error){
        console.error('Error deleting attendee:', error);
        throw error;
    }
}

export async function generateRandomConnections(eventId: string) {
    const supabase = await createClient();
    try {
        const { data: attendees, error: attendeesError } = await supabase
            .from('event_attendees')
            .select('user_id')
            .eq('event_id', eventId)
            .eq('wants_intro', true);

        if (attendeesError) throw attendeesError;
        if (!attendees || attendees.length < 2) {
            return {
                success: false,
                message: 'Not enough attendees to generate connections',
                connections: []
            };
        }

        const { data: existingConnections, error: connectionsError } = await supabase
            .from('connections')
            .select('user1_id, user2_id')
            .eq('event_id', eventId);
        if (connectionsError) throw connectionsError;
        const existingConnectionSet = new Set();
        existingConnections?.forEach(c => {
            existingConnectionSet.add(`${c.user1_id}-${c.user2_id}`);
            existingConnectionSet.add(`${c.user2_id}-${c.user1_id}`);
        });

        const userIds = attendees.map(a => a.user_id);
        const shuffledUserIds = [...userIds].sort(() => Math.random() - 0.5);

        const connections = [];
        const paired = new Set();

        for (let i = 0; i < shuffledUserIds.length; i++) {
            if (paired.has(shuffledUserIds[i])) continue;

            for (let j = i + 1; j < shuffledUserIds.length; j++) {
                if (paired.has(shuffledUserIds[j])) continue;

                const connectionKey = `${shuffledUserIds[i]}-${shuffledUserIds[j]}`;
                if (existingConnectionSet.has(connectionKey)) continue;

                connections.push({
                    connection_id: uuidv4(),
                    user1_id: shuffledUserIds[i],
                    user2_id: shuffledUserIds[j],
                    event_id: eventId,
                    created_at: new Date().toISOString(),
                    status: 'pending'
                });

                paired.add(shuffledUserIds[i]);
                paired.add(shuffledUserIds[j]);
                break;
            }
        }

        if (connections.length > 0) {
            const { data: insertedConnections, error: insertError } = await supabase
                .from('connections')
                .insert(connections)
                .select();

            if (insertError) throw insertError;

            return {
                success: true,
                message: `Created ${connections.length} new connections`,
                connections: insertedConnections
            };
        } else {
            return {
                success: false,
                message: 'No connections could be made',
                connections: []
            };
        }

    } catch (error) {
        console.error('Error generating random connections:', error);
        throw error;
    }
}

export async function fetchEventConnections(eventId: string) {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('connections')
            .select(`*`)
            .eq('event_id', eventId);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching connections:', error);
        return [];
    }
}