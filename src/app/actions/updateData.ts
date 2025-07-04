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
        const {data:userData, error:userError } = await supabase.rpc('get_member_columns');
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
            .from('members')
            .select('user_id, email')
            .in('email', emails);
        if(error) throw error;
        return new Map(existingUsers?.map(member=>[member.email, member.user_id])||[]);
    } catch(error){
        console.error('Error finding existing users:', error);
        throw error;
    }
}

async function createMembers(userData: any[], groupId: string | null = null){
    if (!userData.length) return [];
    const supabase = await createClient();
    try {
        const { data: memberColumns, error: columnsError } = await supabase
            .rpc('get_member_columns');
        if (columnsError) throw columnsError;

        const memberSet = new Set(memberColumns);

        const newUsers = userData.map(member => {
            const memberPayload: any = {
                user_id: uuidv4(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                ...(groupId && { group_id: groupId })
            };

            for (const key in member) {
                if (memberSet.has(key)) {
                    memberPayload[key] = member[key];
                }
            }

            return memberPayload;
        });

        const {data: insertedUsers, error} = await supabase
            .from('members')
            .insert(newUsers)
            .select(`*`);
        if (error) throw error;

        if (groupId && insertedUsers) {
            await addUsersToGroup(insertedUsers.map(user => user.user_id), groupId);
        }
        return insertedUsers || [];
        }
        catch(error){
            console.error('Error creating members:', error);
            throw error;
        }
}

async function addUsersToGroup(userIds: string[], groupId: string) {
    if (!userIds.length) return;
    const supabase = await createClient();
    try {
        const {data: existingGroupMembers, error: checkError} = await supabase
            .from('user_groups')
            .select('user_id')
            .eq('group_id', groupId)
            .in('user_id', userIds);

        if (checkError) throw checkError;

        const existingMemberIds = new Set(existingGroupMembers?.map(member => member.user_id) || []);
        const usersToAdd = userIds.filter(userId => !existingMemberIds.has(userId));

        if (usersToAdd.length > 0) {
            const userGroupRecords = usersToAdd.map(userId => ({
                user_id: userId,
                group_id: groupId,
                role: 'member',
                created_at: new Date().toISOString()
            }));

            const {error} = await supabase
                .from('user_groups')
                .insert(userGroupRecords);

            if (error) throw error;
        }
    } catch (error) {
        console.error('Error adding users to group:', error);
        throw error;
    }
}

async function processMembers(memberData: any[], groupId: string | null = null){
    const supabase = await createClient();
    const emails = memberData.map(member=>member.email);
    const existingUsers = await findExistingUsers(emails);
    const newUsers = memberData.filter(member=>!existingUsers.has(member.email));
    const createdUsers = newUsers.length>0 ? await createMembers(newUsers):[];

    createdUsers.forEach(member=>existingUsers.set(member.email, member.user_id));

    const allUserIds = Array.from(existingUsers.values());

    const { data: membersPresent, error: fetchMembersError } = await supabase
        .from('members')
        .select('user_id')
        .in('user_id', allUserIds);

    if (fetchMembersError) throw fetchMembersError;

    const existingMemberIds = new Set(membersPresent?.map(m => m.user_id) || []);
    const usersMissingInMembers = memberData.filter(member => {
        const userId = existingUsers.get(member.email);
        return userId && !existingMemberIds.has(userId);
    });

    if (usersMissingInMembers.length > 0) {
        const fallbackMembers = usersMissingInMembers.map(member => ({
            user_id: existingUsers.get(member.email),
            email: member.email,
            name: member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim(),
            group_id: groupId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        const { error: fallbackError } = await supabase
            .from('members')
            .insert(fallbackMembers);

        if (fallbackError) throw fallbackError;
    }

    if (groupId) {
        const existingUserIds = Array.from(existingUsers.values());
        await addUsersToGroup(existingUserIds, groupId);
    }

    return{
        userMap: existingUsers,
        processedUsers: memberData.map(member=>({
            ...member,
            user_id: existingUsers.get(member.email)
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

export async function createEvent({ eventName, eventDate, mappedData, groupId=null }) {
    const supabase = await createClient();
    try {
        const eventId = uuidv4();
        const eventRecord = {
            event_id: eventId,
            event_name: eventName,
            event_date: eventDate.toISOString(),
            created_at: new Date(),
            ...(groupId && { group_id: groupId })
        };

        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .insert(eventRecord)
            .select()
            .single();

        if (eventError) throw eventError;

        const {processedUsers} = await processMembers(mappedData, groupId);
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
            .select(`*, members (*)`)
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

export async function createAttendee(eventId: string, memberData: any){
    try{
        const {processedUsers} = await processMembers([memberData.users]);
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

export async function userHasGroups(userId: string): Promise<boolean> {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('user_groups')
            .select('group_id')
            .eq('user_id', userId)
            .limit(1);

        if (error) throw error;
        return data.length > 0;
    } catch (error) {
        console.error('Error checking user groups:', error);
        return false;
    }
}

export async function fetchAllUserGroups(userId: string) {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('user_groups')
            .select('groups(group_id, group_name)')
            .eq('user_id', userId);

        if (error) throw error;

        return data.map(entry => entry.groups);
    } catch (error) {
        console.error('Error fetching all user groups:', error);
        throw error;
    }
}

export async function fetchUserGroupDetails(groupId: string) {
    const supabase = await createClient();

    try {
        const { data: groupData, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('group_id', groupId)
            .maybeSingle();

        if (groupError) throw groupError;

        const { data: events, error: eventsError } = await supabase
            .from('events')
            .select('*')
            .eq('group_id', groupId);

        if (eventsError) throw eventsError;

        const { data: members, error: membersError } = await supabase
            .from('members')
            .select('*')
            .eq('group_id', groupId);

        if (membersError) throw membersError;

        const eventIds = events.map(e => e.event_id);

        let attendees = [];
        if (eventIds.length > 0) {
            const { data: attendeesData, error: attendeesError } = await supabase
                .from('event_attendees')
                .select('*, members(*)')
                .in('event_id', eventIds);

            if (attendeesError) throw attendeesError;
            attendees = attendeesData;
        }

        const uniqueMembersMap = new Map<string, any>();
        attendees.forEach(attendee => {
            const member = attendee.members;
            if (member && member.email && !uniqueMembersMap.has(member.email)) {
                uniqueMembersMap.set(member.email, member);
            }
        });

        const uniqueMembers = Array.from(uniqueMembersMap.values());


        return {
            group: groupData,
            events,
            members: uniqueMembers,
            attendees
        };
    } catch (error) {
        console.error('Error fetching user group details:', error);
        throw error;
    }
}

export async function createGroupWithInvites(groupName: string, invites: Array<{ email: string; role: string }>) {
    const supabase = await createClient();
    try {
        const {data: {user}, error: userError} = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
            throw new Error('User not authenticated');
        }
        const groupId = uuidv4();
        const { data: groupData, error: groupError } = await supabase
            .from('groups')
            .insert({
                group_id:groupId,
                group_name: groupName,
                created_at: new Date().toISOString(),
            })
            .select()
            .single();

        if (groupError) throw groupError;


        await supabase.from('members').upsert({
            user_id: user.id,
            email: user.email,
            name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
            group_id: groupId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });

        const { error: ownerError } = await supabase
            .from('user_groups')
            .insert({
                user_id: user.id,
                group_id: groupId,
                role: 'owner',
                created_at: new Date().toISOString()
            });

        if (ownerError) throw ownerError;

        if (invites.length > 0) {
            const validInvites = invites.filter(invite => invite.email.trim());

            if (validInvites.length > 0) {
                for (const invite of validInvites) {
                    await sendGroupInvitation(invite.email, groupId, invite.role, groupName);
                }
            }
        }

        return {
            group: groupData,
            groupId: groupId,
            message: 'Successfully created group and added members.'
        };
    } catch (error) {
        console.error('Error creating group with invites:', error);
        throw error;
    }
}

export async function sendGroupInvitation(email: string, groupId: string, role: string, groupName: string){
    const supabase = await createClient();

    const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: {
            group_id: groupId,
            role: role,
            group_name: groupName
        },
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/accept-invitation?group=${groupId}&role=${role}`
    });

    if (error) throw error;
}

export async function acceptGroupInvitation(groupId: string, role: string) {
    const supabase = await createClient();

    try {
        const {data: {user}, error: userError} = await supabase.auth.getUser();
        if (userError || !user) throw new Error('User not authenticated');

        const { error: userGroupError } = await supabase
            .from('user_groups')
            .insert({
                user_id: user.id,
                group_id: groupId,
                role: role,
                created_at: new Date().toISOString()
            });

        if (userGroupError) throw userGroupError;

        const { error: memberError } = await supabase
            .from('members')
            .insert({
                user_id: user.id,
                group_id: groupId,
                email: user.email,
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            });

        if (memberError) throw memberError;

        return { success: true };
    } catch (error) {
        console.error('Error accepting invitation:', error);
        throw error;
    }
}
