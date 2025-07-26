"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { createClient } from '../../utils/supabase/client';

export default function AcceptInvitation() {
    const supabase = createClient();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alreadyJoined, setAlreadyJoined] = useState(false);

    useEffect(() => {
        const acceptInvitation = async () => {
            const groupId = searchParams.get('group');
            const role = searchParams.get('role');

            if (!groupId || !role) {
                setError('Missing invitation information.');
                setLoading(false);
                return;
            }

            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                router.push(`/signin?next=/accept-invitation?group=${groupId}&role=${role}`);
                return;
            }

            try {
                // check if the user is already a member of the group (e.g. double-clicked link)
                const {data: existingUGroup, error: groupError } = await supabase
                    .from('user_groups')
                    .select('*')
                    .eq('user_id', user.id)
                    .eq('group_id', groupId)
                    .maybeSingle();

                if(existingUGroup){
                    setAlreadyJoined(true);
                    router.push(`/dashboard/${groupId}`);
                    return;
                }

                const { data: existingMember } = await supabase
                    .from('members')
                    .select('*')
                    .eq('user_id', user.id)
                    .maybeSingle();

                if (!existingMember) {
                    await supabase.from('members').insert({
                        user_id: user.id,
                        email: user.email,
                        name: user.user_metadata?.full_name || user.email?.split('@')[0],
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString(),
                    });
                }

                await supabase.from('user_groups').insert({
                    user_id: user.id,
                    group_id: groupId,
                    role,
                    created_at: new Date().toISOString(),
                });

                router.push(`/dashboard/${groupId}`);
            } catch (err: any) {
                console.error('Invitation error:', err);
                setError(err.message);
                setLoading(false);
            }
        };

        acceptInvitation();
    }, [searchParams, router, supabase]);

    if (loading) return <p className="card-white p-6">Processing your invitation...</p>;
    if (error) return <p className="card-pink p-6">Error: {error}</p>;

    if (alreadyJoined) {
        return <p className="card-white p-6">You are already a member of this organization. Redirecting...</p>;
    }

    return null;
}