import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Machine, Incident, TelemetryRecord } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { formatINR, formatDateIST } from '../utils/formatters';
import {
  RefreshCwIcon,
  ActivityIcon,
  SearchIcon,
  CpuIcon,
  ChevronRightIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon
} from '../components/Icons';

interface DashboardPageProps {
  onNavigateToIncident: (incidentId: string) => void;
  onNavigateToMachine: (machineId: string) => void;
  onNavigateToTab?: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigateToIncident,
  onNavigateToMachine,
  onNavigateToTab
}) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [m204Telemetry, setM204Telemetry] = useState<TelemetryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const [machinesData, incidentsData, telemetryData] = await Promise.all([
        apiService.getMachines(),
        apiService.getIncidents(),
        apiService.getMachineTelemetry('M-204', 5)
      ]);
      setMachines(machinesData);
      setIncidents(incidentsData);
      setM204Telemetry(telemetryData);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData(true);

    const interval = setInterval(() => {
      loadDashboardData(false);
    }, 4000);

    const handleSimUpdate = () => loadDashboardData(false);
    window.addEventListener('simulation-updated', handleSimUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('simulation-updated', handleSimUpdate);
    };
  }, []);

  if (loading) return <LoadingSpinner message="Connecting to industrial telemetry pipeline & AI agent stream..." />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadDashboardData(true)} />;

  // Calculated Metrics for the 8 Summary Cards
  const totalMachines = machines.length || 10;
  const normalMachines = machines.filter(m => m.status === 'NORMAL').length;
  const attentionMachines = machines.filter(m => m.status === 'CRITICAL' || m.status === 'WARNING');
  const criticalIncidents = incidents.filter(i => i.severity === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CONTAINED');
  const activeIncidents = incidents.filter(i => i.status !== 'RESOLVED');
  const pendingApprovals = incidents.filter(i => i.status === 'PENDING_APPROVAL');

  // Financial assumptions for active critical issue
  const estimatedDowntimeHours = 3.0;
  const lineThroughputUnitsHr = 120;
  const unitsAffected = estimatedDowntimeHours * lineThroughputUnitsHr; // 360 units
  const valuePerUnitINR = 850;
  const estimatedProductionValueINR = unitsAffected * valuePerUnitINR; // ₹3,06,000
  const estimatedMaintenanceCostINR = 45000;
  const totalFinancialExposureINR = estimatedProductionValueINR + estimatedMaintenanceCostINR; // ₹3,51,000

  // Plant availability calculation (illustrative realistic metric)
  const plantAvailabilityPct = (
    ((totalMachines - (criticalIncidents.length * 0.8 + (attentionMachines.length - criticalIncidents.length) * 0.3)) / totalMachines) * 100
  ).toFixed(1);

  const latestM204Vibration = m204Telemetry.length > 0 ? m204Telemetry[0].vibration_mm_s : 7.82;
  const latestM204Temp = m204Telemetry.length > 0 ? m204Telemetry[0].temp_celsius : 88.4;

  return (
    <div className="page-container">
      {/* Top Page Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Operations Command Center</h1>
            <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
              CHAKAN MIDC • PUNE PLANT
            </span>
          </div>
          <p className="page-subtitle">
            Real-time Plant Health, Predictive Anomaly Detection & Human-in-the-Loop Response Queue
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Live Polling: 4s Interval (Simulated Stream)
          </span>
          <button
            className="btn btn-outline"
            onClick={() => loadDashboardData(true)}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCwIcon size={14} /> Refresh Plant State
          </button>
        </div>
      </div>

      {/* CORE QUESTION 1: Is the plant operating normally? */}
      <div
        style={{
          background: criticalIncidents.length > 0
            ? 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.05) 100%)'
            : 'linear-gradient(90deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.05) 100%)',
          border: `1px solid ${criticalIncidents.length > 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`,
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          marginBottom: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span
            className="pulsate-dot"
            style={{
              width: '10px',
              height: '10px',
              backgroundColor: criticalIncidents.length > 0 ? 'var(--status-critical)' : 'var(--status-normal)',
              boxShadow: `0 0 10px ${criticalIncidents.length > 0 ? 'var(--status-critical)' : 'var(--status-normal)'}`
            }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#fff' }}>
              {criticalIncidents.length > 0
                ? 'PLANT STATUS: ATTENTION REQUIRED (1 CRITICAL INCIDENT ON LINE B)'
                : 'PLANT STATUS: ALL MONITORED SYSTEMS OPERATING WITHIN NORMAL ENVELOPE'}
            </div>
            <div style={{ fontSize: '0.76rem', color: '#cbd5e1', marginTop: '2px' }}>
              Line B primary coolant pump PMP-204 is vibrating above limit. {attentionMachines.length} of {totalMachines} machines require supervisor/maintenance review.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Line Availability</span>
            <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: Number(plantAvailabilityPct) < 90 ? '#f59e0b' : '#10b981' }}>
              {plantAvailabilityPct}%
            </span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block' }}>Production Loss Risk</span>
            <span className="mono" style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--status-critical)' }}>
              {formatINR(estimatedProductionValueINR, { compact: true })}
            </span>
          </div>
        </div>
      </div>

      {/* CORE QUESTION 5 & 3: What action is required from user? Active Incident Spotlight */}
      {criticalIncidents.length > 0 && (
        <div className="alert-banner spotlight-card" style={{ marginBottom: '1.5rem' }}>
          <div className="alert-info" style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
              <span className="badge badge-critical" style={{ letterSpacing: '0.04em' }}>
                ACTION REQUIRED: SUPERVISOR APPROVAL PENDING
              </span>
              <span className="mono" style={{ color: 'var(--status-critical)', fontWeight: 700 }}>
                {criticalIncidents[0].id}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                • Target: PMP-204 (Coolant Circulation Pump) • Line B
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: '0 0 0.35rem 0' }}>
              {criticalIncidents[0].title}
            </h2>
            <p style={{ margin: 0, fontSize: '0.86rem', color: '#cbd5e1', lineHeight: '1.45' }}>
              {criticalIncidents[0].summary}
            </p>

            {/* Live Sensor Context with Units and Reference Limits */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', marginTop: '0.85rem' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Vibration Amplitude</div>
                <div className="mono" style={{ color: 'var(--status-critical)', fontWeight: 700, fontSize: '0.95rem' }}>
                  {latestM204Vibration.toFixed(2)} mm/s RMS
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Normal limit: ≤ 4.50 mm/s</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Bearing Temperature</div>
                <div className="mono" style={{ color: 'var(--status-critical)', fontWeight: 700, fontSize: '0.95rem' }}>
                  {latestM204Temp.toFixed(1)} °C
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Thermal limit: ≤ 75.0 °C</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Root Cause (AI Diagnosis)</div>
                <div style={{ color: 'var(--accent-cyan)', fontWeight: 600, fontSize: '0.85rem' }}>
                  Bearing Life Exceeded (MNT-882)
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>Overdue by 60 days (91% confidence)</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Est. Production Exposure</div>
                <div className="mono" style={{ color: '#f59e0b', fontWeight: 700, fontSize: '0.95rem' }}>
                  {formatINR(estimatedProductionValueINR, { compact: true })}
                </div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)' }}>360 parts @ ₹850 illustrative value</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'center', minWidth: '220px' }}>
            <button
              className="btn btn-primary"
              onClick={() => onNavigateToIncident(criticalIncidents[0].id)}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                padding: '0.65rem 1rem'
              }}
            >
              <SearchIcon size={15} /> Review & Authorize Action
            </button>
            <button
              className="btn btn-outline"
              onClick={() => onNavigateToMachine('M-204')}
              style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}
            >
              <ActivityIcon size={14} /> Inspect PMP-204 Telemetry
            </button>
          </div>
        </div>
      )}

      {/* 8 USEFUL SUMMARY CARDS (Standardized Industrial Operational KPIs) */}
      <div className="kpi-8-grid">
        {/* Card 1: Total Registered Machines */}
        <div className="kpi-card" onClick={() => onNavigateToTab && onNavigateToTab('machines')} style={{ cursor: 'pointer' }}>
          <div className="kpi-card-header">
            <span className="kpi-card-title">Total Machines</span>
            <span className="badge badge-normal">Fleet</span>
          </div>
          <div className="kpi-card-value">
            {totalMachines} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 400 }}>Units</span>
          </div>
          <div className="kpi-card-sub">Pune Automotive Plant (Chakan MIDC)</div>
        </div>

        {/* Card 2: Machines Operating Normally */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Operating Normally</span>
            <span className="badge badge-normal">
              <CheckCircleIcon size={11} /> Healthy
            </span>
          </div>
          <div className="kpi-card-value" style={{ color: 'var(--status-normal)' }}>
            {normalMachines} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 400 }}>Units</span>
          </div>
          <div className="kpi-card-sub">{((normalMachines / totalMachines) * 100).toFixed(0)}% of total plant capacity</div>
        </div>

        {/* Card 3: Machines Requiring Attention */}
        <div className="kpi-card" style={{ borderColor: attentionMachines.length > 0 ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)' }}>
          <div className="kpi-card-header">
            <span className="kpi-card-title">Requires Attention</span>
            <span className="badge badge-warning">
              {attentionMachines.length} Assets
            </span>
          </div>
          <div className="kpi-card-value" style={{ color: attentionMachines.length > 0 ? '#f59e0b' : 'var(--text-bright)' }}>
            {attentionMachines.length} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 400 }}>Units</span>
          </div>
          <div className="kpi-card-sub">PMP-204, CMP-301, CNC-101</div>
        </div>

        {/* Card 4: Active Critical Incidents */}
        <div className="kpi-card" style={{ borderColor: criticalIncidents.length > 0 ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)' }}>
          <div className="kpi-card-header">
            <span className="kpi-card-title">Critical Incidents</span>
            <span className="badge badge-critical">Active</span>
          </div>
          <div className="kpi-card-value" style={{ color: criticalIncidents.length > 0 ? 'var(--status-critical)' : 'var(--status-normal)' }}>
            {criticalIncidents.length}
          </div>
          <div className="kpi-card-sub">{criticalIncidents.length > 0 ? 'INC-M204-001 bearing wear' : 'Zero critical faults'}</div>
        </div>

        {/* Card 5: Pending Maintenance Tasks */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Pending Maintenance</span>
            <span className="badge badge-warning">3 Work Orders</span>
          </div>
          <div className="kpi-card-value">
            3 <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 400 }}>Tasks</span>
          </div>
          <div className="kpi-card-sub" style={{ color: '#f59e0b' }}>1 Task Overdue by 60 days</div>
        </div>

        {/* Card 6: Estimated Production Loss */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Est. Production Value Affected</span>
            <span className="badge" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', borderColor: 'rgba(245, 158, 11, 0.3)' }}>
              Illustrative
            </span>
          </div>
          <div className="kpi-card-value mono" style={{ color: '#fbbf24' }}>
            {formatINR(estimatedProductionValueINR, { compact: true })}
          </div>
          <div className="kpi-card-sub">360 parts @ ₹850 illustrative value</div>
        </div>

        {/* Card 7: Plant Availability */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Plant Availability</span>
            <span className="badge badge-normal">OEE Feed</span>
          </div>
          <div className="kpi-card-value mono" style={{ color: Number(plantAvailabilityPct) < 90 ? '#f59e0b' : '#10b981' }}>
            {plantAvailabilityPct}%
          </div>
          <div className="kpi-card-sub">Target baseline: ≥ 92.0%</div>
        </div>

        {/* Card 8: Maintenance Actions Awaiting Approval */}
        <div className="kpi-card" style={{ borderColor: pendingApprovals.length > 0 ? 'rgba(6, 182, 212, 0.4)' : 'var(--border-color)' }}>
          <div className="kpi-card-header">
            <span className="kpi-card-title">Awaiting Approval</span>
            <span className="badge badge-ai">HITL Gate</span>
          </div>
          <div className="kpi-card-value mono" style={{ color: 'var(--accent-cyan)' }}>
            {pendingApprovals.length} <span style={{ fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 400 }}>Action</span>
          </div>
          <div className="kpi-card-sub">ACT-M204-01 requires supervisor signoff</div>
        </div>
      </div>

      {/* FINANCIAL CALCULATION ASSUMPTIONS DISCLOSURE BOX (Prompt 3 requirement) */}
      <div className="card" style={{ marginBottom: '1.5rem', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--accent-cyan)' }}>
            <InfoIcon size={14} /> Explicit Financial & Production Impact Assumptions (Pune Plant)
          </div>
          <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
            Label: Estimated production value affected (not confirmed financial loss)
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', fontSize: '0.8rem' }}>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Estimated Downtime</span>
            <strong style={{ color: '#fff' }}>{estimatedDowntimeHours} hours</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Throughput Output</span>
            <strong style={{ color: '#fff' }}>{lineThroughputUnitsHr} components / hour</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Estimated Production Affected</span>
            <strong style={{ color: '#fff' }}>{unitsAffected} components</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Illustrative Value / Component</span>
            <strong style={{ color: '#fff' }}>₹{valuePerUnitINR} per part</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Estimated Production Value Affected</span>
            <strong className="mono" style={{ color: '#fbbf24' }}>{formatINR(estimatedProductionValueINR)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Estimated Maintenance Cost</span>
            <strong className="mono" style={{ color: '#fff' }}>{formatINR(estimatedMaintenanceCostINR)}</strong>
          </div>
          <div>
            <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Total Financial Exposure</span>
            <strong className="mono" style={{ color: 'var(--status-critical)' }}>{formatINR(totalFinancialExposureINR)}</strong>
          </div>
        </div>
      </div>

      {/* FLEET OVERVIEW & ACTIVE INCIDENTS SPLIT */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.25rem' }}>
        {/* Machines Requiring Attention & Fleet Table */}
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CpuIcon size={14} color="var(--accent-cyan)" /> Machine Fleet Registry & Health
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              10 Assets Monitored
            </span>
          </div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Machine ID</th>
                  <th>Equipment & Location</th>
                  <th>Health Score</th>
                  <th>Status</th>
                  <th style={{ textAlign: 'right' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((machine) => {
                  const health = machine.health_score ?? (machine.status === 'CRITICAL' ? 46.5 : machine.status === 'WARNING' ? 71.0 : 95.0);
                  const isAttention = machine.status === 'CRITICAL' || machine.status === 'WARNING';
                  return (
                    <tr key={machine.id} style={{ background: isAttention ? 'rgba(245, 158, 11, 0.03)' : 'transparent' }}>
                      <td className="mono" style={{ fontWeight: 700, color: machine.status === 'CRITICAL' ? 'var(--status-critical)' : 'var(--accent-cyan)' }}>
                        {machine.id}
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.84rem' }}>{machine.name}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{machine.location}</div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                width: `${health}%`,
                                height: '100%',
                                backgroundColor: health < 60 ? 'var(--status-critical)' : health < 80 ? 'var(--status-warning)' : 'var(--status-normal)'
                              }}
                            />
                          </div>
                          <span className="mono" style={{ fontSize: '0.76rem', fontWeight: 600, color: health < 60 ? 'var(--status-critical)' : health < 80 ? '#f59e0b' : '#10b981' }}>
                            {health.toFixed(0)}%
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge badge-${machine.status.toLowerCase()}`}>
                          {machine.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-outline"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                          onClick={() => onNavigateToMachine(machine.id)}
                        >
                          Inspect <ChevronRightIcon size={11} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Active Incidents & Response Queue */}
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <AlertTriangleIcon size={14} color="var(--status-critical)" /> Active Incidents Queue
            </span>
            <span className="badge badge-critical">{activeIncidents.length} Active</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {activeIncidents.map((incident) => (
              <div
                key={incident.id}
                style={{
                  background: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  cursor: 'pointer',
                  borderLeft: incident.severity === 'CRITICAL' ? '3px solid var(--status-critical)' : incident.severity === 'HIGH' ? '3px solid #f59e0b' : '3px solid var(--accent-cyan)'
                }}
                onClick={() => onNavigateToIncident(incident.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                      {incident.id}
                    </span>
                    <span className="badge" style={{ fontSize: '0.65rem' }}>
                      {incident.machine_id}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '0.35rem' }}>
                    <span className={`badge badge-${incident.severity.toLowerCase()}`}>
                      {incident.severity}
                    </span>
                    <span
                      className="badge"
                      style={{
                        background: incident.status === 'APPROVED' ? 'rgba(16, 185, 129, 0.15)' : incident.status === 'PENDING_APPROVAL' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                        color: incident.status === 'APPROVED' ? '#4ade80' : incident.status === 'PENDING_APPROVAL' ? '#fbbf24' : '#60a5fa'
                      }}
                    >
                      {incident.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#fff', marginBottom: '0.25rem' }}>
                  {incident.title}
                </div>

                <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>
                  {incident.summary}
                </p>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', fontSize: '0.74rem' }}>
                  <span style={{ color: 'var(--text-dim)' }}>
                    Detected: {formatDateIST(incident.created_at)}
                  </span>
                  <span style={{ color: 'var(--accent-cyan)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    Open Investigation Workflow <ChevronRightIcon size={12} />
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
