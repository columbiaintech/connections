"use server";
import {createClient} from '@utils/supabase/server'
import { v4 as uuidv4 } from 'uuid';
// TODO: initialize supabase client, create functions to update event, users, connections data

type Event = {
    eventId: string;
    eventName: string;
    eventDate: Date;
    createdAt: Date;
};

type User = {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    wantsIntroduction: boolean;
    createdAt: Date;
    updatedAt: Date;
    school: string;
    classYear: number;
    jobTitle: string;
    companyName: string;
}

type Connection = {
    id: string;
    user1Id: number;
    user2Id: number;
    eventId: string;
    createdAt: Date;
    status: string;
}

export async function fetchColumns() {
    const supabase = await createClient()
    try {
        const { data: columns, error } = await supabase
            .from('users')
            .select('*')
            .csv();

        if (error) throw error;

        return columns.split('\n')[0].split(',');

    } catch (error) {
        console.error('Error fetching columns:', error);
        return [];
    }
}

export async function updateEvent({eventName, eventDate, mappedData}: EventSubmitData) {
    const supabase = await createClient()
    try {
        const eventId = uuidv4();
        const eventRecord: EventRecord = {
            id: eventId,
            name: eventName,
            date: eventDate,
            created_at: new Date(),
        };

        const { data: eventData} = await supabase
            .from('events')
            .insert(eventRecord)
            .select()
            .single();

        const userRecords= mappedData.map(userData=>({
            id: uuidv4(),
            ...userData,
        }));
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert(userRecords)
            .select();

        if (userError) {
            await supabase
                .from('events')
                .delete()
                .eq('id', eventId);

            throw new Error(`Failed to create users: ${userError.message}`);
        }

        return {
            event: eventData,
            users: userData,
            message: 'Successfully created event and users'
        };

    } catch (error) {
        console.error('Error in updateData:', error);
        throw error;
    }
}