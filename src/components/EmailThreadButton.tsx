'use client';
import { useState } from 'react';

export default function EmailThreadButton({ connectionId }: { connectionId: string }) {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            const res = await fetch('/api/send-email-thread', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionId })
            });

            if (!res.ok) throw new Error('Failed');

            setSent(true);
        } catch (e) {
            alert('Failed to send email');
        } finally {
            setSending(false);
        }
    };

    return (
        <button
            onClick={handleSend}
            disabled={sending || sent}
            className={`py-1 px-3 rounded btn-primary ${
                sent ? 'btn-secondary' : 'bg-blue-600 hover:bg-blue-500'
            }`}
        >
            {sent ? 'Email Sent' : sending ? 'Sending...' : 'Send Intro Email'}
        </button>
    );
}
