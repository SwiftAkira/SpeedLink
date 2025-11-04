'use client';

import { useEffect, useState } from 'react';
import {
  getPartyMembersWithLocations,
  subscribeToPartyMembers,
  subscribeToLocationUpdates,
} from '@/lib/services/partyService';
import type { PartyMemberWithLocation } from '@/lib/types';

interface PartyMemberListProps {
  partyId: string;
}

export default function PartyMemberList({ partyId }: PartyMemberListProps) {
  const [members, setMembers] = useState<PartyMemberWithLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembers = async () => {
    const result = await getPartyMembersWithLocations(partyId);
    if (result.error) {
      setError(result.error);
    } else if (result.data) {
      setMembers(result.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadMembers();

    // Subscribe to real-time updates
    const memberChannel = subscribeToPartyMembers(partyId, () => {
      loadMembers(); // Reload when members change
    });

    const locationChannel = subscribeToLocationUpdates(partyId, () => {
      loadMembers(); // Reload when locations update
    });

    return () => {
      memberChannel.unsubscribe();
      locationChannel.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partyId]);

  const formatLastSeen = (lastSeenAt: string) => {
    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
  };

  const getSpeedText = (speed: number) => {
    return `${Math.round(speed)} km/h`;
  };

  if (loading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin h-8 w-8 border-4 border-[var(--primary)] border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <p className="text-sm text-[var(--danger)]">{error}</p>
      </div>
    );
  }

  if (members.length === 0) {
    return (
      <div className="card">
        <p className="text-sm text-[var(--foreground-secondary)] text-center py-4">
          No members in party
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-[var(--foreground)]">
          Party Members
        </h3>
        <span className="text-sm font-semibold text-[var(--primary)]">
          {members.length} {members.length === 1 ? 'member' : 'members'}
        </span>
      </div>

      {members.map((member) => (
        <div
          key={member.id}
          className="card flex items-center justify-between p-4 hover:border-[var(--primary)]/30 transition-colors"
        >
          <div className="flex items-center gap-3 flex-1">
            {/* Online indicator */}
            <div className="relative">
              <div className="w-12 h-12 rounded-full bg-[var(--card-bg)] border-2 border-[var(--border)] flex items-center justify-center text-lg font-bold">
                {member.profile?.display_name?.[0]?.toUpperCase() || '?'}
              </div>
              <div
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[var(--background)] ${
                  member.is_online
                    ? 'bg-[var(--success)]'
                    : 'bg-[var(--foreground-secondary)]'
                }`}
              />
            </div>

            {/* Member info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-[var(--foreground)] truncate">
                {member.profile?.display_name || 'Anonymous'}
              </div>
              <div className="text-xs text-[var(--foreground-secondary)] mt-0.5">
                {member.is_online
                  ? 'Online'
                  : `Last seen ${formatLastSeen(member.last_seen_at)}`}
              </div>
            </div>

            {/* Speed indicator */}
            {member.latest_location && member.is_online && (
              <div className="text-right">
                <div className="text-sm font-bold text-[var(--primary)]">
                  {getSpeedText(member.latest_location.speed)}
                </div>
                <div className="text-xs text-[var(--foreground-secondary)]">
                  Speed
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
