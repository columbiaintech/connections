import {Enums} from "@/types/supabase";

export interface MemberDataInput {
    email: string;
    first_name?: string;
    last_name?: string;
    [key: string]: any;
}

export type InviteField = 'email' | 'role';
export type GroupRole = Enums<'group_role'>;

export interface GroupInvite {
    email: string;
    role: GroupRole;
}
