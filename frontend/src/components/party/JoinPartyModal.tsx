/**
 * Join Party Modal
 * Modal component for joining an existing party by code
 */

import React, { useState, useRef, useEffect } from 'react';
import { useParty } from '@/contexts/PartyContext';
import './JoinPartyModal.css';

interface JoinPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const JoinPartyModal: React.FC<JoinPartyModalProps> = ({ isOpen, onClose }) => {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [isJoining, setIsJoining] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const { joinParty, error, clearError } = useParty();

  useEffect(() => {
    if (isOpen && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [isOpen]);

  const handleChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      setCode(pastedData.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const partyCode = code.join('');
    if (partyCode.length !== 6) {
      return;
    }

    setIsJoining(true);

    try {
      await joinParty(partyCode);
      onClose();
      setCode(['', '', '', '', '', '']);
    } catch (err) {
      console.error('Failed to join party:', err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleClose = () => {
    setCode(['', '', '', '', '', '']);
    clearError();
    onClose();
  };

  const isCodeComplete = code.every(digit => digit !== '');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Join Party</h2>
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
            <label>Enter Party Code</label>
            <div className="code-input-group">
              {code.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  disabled={isJoining}
                  className="code-input"
                  aria-label={`Digit ${index + 1}`}
                />
              ))}
            </div>
            <p className="form-hint">
              Enter the 6-digit code shared by the party leader
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
              disabled={isJoining}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isCodeComplete || isJoining}
            >
              {isJoining ? 'Joining...' : 'Join Party'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
