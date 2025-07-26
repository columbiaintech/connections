"use server";
import {createClient} from '@/utils/supabase/server'
import { v4 as uuidv4 } from 'uuid';
import { Tables, TablesInsert, TablesUpdate, Enums } from '@/types/supabase';
import {sendGroupInvitation} from "@/app/actions/admin";

// TODO: initialize supabase client, create functions to update event, users, connections data

type Member = Tables<'members'>;
type Event = Tables<'events'>;
type EventAttendee = Tables<'event_attendees'>;
type Connection = Tables<'connections'>;
type EnrichedConnection = Tables<'enriched_connections'>;
type PartialConnection = Pick<Connection, 'user1_id' | 'user2_id'>;
type Group = Tables<'groups'>;
type UserGroup = Tables<'user_groups'>;
type ConnectionThread = Tables<'connection_threads'>;

type UserGroupRow = {
    groups: Group | null;
};

type MemberInsert = TablesInsert<'members'>;
type EventInsert = TablesInsert<'events'>;
type EventAttendeeInsert = TablesInsert<'event_attendees'>;
type ConnectionInsert = TablesInsert<'connections'>;
type GroupInsert = TablesInsert<'groups'>;
type UserGroupInsert = TablesInsert<'user_groups'>;

type ConnectionStatus = Enums<'connection_status'>;
type GroupRole = Enums<'group_role'>;
type RegistrationStatus = Enums<'registration_status'>;

interface MemberDataInput {
    email: string;
    name?: string;
    first_name?: string;
    last_name?: string;
    company?: string;
    job_title?: string;
    class_year?: number;
    school?: string;
    wants_intro?: boolean;
    [key: string]: any;
}

interface ProcessedMember extends MemberDataInput {
    user_id: string;
}

export interface CreateEventInput {
    eventName: string;
    eventDate: Date;
    mappedData: MemberDataInput[];
    groupId?: string | null;
}

interface CreateEventResult {
    event: Event;
    event_attendees: EventAttendee[];
    members: ProcessedMember[];
    message: string;
}

interface ConnectionGenerationResult {
    success: boolean;
    message: string;
    connections: Connection[];
}

interface GroupInvite {
    email: string;
    role: GroupRole;
}

interface GroupCreationResult {
    group: Group;
    groupId: string;
}

interface ProcessMembersResult {
    userMap: Map<string, string>;
    processedMembers: ProcessedMember[];
}

interface GroupDetailsResult {
    group: Group | null;
    events: Event[];
    members: Member[];
    attendees: (EventAttendee & { members: Member })[];
    connections: EnrichedConnection[];
}

interface AttendeeUpdateResult {
    event_attendees: (EventAttendee & { members: Member })[];
    message: string;
}


export async function fetchColumns() {
    const supabase = await createClient()
    try {
        console.log('right before gmc')
        const {data:userData, error:userError } = await supabase.rpc('get_member_columns');
        if (userError) {
            throw userError;
        }
        console.log('Columns returned by get_member_columns:', userData);

        const { data:previewAttendee, error:previewError } = await supabase
            .from('event_attendees')
            .select('*')
            .limit(1);

        let attendeeCols: string[] = [];

        if (previewError) throw previewError;

        if (previewAttendee && previewAttendee.length > 0) {
            attendeeCols = Object.keys(previewAttendee[0]).filter(
                (col) => !['event_id', 'user_id', 'created_at'].includes(col)
            );
        } else {
            console.log('right before gac')
            const { data: fallbackCols, error: fallbackError } = await supabase.rpc('get_event_attendee_columns');
            if (fallbackError) throw fallbackError;

            attendeeCols = (fallbackCols as string[]).filter(
                (col) => !['event_id', 'user_id', 'created_at'].includes(col)
            );
        }

        const userCols = (userData as string[]).filter(column =>
            !['created_at', 'updated_at', 'user_id'].includes(column)
        );

        return [...userCols, ...attendeeCols];


    } catch (error) {
        console.error('Error fetching columns:', error);
        return [];
    }
}

