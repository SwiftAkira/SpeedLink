/**
 * Party Types
 * TypeScript interfaces for party-related features
 */

export type VehicleType = 'motorcycle' | 'car' | 'truck' | 'other';

export interface PartyMember {
  userId: number;
  displayName: string;
  vehicleType: VehicleType;
  isOnline: boolean;
  location?: LocationData;
  joinedAt: string;
  lastSeenAt: string;
}

export interface LocationData {
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: string;
}

export interface Party {
  id: number;
  code: string;
  name: string;
  leader_id: number;
  members: PartyMember[];
  created_at: string;
  expires_at: string;
}

export interface CreatePartyRequest {
  name?: string;
}

export interface JoinPartyRequest {
  code: string;
}

export interface LocationUpdatePayload {
  partyId: number;
  location: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    accuracy: number;
  };
}

export interface PartyMessagePayload {
  partyId: number;
  message: string;
}

export interface LocationBroadcast {
  userId: number;
  displayName: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: string;
}

export interface MessageBroadcast {
  messageId: number;
  userId: number;
  displayName: string;
  message: string;
  timestamp: string;
}

export interface PartyError {
  code: string;
  message: string;
  details?: any;
}
