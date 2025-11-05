// SpeedLink Party Service
// Functions for party creation, joining, leaving, and management

import { createClient } from '@/lib/supabase/client';
import type {
  Party,
  PartyMember,
  PartyWithMembers,
  PartyMemberWithLocation,
  LocationUpdate,
  CreatePartyInput,
  JoinPartyInput,
  UpdateLocationInput,
  ApiResponse,
  PartyResponse,
} from '@/lib/types';

// =============================================
// Party Management
// =============================================

/**
 * Create a new party with a unique 6-digit code
 */
export async function createParty(
  input: CreatePartyInput
): Promise<ApiResponse<PartyResponse>> {
  const supabase = createClient();

  try {
    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Ensure user profile exists before creating party
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Try to create profile if it doesn't exist
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        });

      if (createProfileError) {
        return { data: null, error: 'User profile not found. Please try logging out and back in.' };
      }
    }

    // Generate unique party code with client-side generation and verification
    let party: Party | null = null;
    let party_code: string = '';
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts && !party) {
      attempts++;

      // Generate a random 6-digit code
      party_code = Math.floor(100000 + Math.random() * 900000).toString();

      // Check if code already exists
      const { data: existingParty } = await supabase
        .from('parties')
        .select('id')
        .eq('party_code', party_code)
        .maybeSingle();

      if (existingParty) {
        console.log(`Party code ${party_code} already exists, trying again...`);
        continue; // Try another code
      }

      // Create party
      const { data: partyData, error: partyError } = await supabase
        .from('parties')
        .insert({
          party_code,
          name: input.name || null,
          created_by: user.id,
          is_active: true,
        })
        .select()
        .single();

      if (partyError) {
        console.error(`Party creation attempt ${attempts} failed:`, {
          code: partyError.code,
          message: partyError.message,
          details: partyError.details,
          hint: partyError.hint,
        });
        
        // If it's a unique constraint violation (409), retry with a new code
        if (partyError.code === '23505' || partyError.message?.includes('duplicate') || partyError.message?.includes('unique')) {
          if (attempts >= maxAttempts) {
            return { data: null, error: 'Failed to create unique party code. Please try again.' };
          }
          continue;
        }
        // For other errors, fail immediately
        return { data: null, error: partyError.message || 'Failed to create party' };
      }

      party = partyData as Party;
    }

    if (!party) {
      return { data: null, error: 'Failed to create party after multiple attempts' };
    }

    // Automatically add creator as first member
    const { error: memberError } = await supabase.from('party_members').insert({
      party_id: party.id,
      user_id: user.id,
      is_online: true,
    });

    if (memberError) {
      // Rollback: delete party if member insert fails
      await supabase.from('parties').delete().eq('id', party.id);
      return { data: null, error: 'Failed to add creator to party' };
    }

    return {
      data: {
        party: party as Party,
        party_code,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error creating party:', error);
    return { 
      data: null, 
      error: error instanceof Error ? error.message : 'An unexpected error occurred' 
    };
  }
}

/**
 * Join an existing party using a 6-digit code
 */
