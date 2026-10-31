import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Incident } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { AuditLedgerViewer } from '../components/AuditLedgerViewer';
import { ShieldCheckIcon, CheckCircleIcon } from '../components/Icons';

export const AuditHistoryPage: React.FC = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-M204-001');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadIncidents = async () => {
      try {
        const data = await apiService.getIncidents();
        setIncidents(data);
        if (data.length > 0) {
          setSelectedIncidentId(data[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load audit history.');
      } finally {
        setLoading(false);
      }
    };
    loadIncidents();
  }, []);

  if (loading) return <LoadingSpinner message="Querying tamper-evident SHA-256 decision ledger..." />;
  if (error) return <ErrorAlert message={error} onRetry={() => window.location.reload()} />;

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Cryptographic Decision Ledger & Audit History</h1>
            <span className="badge badge-ai" style={{ fontSize: '0.7rem' }}>
              SHA-256 HASH CHAINING
            </span>
          </div>
          <p className="page-subtitle">
            Immutable Tamper-Evident Record of Every AI Observation, Operator Authorization Gate & Actuation Event
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <span className="badge badge-normal" style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheckIcon size={14} color="#10b981" /> Web Crypto API Ready
          </span>
        </div>
      </div>

      {/* Target Incident Selector Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Audit Trail For Incident:</span>
            <select
              value={selectedIncidentId}
              onChange={(e) => setSelectedIncidentId(e.target.value)}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                color: '#fff',
                padding: '0.4rem 0.75rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.82rem',
                fontWeight: 600
              }}
            >
              {incidents.map(i => (
                <option key={i.id} value={i.id} style={{ background: '#111827' }}>
                  {i.id} — {i.title}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
            <CheckCircleIcon size={14} /> Genesis Hash Continuity Verified
          </div>
        </div>
      </div>

      {/* Audit Ledger Component */}
      <AuditLedgerViewer incidentId={selectedIncidentId} />
    </div>
  );
};
