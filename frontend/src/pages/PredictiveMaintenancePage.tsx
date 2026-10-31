import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Machine } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { RefreshCwIcon } from '../components/Icons';

interface PredictiveMaintenancePageProps {
  onNavigateToMachine: (machineId: string) => void;
  onNavigateToIncident: (incidentId: string) => void;
  onNavigateToSop?: () => void;
}

export const PredictiveMaintenancePage: React.FC<PredictiveMaintenancePageProps> = ({
  onNavigateToMachine,
  onNavigateToIncident,
  onNavigateToSop
}) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await apiService.getMachines();
      setMachines(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load predictive maintenance data.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadData(true);
  }, []);

  if (loading) return <LoadingSpinner message="Calculating Remaining Useful Life (RUL) trajectories..." />;
  if (error) return <ErrorAlert message={error} onRetry={() => loadData(true)} />;

  // RUL and wear estimates based on machine state
  const predictiveMetrics: Record<string, {
    rulHours: number;
    wearPct: number;
    component: string;
    actionRequired: string;
    riskLevel: 'CRITICAL' | 'WARNING' | 'NORMAL';
    overdueNote?: string;
  }> = {
    'M-204': {
      rulHours: 18,
      wearPct: 94,
      component: 'Drive Bearing M-204-B',
      actionRequired: 'Emergency spherical roller bearing replacement & synthetic lube flush',
      riskLevel: 'CRITICAL',
      overdueNote: 'OVERDUE by 60 days (MNT-882)'
    },
    'M-305': {
      rulHours: 110,
      wearPct: 82,
      component: 'Cooling Radiator & Oil Filter',
      actionRequired: 'Clean radiator fin matrix with air wand and check oil bypass valve',
      riskLevel: 'WARNING'
    },
    'M-101': {
      rulHours: 240,
      wearPct: 76,
      component: 'Spindle Cartridge & Tool Taper',
      actionRequired: 'Inspect tool holder runout and dynamic spindle balancing',
      riskLevel: 'WARNING'
    },
    'HYD-105': {
      rulHours: 1450,
      wearPct: 28,
      component: 'Ram Proportional Relief Valve',
      actionRequired: 'Scheduled quarterly fluid contamination check',
      riskLevel: 'NORMAL'
    },
    'CON-401': {
      rulHours: 2200,
      wearPct: 18,
      component: 'Conveyor Drive Belt & Roller Bearings',
      actionRequired: 'Routine lithium grease top-up',
      riskLevel: 'NORMAL'
    },
    'WLD-202': {
      rulHours: 680,
      wearPct: 42,
      component: 'Robotic Weld Torch Electrode Cap',
      actionRequired: 'Automated electrode tip dressing cycle',
      riskLevel: 'NORMAL'
    },
    'MOT-110': {
      rulHours: 3500,
      wearPct: 15,
      component: 'Stator Windings & Rotor Bearing',
      actionRequired: 'Annual insulation resistance testing',
      riskLevel: 'NORMAL'
    },
    'CHL-501': {
      rulHours: 1800,
      wearPct: 22,
      component: 'Screw Compressor Expansion Valve',
      actionRequired: 'Refrigerant pressure verification',
      riskLevel: 'NORMAL'
    },
    'PMP-102': {
      rulHours: 4200,
      wearPct: 10,
      component: 'Backup Impeller Assembly',
      actionRequired: 'Monthly rollover spin test',
      riskLevel: 'NORMAL'
    },
    'CNC-102': {
      rulHours: 1950,
      wearPct: 24,
      component: 'Linear Guideways & Ball Screw',
      actionRequired: 'Centralized oil lubrication line check',
      riskLevel: 'NORMAL'
    }
  };

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Predictive Maintenance & RUL Planning</h1>
            <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
              REMAINING USEFUL LIFE (RUL)
            </span>
          </div>
          <p className="page-subtitle">
            Component Wear Trajectories, Degradation Forecasting & Preventive Overhaul Scheduling
          </p>
        </div>
        <div>
          <button
            className="btn btn-outline"
            onClick={() => loadData(true)}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCwIcon size={14} /> Refresh RUL Models
          </button>
        </div>
      </div>

      {/* Critical Overhaul Alert Spotlight */}
      <div
        style={{
          background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.04) 100%)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1.15rem',
          marginBottom: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-critical">PREDICTIVE FAILURE WARNING</span>
            <span className="mono" style={{ color: 'var(--status-critical)', fontWeight: 700 }}>PMP-204 (Coolant Pump)</span>
            <span style={{ fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>OVERDUE BY 60 DAYS</span>
          </div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#fff', margin: '0 0 0.25rem 0' }}>
            Drive Bearing M-204-B Remaining Useful Life: ~18 Operating Hours
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1', margin: 0, maxWidth: '720px' }}>
            Vibration trend indicates accelerated spalling on inner raceway. Last replaced 14 months ago (MNT-882) against a 12-month rated design lifetime under continuous 24/7 automotive load. Replacement required before bearing seizure.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            className="btn btn-primary"
            onClick={() => onNavigateToIncident('INC-M204-001')}
            style={{ background: 'linear-gradient(135deg, #ef4444, #b91c1c)', fontSize: '0.8rem', padding: '0.5rem 0.85rem' }}
          >
            Open Containment Workflow
          </button>
        </div>
      </div>

      {/* RUL & Component Wear Table */}
      <div className="card">
        <div className="card-title">
          <span>Fleet Health & Component Wear Projections</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Continuous Weibull Degradation Models</span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Machine ID</th>
                <th>Target Component</th>
                <th>Wear Index</th>
                <th>Est. Remaining Life (RUL)</th>
                <th>Status</th>
                <th>Recommended Maintenance Action</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((machine) => {
                const pred = predictiveMetrics[machine.id] || {
                  rulHours: 2000,
                  wearPct: 20,
                  component: 'Drive Assembly',
                  actionRequired: 'Routine periodic check',
                  riskLevel: 'NORMAL'
                };

                const isCrit = pred.riskLevel === 'CRITICAL';
                const isWarn = pred.riskLevel === 'WARNING';

                return (
                  <tr key={machine.id} style={{ background: isCrit ? 'rgba(239, 68, 68, 0.05)' : isWarn ? 'rgba(245, 158, 11, 0.03)' : 'transparent' }}>
                    <td className="mono" style={{ fontWeight: 700, color: isCrit ? 'var(--status-critical)' : 'var(--accent-cyan)' }}>
                      {machine.id}
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{machine.name}</div>
                    </td>
                    <td>
                      <strong style={{ color: '#fff', fontSize: '0.82rem' }}>{pred.component}</strong>
                      {pred.overdueNote && (
                        <div style={{ fontSize: '0.68rem', color: 'var(--status-critical)', fontWeight: 600 }}>
                          {pred.overdueNote}
                        </div>
                      )}
                    </td>
                    <td style={{ minWidth: '140px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                          <div
                            style={{
                              width: `${pred.wearPct}%`,
                              height: '100%',
                              backgroundColor: pred.wearPct > 85 ? 'var(--status-critical)' : pred.wearPct > 65 ? '#f59e0b' : '#10b981'
                            }}
                          />
                        </div>
                        <span className="mono" style={{ fontSize: '0.75rem', fontWeight: 600 }}>{pred.wearPct}%</span>
                      </div>
                    </td>
                    <td className="mono" style={{ fontWeight: 700, color: pred.rulHours < 50 ? 'var(--status-critical)' : pred.rulHours < 300 ? '#f59e0b' : '#fff' }}>
                      ~{pred.rulHours} hrs
                    </td>
                    <td>
                      <span className={`badge badge-${pred.riskLevel.toLowerCase()}`}>
                        {pred.riskLevel}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.78rem', color: '#cbd5e1', maxWidth: '300px' }}>
                      {pred.actionRequired}
                    </td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <button
                        className="btn btn-outline"
                        style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                        onClick={() => onNavigateToMachine(machine.id)}
                      >
                        Inspect
                      </button>
                      {pred.riskLevel === 'CRITICAL' && (
                        <button
                          className="btn btn-primary"
                          style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', marginLeft: '0.35rem', background: '#ef4444', borderColor: '#ef4444' }}
                          onClick={() => onNavigateToIncident(machine.id === 'M-204' ? 'INC-M204-001' : `INC-${machine.id.replace('-', '')}-001`)}
                        >
                          Incident
                        </button>
                      )}
                      {onNavigateToSop && (
                        <button
                          className="btn btn-outline"
                          style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', marginLeft: '0.35rem' }}
                          onClick={onNavigateToSop}
                        >
                          SOP
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
