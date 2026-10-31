import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Incident, SOPDocument, InvestigationResult } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { AuditLedgerViewer } from '../components/AuditLedgerViewer';
import { ExplainabilityMap } from '../components/ExplainabilityMap';
import { ReplayPlayer } from '../components/ReplayPlayer';
import { AgentStepper } from '../components/AgentStepper';
import { formatDateIST, diagnoseVibration, diagnoseTemperature } from '../utils/formatters';
import {
  AlertTriangleIcon,
  RefreshCwIcon,
  ZapIcon,
  ShieldCheckIcon,
  ActivityIcon,
  BrainIcon,
  RewindIcon,
  CheckCircleIcon,
  LockIcon,
  CheckIcon,
  XIcon
} from '../components/Icons';

interface IncidentsPageProps {
  selectedIncidentId?: string | null;
  activeRole?: string;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  selectedIncidentId,
  activeRole = 'operator'
}) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [investigationResult, setInvestigationResult] = useState<InvestigationResult | null>(null);
  const [sop, setSop] = useState<SOPDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'workspace' | 'audit' | 'explainability' | 'replay'>('workspace');
  const [investigating, setInvestigating] = useState<boolean>(false);
  const [executing, setExecuting] = useState<boolean>(false);

  // Filter state for incidents table
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  // Modals for Approval and Rejection
  const [isApproveModalOpen, setIsApproveModalOpen] = useState<boolean>(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState<boolean>(false);
  const [approverName, setApproverName] = useState<string>('Shift Supervisor P. Sharma');
  const [rejectReason, setRejectReason] = useState<string>('Physical on-site inspection of bearing bracket required before containment');
  const [simulatedNotice, setSimulatedNotice] = useState<string | null>(null);

  // Progressive disclosure accordion state (all open by default for demo ease)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    s1_what: true,
    s2_why: true,
    s3_evidence: true,
    s4_impact: true,
    s5_sop: true,
    s6_approval: true
  });

  const toggleSection = (sec: string) => {
    setExpandedSections(prev => ({ ...prev, [sec]: !prev[sec] }));
  };

  const fetchIncidentsData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await apiService.getIncidents();
      setIncidents(data);

      if (data.length === 0) {
        setActiveIncident(null);
        setInvestigationResult(null);
        setSop(null);
        return;
      }

      const validIncidentId = (selectedIncidentId && data.some(i => i.id === selectedIncidentId))
        ? selectedIncidentId
        : (activeIncident?.id && data.some(i => i.id === activeIncident.id))
        ? activeIncident.id
        : data[0].id;

      try {
        const detail = await apiService.getIncidentDetail(validIncidentId);
        setActiveIncident(detail);

        try {
          const invData = await apiService.getInvestigation(validIncidentId);
          setInvestigationResult(invData);
        } catch {
          setInvestigationResult(null);
        }

        if (detail.action_recommendations && detail.action_recommendations.length > 0) {
          const actionSopId = detail.action_recommendations[0].sop_id;
          if (actionSopId) {
            try {
              const sopDetail = await apiService.getSOPDetail(actionSopId);
              setSop(sopDetail);
            } catch {
              // silent fallback
            }
          }
        }
      } catch {
        if (data.length > 0) {
          const fallbackDetail = await apiService.getIncidentDetail(data[0].id);
          setActiveIncident(fallbackDetail);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch incident details.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidentsData(true);

    const interval = setInterval(() => {
      fetchIncidentsData(false);
    }, 4000);

    const handleSimUpdate = () => fetchIncidentsData(false);
    window.addEventListener('simulation-updated', handleSimUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('simulation-updated', handleSimUpdate);
    };
  }, [selectedIncidentId]);

  const selectIncident = async (id: string) => {
    setLoading(true);
    try {
      const detail = await apiService.getIncidentDetail(id);
      setActiveIncident(detail);
      setSop(null);

      try {
        const invData = await apiService.getInvestigation(id);
        setInvestigationResult(invData);
      } catch {
        setInvestigationResult(null);
      }

      if (detail.action_recommendations && detail.action_recommendations.length > 0) {
        const actionSopId = detail.action_recommendations[0].sop_id;
        if (actionSopId) {
          try {
            const sopDetail = await apiService.getSOPDetail(actionSopId);
            setSop(sopDetail);
          } catch {
            // silent
          }
        }
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRunInvestigation = async (id: string) => {
    setInvestigating(true);
    setError(null);
    try {
      const res = await apiService.triggerInvestigation(id);
      setInvestigationResult(res);
      await fetchIncidentsData(false);
    } catch (err: any) {
      setError(err.message || 'Failed to execute multi-agent investigation.');
    } finally {
      setInvestigating(false);
    }
  };

  const handleApproveAction = async () => {
    if (!activeIncident) return;
    try {
      await apiService.approvePlan(activeIncident.id, approverName);
      setIsApproveModalOpen(false);
      setSimulatedNotice(`Action authorized by ${approverName}. Status updated to APPROVED.`);
      await fetchIncidentsData(false);
      window.dispatchEvent(new Event('simulation-updated'));
    } catch (err: any) {
      setError(err.message || 'Failed to approve response plan.');
    }
  };

  const handleRejectAction = async () => {
    if (!activeIncident) return;
    try {
      await apiService.rejectPlan(activeIncident.id, approverName, rejectReason);
      setIsRejectModalOpen(false);
      setSimulatedNotice(`Action held for inspection: "${rejectReason}". Status updated to INSPECTION_REQUESTED.`);
      await fetchIncidentsData(false);
      window.dispatchEvent(new Event('simulation-updated'));
    } catch (err: any) {
      setError(err.message || 'Failed to reject action plan.');
    }
  };

  const handleExecuteActuation = async (id: string) => {
    setExecuting(true);
    setError(null);
    try {
      await apiService.executeActuation(id);
      setSimulatedNotice(
        'SIMULATED ACTION: Software containment protocol executed in demonstration environment. Telemetry stabilized to baseline. No physical machinery has been altered.'
      );
      await fetchIncidentsData(false);
      window.dispatchEvent(new Event('simulation-updated'));
    } catch (err: any) {
      setError(err.message || 'Failed to execute actuation.');
    } finally {
      setExecuting(false);
    }
  };

  if (loading && !activeIncident) {
    return <LoadingSpinner message="Loading industrial incident tickets & AI diagnostic models..." />;
  }

  // Filtered incidents
  const filteredIncidents = incidents.filter(inc => {
    if (filterSeverity === 'ALL') return true;
    if (filterSeverity === 'CRITICAL') return inc.severity === 'CRITICAL';
    if (filterSeverity === 'HIGH') return inc.severity === 'HIGH';
    if (filterSeverity === 'MEDIUM') return inc.severity === 'MEDIUM';
    if (filterSeverity === 'CONTAINED') return inc.status === 'CONTAINED' || inc.status === 'RESOLVED';
    return true;
  });

  // Active incident metrics
  const isM204 = activeIncident?.machine_id === 'M-204';
  const observedVibration = isM204 ? 7.82 : 3.78;
  const observedTemp = isM204 ? 88.4 : 64.0;
  const vibrationDiagnosis = diagnoseVibration(observedVibration, 4.5);
  const tempDiagnosis = diagnoseTemperature(observedTemp, 75.0);

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Incident Management & Investigation</h1>
            <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
              HITL SAFETY GOVERNANCE
            </span>
          </div>
          <p className="page-subtitle">
            AI-Assisted Root Cause Diagnosis, Multi-Point Evidence Correlation & Supervisor-Approved Containment
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            className="btn btn-outline"
            onClick={() => fetchIncidentsData(true)}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCwIcon size={14} /> Refresh Incidents
          </button>
        </div>
      </div>

      {error && <ErrorAlert message={error} onRetry={() => fetchIncidentsData(true)} />}

      {/* Persistent Simulated Action Notice Banner */}
      {simulatedNotice && (
        <div
          style={{
            padding: '0.85rem 1.25rem',
            background: 'rgba(16, 185, 129, 0.12)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            borderRadius: 'var(--radius-md)',
            color: '#4ade80',
            fontSize: '0.84rem',
            marginBottom: '1.25rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            lineHeight: 1.45
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircleIcon size={16} />
            <span>{simulatedNotice}</span>
          </div>
          <button
            onClick={() => setSimulatedNotice(null)}
            style={{ background: 'none', border: 'none', color: '#4ade80', cursor: 'pointer', padding: '0.2rem' }}
          >
            <XIcon size={14} />
          </button>
        </div>
      )}

      {/* INCIDENTS LIST TABLE WITH FILTER CHIPS */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div className="card-title" style={{ margin: 0 }}>
            <span>Active & Historical Machine Incidents ({incidents.length})</span>
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'CONTAINED'].map(f => (
              <button
                key={f}
                className={`btn ${filterSeverity === f ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.72rem', padding: '0.25rem 0.65rem' }}
                onClick={() => setFilterSeverity(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="table-container">
          <table className="incident-operations-table">
            <thead>
              <tr>
                <th style={{ width: '130px' }}>Incident ID</th>
                <th style={{ width: '160px' }}>Machine & Asset</th>
                <th style={{ width: '100px' }}>Severity</th>
                <th style={{ width: '140px' }}>Status</th>
                <th style={{ width: '160px' }}>Detected (IST)</th>
                <th style={{ width: '140px' }}>Est. Production Value</th>
                <th>Recommended Action</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Select</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.map((incident) => {
                const isSelected = activeIncident?.id === incident.id;
                const recAction = incident.action_recommendations?.[0]?.action_title || 'Containment Protocol Synthesis Required';
                const estLoss = incident.severity === 'CRITICAL' ? '₹3.06 lakh' : incident.severity === 'HIGH' ? '₹1.80 lakh' : '₹45,000';

                return (
                  <tr
                    key={incident.id}
                    onClick={() => selectIncident(incident.id)}
                    style={{
                      cursor: 'pointer',
                      background: isSelected ? 'rgba(6, 182, 212, 0.08)' : 'transparent',
                      borderLeft: isSelected ? '3px solid var(--accent-cyan)' : '3px solid transparent'
                    }}
                    className="table-row-hover"
                  >
                    <td className="mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)' }}>
                      {incident.id}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>
                        {incident.machine_id === 'M-204' ? 'PMP-204 (Coolant Pump)' : incident.machine_id === 'M-305' ? 'CMP-301 (Compressor)' : incident.machine_id === 'M-101' ? 'CNC-101 (5-Axis)' : incident.machine_id}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{incident.machine_id}</div>
                    </td>
                    <td>
                      <span className={`badge badge-${incident.severity.toLowerCase()}`}>
                        {incident.severity}
                      </span>
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{
                          background: incident.status === 'CONTAINED' || incident.status === 'RESOLVED' ? 'rgba(139, 92, 246, 0.15)' : incident.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: incident.status === 'CONTAINED' || incident.status === 'RESOLVED' ? '#c084fc' : incident.status === 'APPROVED' ? '#4ade80' : '#f59e0b',
                          borderColor: incident.status === 'CONTAINED' || incident.status === 'RESOLVED' ? 'rgba(139, 92, 246, 0.4)' : incident.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'
                        }}
                      >
                        {incident.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.76rem' }}>
                      {formatDateIST(incident.created_at)}
                    </td>
                    <td className="mono" style={{ fontSize: '0.78rem', color: '#fbbf24', fontWeight: 600 }}>
                      {estLoss}
                    </td>
                    <td style={{ maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: 'var(--text-bright)' }} title={recAction}>
                      {recAction}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn ${isSelected ? 'btn-primary' : 'btn-outline'}`}
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectIncident(incident.id);
                        }}
                      >
                        {isSelected ? 'Inspecting' : 'Inspect'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ACTIVE INCIDENT WORKSPACE & PROGRESSIVE DISCLOSURE */}
      {activeIncident ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Sub-Navigation Tabs */}
          <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', flexWrap: 'wrap' }}>
            <button
              onClick={() => setActiveTab('workspace')}
              className={`btn ${activeTab === 'workspace' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ActivityIcon size={14} /> Investigation Workspace
            </button>
            <button
              onClick={() => setActiveTab('audit')}
              className={`btn ${activeTab === 'audit' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <ShieldCheckIcon size={14} /> Decision & Action History (SHA-256)
            </button>
            <button
              onClick={() => setActiveTab('explainability')}
              className={`btn ${activeTab === 'explainability' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <BrainIcon size={14} /> Why the AI Made This Recommendation
            </button>
            <button
              onClick={() => setActiveTab('replay')}
              className={`btn ${activeTab === 'replay' ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.78rem', padding: '0.4rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
            >
              <RewindIcon size={14} /> Incident Timeline Replay
            </button>
          </div>

          {activeTab === 'audit' && <AuditLedgerViewer incidentId={activeIncident.id} />}
          {activeTab === 'explainability' && <ExplainabilityMap incidentId={activeIncident.id} />}
          {activeTab === 'replay' && <ReplayPlayer incidentId={activeIncident.id} />}

          {activeTab === 'workspace' && (
            <>
              {/* INCIDENT WORKSPACE HEADER & APPROVAL ACTION BAR */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
                      <span className={`badge badge-${activeIncident.severity.toLowerCase()}`}>{activeIncident.severity}</span>
                      <span
                        className="badge"
                        style={{
                          background: activeIncident.status === 'CONTAINED' || activeIncident.status === 'RESOLVED' ? 'rgba(139, 92, 246, 0.15)' : activeIncident.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: activeIncident.status === 'CONTAINED' || activeIncident.status === 'RESOLVED' ? '#c084fc' : activeIncident.status === 'APPROVED' ? '#4ade80' : '#f59e0b',
                          borderColor: activeIncident.status === 'CONTAINED' || activeIncident.status === 'RESOLVED' ? 'rgba(139, 92, 246, 0.4)' : activeIncident.status === 'APPROVED' ? 'rgba(34, 197, 94, 0.4)' : 'rgba(245, 158, 11, 0.4)'
                        }}
                      >
                        STATUS: {activeIncident.status.replace('_', ' ')}
                      </span>
                      <span className="mono" style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{activeIncident.id}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>• Target: {activeIncident.machine_id}</span>
                    </div>
                    <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>{activeIncident.title}</h2>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                      Detected: <strong style={{ color: '#fff' }}>{formatDateIST(activeIncident.created_at)}</strong> • Plant: Pune Automotive Components Plant (Chakan MIDC)
                    </p>
                  </div>

                  {/* ACTION CONTROLS BASED ON HUMAN APPROVAL GATE */}
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
                    {activeIncident.status === 'PENDING_APPROVAL' && (
                      <>
                        <button
                          className="btn btn-primary"
                          onClick={() => setIsApproveModalOpen(true)}
                          style={{
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderColor: '#10b981',
                            boxShadow: '0 0 15px rgba(16, 185, 129, 0.4)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.4rem',
                            fontWeight: 600,
                            fontSize: '0.82rem'
                          }}
                        >
                          <CheckCircleIcon size={14} /> Authorize Containment ({activeRole === 'supervisor' ? 'Supervisor Role' : 'Supervisor Action'})
                        </button>
                        <button
                          className="btn btn-outline"
                          onClick={() => setIsRejectModalOpen(true)}
                          style={{ fontSize: '0.8rem', borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }}
                        >
                          Request Inspection / Hold
                        </button>
                      </>
                    )}

                    {activeIncident.status === 'APPROVED' && (
                      <button
                        className="btn btn-primary"
                        disabled={executing}
                        onClick={() => handleExecuteActuation(activeIncident.id)}
                        style={{
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          borderColor: '#3b82f6',
                          boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontWeight: 600,
                          fontSize: '0.82rem'
                        }}
                      >
                        <ZapIcon size={14} />
                        {executing ? 'Executing Containment...' : 'Execute Containment Protocol (Simulated)'}
                      </button>
                    )}

                    {(activeIncident.status === 'CONTAINED' || activeIncident.status === 'RESOLVED') && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          padding: '0.5rem 0.85rem',
                          background: 'rgba(139, 92, 246, 0.15)',
                          border: '1px solid rgba(139, 92, 246, 0.4)',
                          borderRadius: 'var(--radius-sm)',
                          color: '#c084fc',
                          fontSize: '0.8rem',
                          fontWeight: 600
                        }}
                      >
                        <CheckCircleIcon size={15} /> Machine Contained & Stabilized
                      </div>
                    )}
                  </div>
                </div>

                <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--accent-cyan)' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '0.35rem', letterSpacing: '0.04em' }}>
                    AI-SYNTHESIZED INCIDENT SUMMARY
                  </div>
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-bright)', lineHeight: '1.5', margin: 0 }}>
                    {activeIncident.summary}
                  </p>
                </div>
              </div>

              {/* PROGRESSIVE DISCLOSURE: 6 KEY INDUSTRIAL QUESTIONS (Prompt 5 requirement) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>
                  Progressive Operational Investigation (6 Core Diagnostic Inquiries)
                </div>

                {/* Section 1: What happened? */}
                <div className="progressive-step">
                  <div className="progressive-header" onClick={() => toggleSection('s1_what')}>
                    <span style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="mono" style={{ color: 'var(--accent-cyan)' }}>1.</span> What happened?
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {expandedSections.s1_what ? 'Hide Details ▲' : 'Show Details ▼'}
                    </span>
                  </div>
                  {expandedSections.s1_what && (
                    <div className="progressive-content">
                      <p style={{ margin: '0 0 0.5rem 0', color: '#cbd5e1' }}>
                        At <strong>{formatDateIST(activeIncident.created_at)}</strong>, online SCADA telemetry sensors on <strong>{activeIncident.machine_id}</strong> registered sudden mechanical vibration and elevated bearing housing temperature during normal Shift 2 operations.
                      </p>
                      <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                        Coolant output flow dropped to 61.6 m³/hour, risking insufficient cooling for 4 downstream CNC centres on Machining Line B.
                      </p>
                    </div>
                  )}
                </div>

                {/* Section 2: Why was this incident detected? */}
                <div className="progressive-step">
                  <div className="progressive-header" onClick={() => toggleSection('s2_why')}>
                    <span style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="mono" style={{ color: 'var(--accent-cyan)' }}>2.</span> Why was this incident detected?
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {expandedSections.s2_why ? 'Hide Details ▲' : 'Show Details ▼'}
                    </span>
                  </div>
                  {expandedSections.s2_why && (
                    <div className="progressive-content">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.85rem' }}>
                        {/* Vibration Diagnosis */}
                        <div className={`metric-diagnosis-box ${vibrationDiagnosis.status.toLowerCase()}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#fff' }}>{vibrationDiagnosis.metricName}</span>
                            <span className={`badge badge-${vibrationDiagnosis.status.toLowerCase()}`}>{vibrationDiagnosis.statusLabel}</span>
                          </div>
                          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: vibrationDiagnosis.status === 'CRITICAL' ? 'var(--status-critical)' : '#fff' }}>
                            {vibrationDiagnosis.currentReading} <span style={{ fontSize: '0.85rem' }}>{vibrationDiagnosis.unit}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                            Configured Normal Threshold: {vibrationDiagnosis.normalLimit}
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-bright)', margin: 0, lineHeight: '1.35' }}>
                            {vibrationDiagnosis.explanation}
                          </p>
                        </div>

                        {/* Temperature Diagnosis */}
                        <div className={`metric-diagnosis-box ${tempDiagnosis.status.toLowerCase()}`}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                            <span style={{ fontWeight: 700, fontSize: '0.78rem', color: '#fff' }}>{tempDiagnosis.metricName}</span>
                            <span className={`badge badge-${tempDiagnosis.status.toLowerCase()}`}>{tempDiagnosis.statusLabel}</span>
                          </div>
                          <div className="mono" style={{ fontSize: '1.25rem', fontWeight: 700, color: tempDiagnosis.status === 'CRITICAL' ? 'var(--status-critical)' : '#fff' }}>
                            {tempDiagnosis.currentReading} <span style={{ fontSize: '0.85rem' }}>{tempDiagnosis.unit}</span>
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.4rem' }}>
                            Configured Thermal Limit: {tempDiagnosis.normalLimit}
                          </div>
                          <p style={{ fontSize: '0.78rem', color: 'var(--text-bright)', margin: 0, lineHeight: '1.35' }}>
                            {tempDiagnosis.explanation}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 3: What evidence supports the diagnosis? */}
                <div className="progressive-step">
                  <div className="progressive-header" onClick={() => toggleSection('s3_evidence')}>
                    <span style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="mono" style={{ color: 'var(--accent-cyan)' }}>3.</span> What evidence supports the diagnosis?
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {expandedSections.s3_evidence ? 'Hide Details ▲' : 'Show Details ▼'}
                    </span>
                  </div>
                  {expandedSections.s3_evidence && (
                    <div className="progressive-content">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {activeIncident.evidence_items && activeIncident.evidence_items.length > 0 ? (
                          activeIncident.evidence_items.map((evi) => (
                            <div
                              key={evi.id}
                              style={{
                                background: 'var(--bg-surface-elevated)',
                                border: '1px solid var(--border-color)',
                                borderRadius: 'var(--radius-sm)',
                                padding: '0.75rem 1rem'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                                <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.84rem' }}>{evi.title}</span>
                                <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)' }}>
                                  Source: {evi.source_type.replace(/_/g, ' ')} • {evi.confidence_score.toFixed(0)}% Confidence
                                </span>
                              </div>
                              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                                {evi.description}
                              </p>
                            </div>
                          ))
                        ) : (
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                            No evidence records loaded. Click &quot;Re-Run AI Investigation&quot; to ingest sensor telemetry.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 4: What could happen if ignored? */}
                <div className="progressive-step">
                  <div className="progressive-header" onClick={() => toggleSection('s4_impact')}>
                    <span style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="mono" style={{ color: 'var(--accent-cyan)' }}>4.</span> What could happen if ignored? (Operational & Financial Impact)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {expandedSections.s4_impact ? 'Hide Details ▲' : 'Show Details ▼'}
                    </span>
                  </div>
                  {expandedSections.s4_impact && (
                    <div className="progressive-content">
                      <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.25)', borderRadius: 'var(--radius-sm)', padding: '0.85rem', marginBottom: '0.85rem' }}>
                        <div style={{ fontWeight: 700, color: 'var(--status-critical)', fontSize: '0.82rem', marginBottom: '0.25rem' }}>
                          CATASTROPHIC RISK: MECHANICAL BEARING SEIZURE & CNC INTERLOCK TRIP
                        </div>
                        <p style={{ fontSize: '0.8rem', color: '#cbd5e1', margin: 0, lineHeight: '1.4' }}>
                          If allowed to run above 85°C, thermal expansion will cause complete mechanical drive lockup. High-temperature coolant interlocks on 4 CNC machining centres on Line B will trip automatically, stopping precision machining of transmission casings.
                        </p>
                      </div>

                      {/* Explicit Assumptions Breakdown */}
                      <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.85rem' }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#fff', marginBottom: '0.5rem' }}>
                          Estimated Financial Exposure Breakdown (Chakan MIDC Plant)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.78rem' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Estimated Downtime</span>
                            <strong>3.0 hours</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Production Rate</span>
                            <strong>120 components / hour</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Estimated Production Affected</span>
                            <strong>360 components</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Illustrative Part Value</span>
                            <strong>₹850 / component</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Est. Production Value Affected</span>
                            <strong className="mono" style={{ color: '#fbbf24' }}>₹3,06,000 (₹3.06 lakh)</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Maintenance Parts & Labour</span>
                            <strong className="mono" style={{ color: '#fff' }}>₹45,000</strong>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)', display: 'block' }}>Total Exposure Estimate</span>
                            <strong className="mono" style={{ color: 'var(--status-critical)' }}>₹3,51,000 (~₹3.51 lakh)</strong>
                          </div>
                        </div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                          * Clearly identified as estimated production value affected based on illustrative ₹850 unit contribution.
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 5: What should the maintenance team do? */}
                <div className="progressive-step">
                  <div className="progressive-header" onClick={() => toggleSection('s5_sop')}>
                    <span style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="mono" style={{ color: 'var(--accent-cyan)' }}>5.</span> What should the maintenance team do? (SOP-M204-BEARING)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {expandedSections.s5_sop ? 'Hide Details ▲' : 'Show Details ▼'}
                    </span>
                  </div>
                  {expandedSections.s5_sop && (
                    <div className="progressive-content">
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                          <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>Step 1</span>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '0.82rem' }}>Throttle Pump Flow Setpoint:</strong>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                              Reduce hydraulic drive load on PMP-204 to under 25% capacity via SCADA control interface to prevent immediate catastrophic seizure.
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                          <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>Step 2</span>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '0.82rem' }}>Engage Auxiliary Coolant Pump:</strong>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                              Roll over circulation loop to backup pump PMP-102 to maintain minimum 80 m³/hour line cooling flow for CNC spindles.
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                          <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>Step 3</span>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '0.82rem' }}>Inject Auxiliary Lubricant Flush:</strong>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                              Inject high-viscosity synthetic lubricant flush #LUB-SYN-900 into bearing chamber B to lower friction.
                            </p>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.6rem' }}>
                          <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>Step 4</span>
                          <div>
                            <strong style={{ color: '#fff', fontSize: '0.82rem' }}>Execute LOTO & Replace Bearing:</strong>
                            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
                              Execute plant electrical Lockout/Tagout protocol (SOP-LOTO-SAFETY), lock MCC breaker, and dispatch replacement team with spare spherical roller bearing #BRG-M204-SPARE.
                            </p>
                          </div>
                        </div>

                        {sop && (
                          <div style={{ marginTop: '0.85rem', padding: '0.75rem', background: 'rgba(59, 130, 246, 0.08)', border: '1px solid rgba(59, 130, 246, 0.25)', borderRadius: 'var(--radius-sm)' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>Linked SOP Document: {sop.sop_code} — {sop.title}</div>
                            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Target Component: {sop.target_component}</div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Section 6: What requires supervisor approval? */}
                <div className="progressive-step">
                  <div className="progressive-header" onClick={() => toggleSection('s6_approval')}>
                    <span style={{ fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="mono" style={{ color: 'var(--accent-cyan)' }}>6.</span> What requires supervisor approval? (Zero-Trust Policy)
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {expandedSections.s6_approval ? 'Hide Details ▲' : 'Show Details ▼'}
                    </span>
                  </div>
                  {expandedSections.s6_approval && (
                    <div className="progressive-content">
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                        <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                          <div style={{ color: '#10b981', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <CheckCircleIcon size={14} /> Autonomous Actions (Low Risk)
                          </div>
                          <ul style={{ fontSize: '0.76rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', margin: 0 }}>
                            <li>Continuous sensor data ingestion and rolling Z-score calculation</li>
                            <li>Automated correlation with maintenance record logs</li>
                            <li>SOP vector similarity document retrieval</li>
                            <li>Incident ticket generation and financial exposure simulation</li>
                          </ul>
                        </div>

                        <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245, 158, 11, 0.4)' }}>
                          <div style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.8rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <LockIcon size={14} /> Human Supervisor Gated Actions (High Risk)
                          </div>
                          <ul style={{ fontSize: '0.76rem', color: 'var(--text-muted)', paddingLeft: '1.2rem', margin: 0 }}>
                            <li>Altering machine throttle setpoints or speed limits</li>
                            <li>Triggering auxiliary coolant pump rollover</li>
                            <li>Simulated or physical PLC containment actuation</li>
                            <li>Marking incidents as CONTAINED or RESOLVED</li>
                          </ul>
                        </div>
                      </div>
                      <div style={{ marginTop: '0.65rem', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                        * Server-side invariant enforced with HTTP 403 Forbidden verification at API layer before containment executes.
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* AI INVESTIGATION STEPPER WORKFLOW */}
              <AgentStepper
                isInvestigating={investigating}
                investigationResult={investigationResult}
                onRunPipeline={() => handleRunInvestigation(activeIncident.id)}
              />
            </>
          )}
        </div>
      ) : null}

      {/* SUPERVISOR APPROVE MODAL */}
      {isApproveModalOpen && activeIncident && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700 }}>
                <CheckCircleIcon size={18} /> Shift Supervisor Authorization Gate
              </div>
              <button onClick={() => setIsApproveModalOpen(false)} className="btn-close">
                <XIcon size={16} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '1rem', lineHeight: '1.45' }}>
                You are authorizing the containment protocol for <strong>{activeIncident.title}</strong> on Machine <strong>{activeIncident.machine_id}</strong>.
              </p>

              <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.85rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', marginBottom: '1rem' }}>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Action to be executed:
                </div>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.82rem' }}>
                  {activeIncident.action_recommendations?.[0]?.action_title || 'Emergency Thermal Isolation & Controlled Bearing Lubrication Flush'}
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Approver Name & Role:
                </label>
                <input
                  type="text"
                  value={approverName}
                  onChange={(e) => setApproverName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '1.25rem' }}>
                * This approval will be committed to the immutable SHA-256 cryptographic decision ledger with timestamp and operator identity.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-outline" onClick={() => setIsApproveModalOpen(false)}>
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleApproveAction}
                  style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', borderColor: '#10b981' }}
                >
                  <CheckIcon size={14} /> Confirm & Sign Authorization
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUPERVISOR REJECT / REQUEST INSPECTION MODAL */}
      {isRejectModalOpen && activeIncident && (
        <div className="modal-backdrop">
          <div className="modal-card" style={{ maxWidth: '520px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#ef4444', fontWeight: 700 }}>
                <AlertTriangleIcon size={18} /> Request Physical On-Site Inspection
              </div>
              <button onClick={() => setIsRejectModalOpen(false)} className="btn-close">
                <XIcon size={16} />
              </button>
            </div>

            <div style={{ padding: '1.25rem' }}>
              <p style={{ fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '1rem', lineHeight: '1.45' }}>
                Hold automated containment recommendation and dispatch maintenance engineer to physically inspect equipment.
              </p>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                  Inspection Reason / Supervisor Notes:
                </label>
                <textarea
                  rows={3}
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    color: '#fff',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button className="btn btn-outline" onClick={() => setIsRejectModalOpen(false)}>
                  Cancel
                </button>
                <button
                  className="btn"
                  onClick={handleRejectAction}
                  style={{ background: '#ef4444', color: '#fff', border: 'none' }}
                >
                  Hold Action & Dispatch Inspection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
