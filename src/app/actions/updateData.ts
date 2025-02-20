"use server";
import {createClient} from '@utils/supabase/server'
// TODO: initialize supabase client, create functions to update event, users, connections data

type Event = {
    id: string;
    name: string;
    date: string;
    location: string;
    time: string;
};

type User = {
    id: string;
    name: string;
    firstName: string;
    lastName: string;
    email: string;
    participant: boolean;
}

type Connection = {
    id: string;
    user1Id: string;
    user2Id: string;
    eventId: string;
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
    try {
}