export async function joinParty(
  input: JoinPartyInput
): Promise<ApiResponse<Party>> {
  const supabase = createClient();

  try {
    // Validate code format
    if (!/^\d{6}$/.test(input.party_code)) {
      return { data: null, error: 'Invalid party code format. Must be 6 digits.' };
    }

    // Get current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Ensure user profile exists before joining party
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      // Try to create profile if it doesn't exist
      const { error: createProfileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          email: user.email,
          display_name: user.user_metadata?.display_name || user.email?.split('@')[0] || 'User',
        });

      if (createProfileError) {
        return { data: null, error: 'User profile not found. Please try logging out and back in.' };
      }
    }

    // Find party by code
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('party_code', input.party_code)
      .eq('is_active', true)
      .single();

    if (partyError || !party) {
      return { data: null, error: 'Party not found or inactive' };
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('party_members')
      .select('id')
      .eq('party_id', party.id)
      .eq('user_id', user.id)
      .single();

    if (existingMember) {
      return { data: party as Party, error: null }; // Already a member, return success
    }

    // Add user to party
    const { error: memberError } = await supabase.from('party_members').insert({
      party_id: party.id,
      user_id: user.id,
      is_online: true,
    });

    if (memberError) {
      return { data: null, error: 'Failed to join party' };
    }

    return { data: party as Party, error: null };
  } catch (error) {
    console.error('Error joining party:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Leave a party
 */
export async function leaveParty(partyId: string): Promise<ApiResponse<void>> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Remove user from party members
    const { error: deleteError } = await supabase
      .from('party_members')
      .delete()
      .eq('party_id', partyId)
      .eq('user_id', user.id);

    if (deleteError) {
      return { data: null, error: 'Failed to leave party' };
    }

    // Check if party is now empty (no members left)
    const { data: remainingMembers, error: countError } = await supabase
      .from('party_members')
      .select('id', { count: 'exact', head: true })
      .eq('party_id', partyId);

    if (!countError && remainingMembers === null) {
      // Party is empty, deactivate it
      await supabase
        .from('parties')
        .update({ is_active: false })
        .eq('id', partyId);
    }

    return { data: null, error: null };
  } catch (error) {
    console.error('Error leaving party:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Get current user's active party
 */
export async function getCurrentParty(): Promise<ApiResponse<PartyWithMembers>> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    // Get user's party membership with better error handling
    const { data: membership, error: memberError } = await supabase
      .from('party_members')
      .select('party_id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle(); // Use maybeSingle() instead of single() to handle no results gracefully

    if (memberError) {
      console.error('Error fetching party membership:', memberError);
      return { data: null, error: memberError.message };
    }

    if (!membership) {
      return { data: null, error: null }; // Not in a party
    }

    // Get party details with members
    const { data: party, error: partyError } = await supabase
      .from('parties')
      .select('*')
      .eq('id', membership.party_id)
      .eq('is_active', true)
      .single();

    if (partyError || !party) {
      return { data: null, error: 'Party not found' };
    }

    // Get party members with profiles
    const { data: members, error: membersError } = await supabase
      .from('party_members')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('party_id', party.id);

    if (membersError) {
      return { data: null, error: 'Failed to load party members' };
    }

    return {
      data: {
        ...(party as Party),
        members: members as PartyMember[],
        member_count: members?.length || 0,
      },
      error: null,
    };
  } catch (error) {
    console.error('Error getting current party:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

/**
 * Get party members with their latest locations
 */
export async function getPartyMembersWithLocations(
  partyId: string
): Promise<ApiResponse<PartyMemberWithLocation[]>> {
  const supabase = createClient();

  try {
    // Get party members
    const { data: members, error: membersError } = await supabase
      .from('party_members')
      .select(`
        *,
        profile:profiles(*)
      `)
      .eq('party_id', partyId);

    if (membersError) {
      return { data: null, error: 'Failed to load party members' };
    }

    if (!members || members.length === 0) {
      return { data: [], error: null };
    }

    // Get latest location for each member
    const memberIds = members.map((m) => m.user_id);
    const { data: locations, error: locationsError } = await supabase
      .from('location_updates')
      .select('*')
      .eq('party_id', partyId)
      .in('user_id', memberIds)
      .order('created_at', { ascending: false });

    if (locationsError) {
      return { data: null, error: 'Failed to load locations' };
    }

    // Map latest location to each member
    const membersWithLocations: PartyMemberWithLocation[] = members.map(
      (member) => {
        const latestLocation = locations?.find(
          (loc) => loc.user_id === member.user_id
        );
        return {
          ...member,
          latest_location: latestLocation as LocationUpdate | undefined,
        };
      }
    );

    return { data: membersWithLocations, error: null };
  } catch (error) {
    console.error('Error getting party members with locations:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// =============================================
// Location Updates
// =============================================

/**
 * Update user's current location in their active party
 */
export async function updateLocation(
  partyId: string,
  input: UpdateLocationInput
): Promise<ApiResponse<LocationUpdate>> {
  const supabase = createClient();

  try {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return { data: null, error: 'User not authenticated' };
    }

    const { data: location, error: locationError } = await supabase
      .from('location_updates')
      .insert({
        user_id: user.id,
        party_id: partyId,
        latitude: input.latitude,
        longitude: input.longitude,
        speed: input.speed || 0,
        heading: input.heading || 0,
        accuracy: input.accuracy || null,
      })
      .select()
      .single();

    if (locationError || !location) {
      return { data: null, error: 'Failed to update location' };
    }

    return { data: location as LocationUpdate, error: null };
  } catch (error) {
    console.error('Error updating location:', error);
    return { data: null, error: 'An unexpected error occurred' };
  }
}

// =============================================
// Real-time Subscriptions
// =============================================

/**
 * Subscribe to party member updates (join/leave/online status)
 * Returns a Supabase channel that can be unsubscribed with channel.unsubscribe()
 */
export function subscribeToPartyMembers(
  partyId: string,
  callback: (payload: unknown) => void
) {
  const supabase = createClient();
  return supabase
    .channel(`party_members:${partyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'party_members',
        filter: `party_id=eq.${partyId}`,
      },
      callback
    )
    .subscribe();
}

/**
 * Subscribe to location updates for a party
 * Returns a Supabase channel that can be unsubscribed with channel.unsubscribe()
 */
export function subscribeToLocationUpdates(
  partyId: string,
  callback: (payload: unknown) => void
) {
  const supabase = createClient();
  return supabase
    .channel(`location_updates:${partyId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'location_updates',
        filter: `party_id=eq.${partyId}`,
      },
      callback
    )
    .subscribe();
}
