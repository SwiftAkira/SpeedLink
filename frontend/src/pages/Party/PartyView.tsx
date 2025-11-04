/**
 * Party View Page
 * Main party interface showing party code, members, and controls
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useParty } from '@/contexts/PartyContext';
import { useAuth } from '@/contexts/AuthContext';
import { CreatePartyModal } from '@/components/party/CreatePartyModal';
import { JoinPartyModal } from '@/components/party/JoinPartyModal';
import { PartyMembersList } from '@/components/party/PartyMembersList';
import './PartyView.css';

export const PartyView: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentParty, 
    isInParty, 
    isConnected, 
    leaveParty,
    isLoading
  } = useParty();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  useEffect(() => {
    // Redirect to map if in party
    if (isInParty && currentParty) {
      // Could auto-navigate to map or stay here
      console.log('In party:', currentParty.code);
    }
  }, [isInParty, currentParty]);

  const handleCopyCode = async () => {
    if (!currentParty) return;

    try {
      await navigator.clipboard.writeText(currentParty.code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleLeaveParty = async () => {
    await leaveParty();
    setShowLeaveConfirm(false);
  };

  // No party - show create/join options
  if (!isInParty) {
    return (
      <div className="party-view">
        <div className="party-container">
          <div className="party-header">
            <h1>Party Mode</h1>
            <p className="party-subtitle">
              Create or join a party to share your location with friends
            </p>
          </div>

          <div className="party-actions-grid">
            <button
              className="action-card create-action"
              onClick={() => setShowCreateModal(true)}
              disabled={isLoading}
            >
              <span className="action-icon">➕</span>
              <h3>Create Party</h3>
              <p>Start a new party and invite friends</p>
            </button>

            <button
              className="action-card join-action"
              onClick={() => setShowJoinModal(true)}
              disabled={isLoading}
            >
              <span className="action-icon">🔗</span>
              <h3>Join Party</h3>
              <p>Enter a party code to join</p>
            </button>
          </div>

          <div className="connection-status">
            <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
            <span className="status-text">
              {isConnected ? 'Connected' : 'Connecting...'}
            </span>
          </div>
        </div>

        <CreatePartyModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
        
        <JoinPartyModal
          isOpen={showJoinModal}
          onClose={() => setShowJoinModal(false)}
        />
      </div>
    );
  }

  // In party - show party details
  return (
    <div className="party-view">
      <div className="party-container">
        <div className="party-header">
          <h1>{currentParty?.name || 'Party'}</h1>
          <button
            className="btn-leave"
            onClick={() => setShowLeaveConfirm(true)}
          >
            Leave Party
          </button>
        </div>

        <div className="party-code-card">
          <div className="code-label">Party Code</div>
          <div className="code-display">{currentParty?.code}</div>
          <button
            className="btn-copy"
            onClick={handleCopyCode}
          >
            {codeCopied ? '✓ Copied!' : 'Copy Code'}
          </button>
        </div>

        <div className="party-members-section">
          <div className="section-header">
            <h2>Members</h2>
            <span className="member-count">
              {currentParty?.members.length || 0} / 20
            </span>
          </div>

          <PartyMembersList
            members={currentParty?.members || []}
            leaderId={currentParty?.leader_id || 0}
            currentUserId={user?.id}
          />
        </div>

        <div className="party-footer">
          <button
            className="btn-map"
            onClick={() => navigate('/map')}
          >
            View on Map
          </button>
        </div>

        <div className="connection-status">
          <span className={`status-dot ${isConnected ? 'connected' : 'disconnected'}`} />
          <span className="status-text">
            {isConnected ? 'Connected' : 'Reconnecting...'}
          </span>
        </div>
      </div>

      {/* Leave Confirmation Dialog */}
      {showLeaveConfirm && (
        <div className="modal-overlay" onClick={() => setShowLeaveConfirm(false)}>
          <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Leave Party?</h3>
            <p>Are you sure you want to leave this party?</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowLeaveConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleLeaveParty}
              >
                Leave Party
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
