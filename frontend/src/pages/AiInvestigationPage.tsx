import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Incident, InvestigationResult } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { AgentStepper } from '../components/AgentStepper';
import { ZapIcon } from '../components/Icons';

interface AiInvestigationPageProps {
  onNavigateToIncident: (incidentId: string) => void;
}

export const AiInvestigationPage: React.FC<AiInvestigationPageProps> = ({
  onNavigateToIncident
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string>('INC-M204-001');
  const [investigationResult, setInvestigationResult] = useState<InvestigationResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isInvestigating, setIsInvestigating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (incidentId = selectedIncidentId, showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const incs = await apiService.getIncidents();
      setIncidents(incs);

      const targetId = incidentId || (incs.length > 0 ? incs[0].id : 'INC-M204-001');
      setSelectedIncidentId(targetId);

      try {
        const inv = await apiService.getInvestigation(targetId);
        setInvestigationResult(inv);
      } catch {
        setInvestigationResult(null);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load AI investigation console.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedIncidentId, true);
  }, [selectedIncidentId]);

  const handleRunInvestigation = async () => {
    setIsInvestigating(true);
    setError(null);
    try {
      const res = await apiService.triggerInvestigation(selectedIncidentId);
      setInvestigationResult(res);
    } catch (err: any) {
      setError(err.message || 'Failed to execute multi-agent pipeline.');
    } finally {
      setIsInvestigating(false);
    }
  };

  if (loading && !investigationResult) return <LoadingSpinner message="Querying multi-agent reasoning traces..." />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadData(selectedIncidentId, true)} />;

  const activeInc = incidents.find(i => i.id === selectedIncidentId);

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">AI Investigation & Diagnostic Reasoning</h1>
            <span className="badge badge-ai" style={{ fontSize: '0.7rem' }}>
              4-STAGE MULTI-AGENT ENGINE
            </span>
          </div>
          <p className="page-subtitle">
            Autonomous Telemetry Correlation, Equipment Lifespan Cross-Validation, and Explainable Evidence Synthesis
          </p>
        </div>
        <div>
          <button
            className="btn btn-primary"
            onClick={handleRunInvestigation}
            disabled={isInvestigating}
            style={{
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              borderColor: '#06b6d4',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)',
              fontSize: '0.8rem',
              padding: '0.45rem 0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <ZapIcon size={14} />
            {isInvestigating ? 'Executing Reasoning...' : 'Run Investigation Pipeline'}
          </button>
        </div>
      </div>

      {/* Target Incident Selector Bar */}
      <div className="card" style={{ marginBottom: '1.25rem', padding: '0.85rem 1.15rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Target Incident:</span>
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
                  {i.id} — {i.title} ({i.severity})
                </option>
              ))}
            </select>
          </div>

          {activeInc && (
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span className={`badge badge-${activeInc.severity.toLowerCase()}`}>{activeInc.severity}</span>
              <span className="badge badge-normal">{activeInc.status.replace('_', ' ')}</span>
              <button
                className="btn btn-outline"
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                onClick={() => onNavigateToIncident(activeInc.id)}
              >
                Open Full Incident Ticket
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 4-Stage Architecture Overview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.25rem' }}>
        {/* Agent 1 */}
        <div className="card" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-cyan)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Agent 1: Sensor Signal Correlator
          </div>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.86rem', marginBottom: '0.35rem' }}>
            Rolling Z-Score Anomaly Classifier
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
            Ingests time-series sensor telemetry and evaluates standard deviations against normal baseline. Flagged breach at Z = +3.83.
          </p>
        </div>

        {/* Agent 2 */}
        <div className="card" style={{ padding: '1rem', borderLeft: '3px solid var(--accent-blue)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Agent 2: Root Cause Analyzer
          </div>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.86rem', marginBottom: '0.35rem' }}>
            Maintenance Log Cross-Referencer
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
            Matches vibration harmonics with Work Order MNT-882. Identifies bearing rated lifetime exceeded by 60 days.
          </p>
        </div>

        {/* Agent 3 */}
        <div className="card" style={{ padding: '1rem', borderLeft: '3px solid #f59e0b' }}>
          <div style={{ fontSize: '0.72rem', color: '#f59e0b', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Agent 3: Production Impact Modeler
          </div>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.86rem', marginBottom: '0.35rem' }}>
            INR Financial Loss Simulator
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
            Projects 3.0h downtime across 360 automotive components @ ₹850/unit = ₹3,06,000 estimated production value affected.
          </p>
        </div>

        {/* Agent 4 */}
        <div className="card" style={{ padding: '1rem', borderLeft: '3px solid #10b981' }}>
          <div style={{ fontSize: '0.72rem', color: '#10b981', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.2rem' }}>
            Agent 4: SOP Containment Engine
          </div>
          <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.86rem', marginBottom: '0.35rem' }}>
            Procedure Vector Retrieval
          </div>
          <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0 }}>
            Retrieves SOP-M204-BEARING, formulates load throttling and auxiliary lubrication flush sequence.
          </p>
        </div>
      </div>

      {/* Main Dynamic Execution Trace */}
      <AgentStepper
        isInvestigating={isInvestigating}
        investigationResult={investigationResult}
        onRunPipeline={handleRunInvestigation}
      />
    </div>
  );
};
