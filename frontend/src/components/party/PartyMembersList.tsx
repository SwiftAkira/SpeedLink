/**
 * Party Members List
 * Display list of party members with real-time status updates
 */

import React from 'react';
import type { PartyMember } from '@/types/party.types';
import './PartyMembersList.css';

interface PartyMembersListProps {
  members: PartyMember[];
  leaderId: number;
  currentUserId?: number;
}

const VEHICLE_ICONS: Record<string, string> = {
  motorcycle: '🏍️',
  car: '🚗',
  truck: '🚚',
  other: '🚙',
};

export const PartyMembersList: React.FC<PartyMembersListProps> = ({
  members,
  leaderId,
  currentUserId,
}) => {
  if (members.length === 0) {
    return (
      <div className="members-empty">
        <p>No members in party yet</p>
      </div>
    );
  }

  const formatSpeed = (speed?: number) => {
    if (!speed || speed === 0) return '0 km/h';
    return `${Math.round(speed)} km/h`;
  };

  const formatLastSeen = (lastSeenAt: string) => {
    const lastSeen = new Date(lastSeenAt);
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins === 1) return '1 min ago';
    if (diffMins < 60) return `${diffMins} mins ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return '1 hour ago';
    return `${diffHours} hours ago`;
  };

  return (
    <div className="members-list">
      {members.map((member) => (
        <div
          key={member.userId}
          className={`member-card ${member.isOnline ? 'online' : 'offline'}`}
        >
          <div className="member-avatar">
            <span className="vehicle-icon">
              {VEHICLE_ICONS[member.vehicleType] || VEHICLE_ICONS.other}
            </span>
            <span className={`status-indicator ${member.isOnline ? 'online' : 'offline'}`} />
          </div>

          <div className="member-info">
            <div className="member-name-row">
              <span className="member-name">
                {member.displayName}
                {member.userId === currentUserId && (
                  <span className="you-badge">You</span>
                )}
                {member.userId === leaderId && (
                  <span className="leader-badge">Leader</span>
                )}
              </span>
            </div>

            <div className="member-details">
              {member.isOnline ? (
                <>
                  {member.location ? (
                    <span className="member-speed">
                      {formatSpeed(member.location.speed)}
                    </span>
                  ) : (
                    <span className="member-status-text">
                      Online
                    </span>
                  )}
                </>
              ) : (
                <span className="member-status-text">
                  {formatLastSeen(member.lastSeenAt)}
                </span>
              )}
            </div>
          </div>

          {member.location && (
            <div className="member-location-indicator">
              <div 
                className="location-arrow"
                style={{
                  transform: `rotate(${member.location.heading}deg)`,
                }}
              >
                ↑
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
