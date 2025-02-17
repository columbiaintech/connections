"use server";
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
