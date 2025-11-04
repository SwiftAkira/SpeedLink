'use client';

import { useState } from 'react';
import { joinParty } from '@/lib/services/partyService';
import type { Party } from '@/lib/types';

interface JoinPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (party: Party) => void;
}

export default function JoinPartyModal({
  isOpen,
  onClose,
  onSuccess,
}: JoinPartyModalProps) {
  const [partyCode, setPartyCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate code format
    if (!/^\d{6}$/.test(partyCode)) {
      setError('Party code must be 6 digits');
      setLoading(false);
      return;
    }

    const result = await joinParty({ party_code: partyCode });

    if (result.error) {
      setError(result.error);
      setLoading(false);
    } else if (result.data) {
      onSuccess(result.data);
      setPartyCode('');
      setLoading(false);
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPartyCode(value);
    setError(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md">
        <div className="card animate-scale-in">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[var(--foreground)] mb-2">
              Join Party
            </h2>
            <p className="text-sm text-[var(--foreground-secondary)]">
              Enter the 6-digit code shared by your crew
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="partyCode"
                className="block text-sm font-semibold text-[var(--foreground)] mb-2"
              >
                Party Code
              </label>
              <input
                type="text"
                id="partyCode"
                className="input text-center text-3xl font-bold tracking-widest"
                placeholder="000000"
                value={partyCode}
                onChange={handleCodeChange}
                maxLength={6}
                disabled={loading}
                autoFocus
                inputMode="numeric"
                pattern="\d{6}"
              />
              <p className="text-xs text-[var(--foreground-secondary)] mt-2 text-center">
                {partyCode.length}/6 digits
              </p>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-[var(--danger)]/10 border border-[var(--danger)]/20">
                <p className="text-sm text-[var(--danger)]">{error}</p>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 rounded-lg font-semibold transition-all bg-[var(--card-bg)] border border-[var(--border)] text-[var(--foreground)] hover:border-[var(--foreground-secondary)]"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 btn-primary"
                disabled={loading || partyCode.length !== 6}
              >
                {loading ? 'Joining...' : 'Join Party'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-scale-in {
          animation: scale-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}
