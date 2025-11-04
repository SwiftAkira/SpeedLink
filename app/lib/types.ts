// SpeedLink TypeScript Types

// =============================================
// Profile Types
// =============================================
export interface Profile {
  id: string;
  email: string | null;
  display_name: string | null;
  avatar_url: string | null;
  location_sharing_enabled: boolean;
  visible_to_party: boolean;
  ghost_mode: boolean;
  created_at: string;
  updated_at: string;
}

// =============================================
// Party Types (Epic 3)
// =============================================
export interface Party {
  id: string;
  party_code: string;
  name: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PartyMember {
  id: string;
  party_id: string;
  user_id: string;
  joined_at: string;
  last_seen_at: string;
  is_online: boolean;
  // Joined profile data
  profile?: Profile;
}

export interface LocationUpdate {
  id: string;
  user_id: string;
  party_id: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number | null;
  created_at: string;
}

// =============================================
// Extended Types with Relations
// =============================================
export interface PartyWithMembers extends Party {
  members: PartyMember[];
  member_count?: number;
}

export interface PartyMemberWithLocation extends PartyMember {
  latest_location?: LocationUpdate;
  distance?: number; // Distance from current user in meters
}

// =============================================
// Form Types
// =============================================
export interface CreatePartyInput {
  name?: string;
}

export interface JoinPartyInput {
  party_code: string;
}

export interface UpdateLocationInput {
  latitude: number;
  longitude: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
}

// =============================================
// Response Types
// =============================================
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PartyResponse {
  party: Party;
  party_code: string;
}