async function findExistingMembers(emails: string[]): Promise<Map<string, string>>{
    const supabase = await createClient();
    try {
        const {data: existingMembers, error} = await supabase
            .from('members')
            .select('user_id, email')
            .in('email', emails);
        if(error) throw error;
        return new Map(existingMembers?.map((member: { email: string; user_id: string })=>[member.email, member.user_id])||[]);
    } catch(error){
        console.error('Error finding existing members:', error);
        throw error;
    }
}

async function createMembers(userData: MemberDataInput[], groupId: string | null = null): Promise<Member[]>{
    if (!userData.length) return [];
    const supabase = await createClient();
    try {
        console.log('right before gmc')
        const { data: memberColumns, error: columnsError } = await supabase
            .rpc('get_member_columns');
        if (columnsError) throw columnsError;
        console.log('Columns returned by get_member_columns:', userData);

        const memberSet = new Set(memberColumns);

        const newMembers: MemberInsert[] = userData.map(member => {
            const memberPayload: MemberInsert = {
                user_id: uuidv4(),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            for (const key in member) {
                if (memberSet.has(key)) {
                    (memberPayload as any)[key] = member[key];
                }
            }
            console.log("Inserting this into members:", memberPayload);

            return memberPayload;
        });

        const {data: insertedMembers, error} = await supabase
            .from('members')
            .insert(newMembers)
            .select(`*`);
        if (error) throw error;

        if (groupId && insertedMembers) {
            await addMembersToGroup(insertedMembers.map((user: { user_id: string }) => user.user_id), groupId);
        }
        return insertedMembers || [];
        }
        catch(error){
            console.error('Error creating members:', error);
            throw error;
        }
}

async function addMembersToGroup(userIds: string[], groupId: string): Promise<void> {
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
        const membersToAdd = userIds.filter(userId => !existingMemberIds.has(userId));

        if (membersToAdd.length > 0) {
            const userGroupRecords: UserGroupInsert[] = membersToAdd.map(userId => ({
                user_id: userId,
                group_id: groupId,
                role: 'member' as GroupRole,
                created_at: new Date().toISOString()
            }));

            const {error} = await supabase
                .from('user_groups')
                .insert(userGroupRecords);

            if (error) throw error;
        }
    } catch (error) {
        console.error('Error adding members to group:', error);
        throw error;
    }
}

async function processMembers(memberData: MemberDataInput[], groupId: string | null = null): Promise<ProcessMembersResult>{
    const supabase = await createClient();
    const emails = memberData.map(member=>member.email);
    const existingMembers = await findExistingMembers(emails);
    const newMembers = memberData.filter(member=>!existingMembers.has(member.email));
    const createdMembers = newMembers.length>0 ? await createMembers(newMembers, groupId) : [];

    createdMembers.forEach(member=>existingMembers.set(member.email!, member.user_id));

    const allMemberIds = Array.from(existingMembers.values());

    const { data: membersPresent, error: fetchMembersError } = await supabase
        .from('members')
        .select('user_id')
        .in('user_id', allMemberIds);

    if (fetchMembersError) throw fetchMembersError;

    const existingMemberIds = new Set(membersPresent?.map(m => m.user_id) || []);
    const usersMissingInMembers = memberData.filter(member => {
        const userId = existingMembers.get(member.email);
        return userId && !existingMemberIds.has(userId);
    });

    if (usersMissingInMembers.length > 0) {
        const fallbackMembers: MemberInsert[] = usersMissingInMembers.map(member => ({
            user_id: existingMembers.get(member.email)!,
            email: member.email,
            name: member.name || `${member.first_name || ''} ${member.last_name || ''}`.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        }));

        const { error: fallbackError } = await supabase
            .from('members')
            .insert(fallbackMembers);

        if (fallbackError) throw fallbackError;
    }

    if (groupId) {
        const existingUserIds = Array.from(existingMembers.values());
        await addMembersToGroup(existingUserIds, groupId);
    }

    return{
        userMap: existingMembers,
        processedMembers: memberData.map(member=>({
            ...member,
            user_id: existingMembers.get(member.email)!
        }))
    };
}

