/**
 * Create Party Modal
 * Modal component for creating a new party
 */

import React, { useState } from 'react';
import { useParty } from '@/contexts/PartyContext';
import './CreatePartyModal.css';

interface CreatePartyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePartyModal: React.FC<CreatePartyModalProps> = ({ isOpen, onClose }) => {
  const [partyName, setPartyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const { createParty, error, clearError } = useParty();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      await createParty(partyName || undefined);
      onClose();
      setPartyName('');
    } catch (err) {
      console.error('Failed to create party:', err);
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    setPartyName('');
    clearError();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Create Party</h2>
          <button 
            className="modal-close-btn" 
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="party-form">
          <div className="form-group">
            <label htmlFor="partyName">
              Party Name <span className="optional">(optional)</span>
            </label>
            <input
              id="partyName"
              type="text"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="e.g., Weekend Ride"
              maxLength={100}
              disabled={isCreating}
              className="form-input"
            />
            <p className="form-hint">
              Leave blank to auto-generate a name
            </p>
          </div>

          {error && (
            <div className="error-message">
              <span className="error-icon">⚠</span>
              {error.message}
            </div>
          )}

          <div className="modal-actions">
            <button
              type="button"
              onClick={handleClose}
              className="btn btn-secondary"
              disabled={isCreating}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
