'use client';
import { useState } from 'react';

export default function EmailThreadButton({ connectionIds }: { connectionIds: string[] }) {
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSend = async () => {
        setSending(true);
        try {
            const res = await fetch('/api/send-email-thread', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ connectionIds })
            });
            if (!res.ok) throw new Error('Failed');
            const result = await res.json();
            setSent(true);
            if (connectionIds.length > 1) {
                alert(`Successfully sent ${result.emailsSent} intro emails`);
            }
        } catch (e) {
            alert('Failed to send email');
        } finally {
            setSending(false);
        }
    };

    const getButtonText = () => {
        if (sent) return connectionIds.length > 1 ? 'Emails Sent' : 'Email Sent';
        if (sending) return 'Sending...';
        return connectionIds.length > 1 ? `Send Intro Emails (${connectionIds.length})` : 'Send Intro Email';
    };

    return (
        <button
            onClick={handleSend}
            disabled={sending || sent || connectionIds.length === 0}
            className={`py-1 px-3 rounded btn-primary ${
                sent ? 'btn-secondary' : 'bg-blue-600 hover:bg-blue-500'
            }${connectionIds.length === 0 ? 'bg-gray-400 cursor-not-allowed' : ''}`}
        >
            {getButtonText()}
        </button>
    );
}