async function createEventAttendees(eventId: string, attendees: ProcessedMember[]): Promise<EventAttendee[]>{
    if (!attendees.length) return [];
    const supabase = await createClient();
    try{
        const eventAttendeeRecords: EventAttendeeInsert[] = attendees.map(attendee => ({
            event_id: eventId,
            user_id: attendee.user_id,
            wants_intro: attendee.wants_intro||false,
            registered_status: null as RegistrationStatus | null,
        }));

        const { data, error } = await supabase
            .from('event_attendees')
            .insert(eventAttendeeRecords)
            .select();
        if (error) throw error;
        return data || [];
    } catch(error){
        console.error('Error creating event attendees:', error);
        throw error;
    }
}

export async function createEvent({ eventName, eventDate, mappedData, groupId=null }: CreateEventInput): Promise<CreateEventResult> {
    const supabase = await createClient();
    try {
        const eventId = uuidv4();
        const eventRecord: EventInsert = {
            event_id: eventId,
            event_name: eventName,
            event_date: eventDate.toISOString(),
            created_at: new Date().toISOString(),
            ...(groupId && { group_id: groupId })
        };

        const { data: eventData, error: eventError } = await supabase
            .from('events')
            .insert(eventRecord)
            .select()
            .single();

        if (eventError) throw eventError;

        const {processedMembers} = await processMembers(mappedData, groupId);
        const attendeeData = await createEventAttendees(eventId, processedMembers);

        return {
            event: eventData,
            event_attendees: attendeeData,
            members: processedMembers,
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

export async function fetchEventAttendees(eventId: string): Promise<(EventAttendee & { members: Member })[]> {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('event_attendees')
            .select(`*, members (*)`)
            .eq('event_id', eventId);

        if (error) {
            throw error;
        }

        return data || [];

    } catch (error) {
        console.error('Error fetching attendees:', error);
        return [];
    }
}

export async function fetchEligibleAttendees(eventId: string): Promise<(EventAttendee & { members: Member })[]> {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('event_attendees')
            .select(`*, members (*)`)
            .eq('event_id', eventId)
            .eq('wants_intro', true);

        if (error) {
            throw error;
        }

        return data || [];

    } catch (error) {
        console.error('Error fetching eligible attendees:', error);
        return [];
    }
}

export async function createAttendee(eventId: string, memberData: { members: MemberDataInput }): Promise<AttendeeUpdateResult | undefined>{
    try{
        const {processedMembers} = await processMembers([memberData.members]);
        const processedMember = processedMembers[0];
        await createEventAttendees(eventId, [processedMember]);
        const updatedAttendees = await fetchEventAttendees(eventId);
        return {
            event_attendees: updatedAttendees,
            message: 'Successfully added user to the event.'
        };
    }catch(error){
        console.error('Error in createAttendee:', error);
    }
}

export async function updateAttendee(eventAttendeeData: { wants_intro: boolean } | null, userId: string, userData: Partial<Member>, eventId: string): Promise<AttendeeUpdateResult>{
    const supabase = await createClient();
    try{
        const memberUpdate: TablesUpdate<'members'> = {
            ...userData,
            updated_at: new Date().toISOString()
        };

        const {error} = await supabase
            .from('members')
            .update(memberUpdate)
            .eq('user_id', userId)
            .select();
        if (error) throw error;

        if (eventAttendeeData){
            const attendeeUpdate: TablesUpdate<'event_attendees'> = {
                wants_intro: eventAttendeeData.wants_intro
            };

            const{error}=await supabase
                .from('event_attendees')
                .update(attendeeUpdate)
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

export async function deleteAttendee(userId: string, eventId: string): Promise<AttendeeUpdateResult>{
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

export async function generateRandomConnections(eventId: string): Promise<ConnectionGenerationResult> {
    const supabase = await createClient();
    try {
        const {data: event, error: eventError} = await supabase
            .from('events')
            .select('group_id')
            .eq('event_id', eventId)
            .single();
        if (eventError) throw eventError;
        if(!event?.group_id) throw new Error('Event does not have an associated group_id');

        const groupId = event.group_id;

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
        (existingConnections as Connection[])?.forEach((c: Connection) => {
            existingConnectionSet.add(`${c.user1_id}-${c.user2_id}`);
            existingConnectionSet.add(`${c.user2_id}-${c.user1_id}`);
        });

        const userIds = (attendees as EventAttendee[])?.map(a => a.user_id) || [];

        const shuffledUserIds = [...userIds].sort(() => Math.random() - 0.5);

        const connections: ConnectionInsert[] = [];
        const paired = new Set<string>();

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
                    group_id: groupId,
                    created_at: new Date().toISOString(),
                    status: 'email_not_sent' as ConnectionStatus
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
                connections: insertedConnections || []
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

export async function fetchEventConnections(eventId: string): Promise<EnrichedConnection[]> {
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('enriched_connections')
            .select(`*`)
            .eq('event_id', eventId);

        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching enriched connections:', error);
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
        return (data?.length||0) > 0;
    } catch (error) {
        console.error('Error checking user groups:', error);
        return false;
    }
}

export async function fetchAllUserGroups(userId: string): Promise<Group[]> {
    const supabase = await createClient();

    try {
        const { data, error } = await supabase
            .from('user_groups')
            .select('groups(group_id, group_name)')
            .eq('user_id', userId);

        if (error) throw error;

        return (data?.flatMap(entry => entry.groups).filter(Boolean) || []) as Group[];
    } catch (error) {
        console.error('Error fetching all user groups:', error);
        throw error;
    }
}

export async function fetchUserGroupDetails(groupId: string): Promise<GroupDetailsResult> {
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

        const eventIds = events?.map((e: Event)  => e.event_id) || [];

        const { data: enriched_connections, error: connectionsError } = await supabase
            .from('enriched_connections')
            .select('*')
            .in('event_id', eventIds);

        if (connectionsError) throw connectionsError;

        const { data: userGroups, error: userGroupsError } = await supabase
            .from('user_groups')
            .select('user_id, members(*)')
            .eq('group_id', groupId);

        if (userGroupsError) throw userGroupsError;

        const members = userGroups
            ? userGroups.map((ug: any) => ug.members).filter(Boolean)
            : [];

        let attendees: (EventAttendee & { members: Member })[] = [];
        if (eventIds.length > 0) {
            const { data: attendeesData, error: attendeesError } = await supabase
                .from('event_attendees')
                .select('*, members(*)')
                .in('event_id', eventIds);

            if (attendeesError) throw attendeesError;
            attendees = attendeesData || [];
        }

        // const uniqueMembersMap = new Map<string, Member>();
        // attendees.forEach(attendee => {
        //     const member = attendee.members;
        //     if (member?.email && !uniqueMembersMap.has(member.email)) {
        //         uniqueMembersMap.set(member.email, member);
        //     }
        // });

        // const uniqueMembers = Array.from(uniqueMembersMap.values());


        return {
            group: groupData,
            events: events || [],
            members,
            attendees,
            connections: enriched_connections || []
        };
    } catch (error) {
        console.error('Error fetching user group details:', error);
        throw error;
    }
}

export async function createGroupWithInvites(groupName: string, invites: GroupInvite[]): Promise<GroupCreationResult> {
    const supabase = await createClient();
    try {
        const {data: {user}, error: userError} = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) {
            throw new Error('User not authenticated');
        }
        const groupId = uuidv4();
        const groupData: GroupInsert = {
            group_id: groupId,
            group_name: groupName,
            description: null,
            created_at: new Date().toISOString(),
        };
        console.log('✅ Inserting group');
        const { data: insertedGroup, error: groupError } = await supabase
            .from('groups')
            .insert(groupData)
            .select()
            .single();

        if (groupError) throw groupError;
        console.log('✅ Checking for existing member');
        const { data: existingMember, error: memberCheckError } = await supabase
            .from('members')
            .select('*')
            .eq('user_id', user.id)
            .maybeSingle();

        if (memberCheckError) throw memberCheckError;

        let memberUserId = user.id;

        if (!existingMember) {
            const memberData: MemberInsert = {
                user_id: memberUserId,
                email: user.email || '',
                name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            };

            const { data: insertedMember, error: insertMemberError } = await supabase
                .from('members')
                .insert(memberData)
                .select()
                .single();
            if (insertMemberError) throw insertMemberError;
        }

            const ownerGroupData: UserGroupInsert = {
            user_id: user.id,
            group_id: groupId,
            role: 'owner' as GroupRole,
            created_at: new Date().toISOString()
        };
        console.log('✅ Inserting owner into user_groups');

        const { error: ownerError } = await supabase
            .from('user_groups')
            .insert(ownerGroupData);

        if (ownerError) throw ownerError;
        console.log('✅ Sending invites');

        const validInvites = invites.filter(invite => invite.email.trim());
        for (const invite of validInvites) {
            await sendGroupInvitation(invite.email, groupId, invite.role, groupName);
        }
        console.log('✅ sent invites');

        return {
            groupId,
            group: insertedGroup,
        };
    } catch (error) {
        console.error('Error creating group with invites:', error);
        throw error;
    }
}
export async function createConnectionThread(connectionId: string, senderEmail: string, subject: string, body: string) {
    const supabase = await createClient();

    try {
        const threadId = uuidv4();
        const { data, error } = await supabase
            .from('connection_threads')
            .insert({
                connection_id: connectionId,
                sender_email: senderEmail,
                subject,
                body,
                thread_id: threadId,
                created_at: new Date().toISOString()
            })
            .select()
            .single();

        await updateConnectionStatus(connectionId, 'pending' as ConnectionStatus)
        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error creating connection thread:', error);
        throw error;
    }
}

export async function fetchConnectionThread(connectionId: string): Promise<ConnectionThread[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('connection_threads')
        .select('*')
        .eq('connection_id', connectionId)
        .order('created_at', { ascending: true });

    if (error) throw error;
    return data||[];
}

export async function updateConnectionStatus(connectionId: string, status: ConnectionStatus): Promise<{ success:boolean;message:string  }> {
    const supabase = await createClient();
    try {
        const { error } = await supabase
            .from('connections')
            .update({ status })
            .eq('connection_id', connectionId);

        if (error) throw error;

        return {
            success: true,
            message: 'Connection status updated successfully'
        };
    } catch (error) {
        console.error('Error updating connection status:', error);
        return {
            success: false,
            message: 'Failed to update connection status'
        };
    }
}

export async function getConnectionDetails(connectionIds: string[]){
    const supabase = await createClient();
    try {
        const { data, error } = await supabase
            .from('connections')
            .select('*')
            .in('connection_id', connectionIds);

        if (error) throw error;

        return data || [];
    } catch (error) {
        console.error('Error fetching connection details:', error);
        return [];
    }
}


export async function getConnectionDetailsForEmail(connectionId: string): Promise<{
    event: Pick<Event, 'event_name' | 'event_date'> | null;
    group: Group | null;
    user1: Member | null;
    user2: Member | null;
}> {
    const supabase = await createClient();

    try {
        // connection data
        const { data: connection, error: connError } = await supabase
            .from('connections')
            .select('event_id, group_id, user1_id, user2_id')
            .eq('connection_id', connectionId)
            .single();

        if (connError) throw connError;
        if (!connection) throw new Error('Connection not found');
        console.log('Fetched connection:', connection);

        const { event_id, group_id, user1_id, user2_id } = connection;

        // event data using connection.event_id
        const { data: event, error: eventError } = await supabase
            .from('events')
            .select('event_name, event_date')
            .eq('event_id', event_id)
            .single();

        if (eventError) throw eventError;

        // group data using connections.group_id
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('group_id', group_id)
            .single();

        if (groupError) throw groupError;

        if (!user1_id || !user2_id) {
            throw new Error(`user1_id or user2_id is null for connection ${connectionId}`);
        }

        // member data using connections.user1_id and connections.user2_id
        const { data: members, error: memberError } = await supabase
            .from('members')
            .select('*')
            .in('user_id', [user1_id, user2_id]);

        if (memberError) throw memberError;
        const updatedMembers = (members ?? []) as Member[];
        const user1 = updatedMembers?.find((m) => m.user_id === user1_id) || null;
        const user2 = updatedMembers?.find((m) => m.user_id === user2_id) || null;

        return {
            event: event || null,
            user1,
            user2,
            group: group || null
        };
    } catch (error) {
        console.error('Error fetching connection details for email:', error);
        throw error;
    }
}

