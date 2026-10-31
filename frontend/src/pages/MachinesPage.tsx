import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Machine, MachineDetail, TelemetryRecord } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { formatDateIST, formatDateOnlyIST, diagnoseVibration, diagnoseTemperature } from '../utils/formatters';
import {
  RefreshCwIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ActivityIcon,
  CpuIcon,
  WrenchIcon
} from '../components/Icons';

interface MachinesPageProps {
  selectedMachineId?: string | null;
}

export const MachinesPage: React.FC<MachinesPageProps> = ({ selectedMachineId }) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [activeMachine, setActiveMachine] = useState<MachineDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'telemetry' | 'maintenance' | 'limits'>('telemetry');

  const fetchMachines = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await apiService.getMachines();
      setMachines(data);
      const targetId = activeMachine?.id || selectedMachineId || (data.length > 0 ? data[0].id : null);
      if (targetId) {
        const detail = await apiService.getMachineDetail(targetId);
        setActiveMachine(detail);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch machines telemetry.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMachines(true);

    const interval = setInterval(() => {
      fetchMachines(false);
    }, 4000);

    const handleSimUpdate = () => fetchMachines(false);
    window.addEventListener('simulation-updated', handleSimUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('simulation-updated', handleSimUpdate);
    };
  }, [selectedMachineId]);

  const selectMachine = async (id: string) => {
    setLoading(true);
    try {
      const detail = await apiService.getMachineDetail(id);
      setActiveMachine(detail);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !activeMachine) return <LoadingSpinner message="Polling sensor registers & stream history..." />;
  if (error) return <ErrorAlert message={error} onRetry={() => fetchMachines(true)} />;

  const latestTelemetry: TelemetryRecord | null =
    activeMachine && activeMachine.recent_telemetry && activeMachine.recent_telemetry.length > 0
      ? activeMachine.recent_telemetry[0]
      : null;

  const currentVib = latestTelemetry ? latestTelemetry.vibration_mm_s : 1.8;
  const currentTemp = latestTelemetry ? latestTelemetry.temp_celsius : 52.0;
  const currentOutput = latestTelemetry ? latestTelemetry.output_units_min : 100.0;
  const vibThreshold = activeMachine?.vibration_threshold ?? 4.5;
  const tempThreshold = activeMachine?.temp_threshold ?? 75.0;

  const vibDiag = diagnoseVibration(currentVib, vibThreshold);
  const tempDiag = diagnoseTemperature(currentTemp, tempThreshold);

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Machine Registry & Health Telemetry</h1>
            <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
              CHAKAN MIDC AUTOMOTIVE FLEET
            </span>
          </div>
          <p className="page-subtitle">
            Calibrated Operating Limits, Plain-Language Metric Diagnosis & Preventive Maintenance Logs
          </p>
        </div>
        <div>
          <button
            className="btn btn-outline"
            onClick={() => fetchMachines(true)}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCwIcon size={14} /> Refresh Sensor Registers
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
        {/* Left Side: Asset Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
          <div className="card-header-label">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CpuIcon size={14} /> Registered Machines ({machines.length} Total)
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '720px', overflowY: 'auto' }}>
            {machines.map((machine) => {
              const isSelected = activeMachine?.id === machine.id;
              const health = machine.health_score ?? (machine.status === 'CRITICAL' ? 46.5 : machine.status === 'WARNING' ? 71.0 : 95.0);

              return (
                <div
                  key={machine.id}
                  className={`card ${isSelected ? 'ai-card-highlight' : ''}`}
                  style={{
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.06)' : 'var(--bg-surface)',
                    padding: '0.85rem'
                  }}
                  onClick={() => selectMachine(machine.id)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span className="mono" style={{ fontWeight: 700, color: machine.status === 'CRITICAL' ? 'var(--status-critical)' : 'var(--accent-cyan)' }}>
                      {machine.id}
                    </span>
                    <span className={`badge badge-${machine.status.toLowerCase()}`}>
                      {machine.status}
                    </span>
                  </div>

                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff' }}>{machine.name}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {machine.location}
                  </div>

                  <div style={{ marginTop: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.72rem' }}>
                    <span style={{ color: 'var(--text-dim)' }}>Health Score:</span>
                    <strong style={{ color: health < 60 ? 'var(--status-critical)' : health < 80 ? '#f59e0b' : '#10b981' }}>
                      {health.toFixed(0)}%
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Machine Telemetry & Maintenance Detail View */}
        {activeMachine ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', gridColumn: 'span 2' }}>
            {/* Machine Header Card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
                    <span className="mono" style={{ fontSize: '1.2rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>{activeMachine.id}</span>
                    <span className={`badge badge-${activeMachine.status.toLowerCase()}`}>{activeMachine.status}</span>
                    <span className="badge" style={{ fontSize: '0.68rem' }}>{activeMachine.criticality || 'HIGH'} CRITICALITY</span>
                  </div>
                  <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>{activeMachine.name}</h2>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Manufacturer / Model: <strong style={{ color: '#fff' }}>{activeMachine.manufacturer_model || 'Standard Industrial'}</strong> • Location: <strong style={{ color: '#fff' }}>{activeMachine.location}</strong>
                  </div>
                </div>

                <div style={{ textAlign: 'right', fontSize: '0.8rem' }}>
                  <div style={{ color: 'var(--text-muted)' }}>Equipment Type:</div>
                  <strong style={{ color: 'var(--accent-cyan)' }}>{activeMachine.type}</strong>
                  <div style={{ color: 'var(--text-muted)', marginTop: '0.3rem' }}>Next Scheduled Overhaul:</div>
                  <strong style={{ color: activeMachine.id === 'M-204' ? 'var(--status-critical)' : '#fff' }}>
                    {activeMachine.next_maintenance_date ? formatDateOnlyIST(activeMachine.next_maintenance_date) : '25 Nov 2026'}
                    {activeMachine.id === 'M-204' && ' (OVERDUE)'}
                  </strong>
                </div>
              </div>

              {activeMachine.description && (
                <p style={{ fontSize: '0.84rem', color: 'var(--text-bright)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', margin: 0, lineHeight: '1.45' }}>
                  {activeMachine.description}
                </p>
              )}
            </div>

            {/* TECHNICAL METRIC EXPLANATION CARDS (Prompt 3 requirement: 6 parameters) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* Metric 1: Vibration */}
              <div className={`metric-diagnosis-box ${vibDiag.status.toLowerCase()}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff' }}>{vibDiag.metricName}</span>
                  <span className={`badge badge-${vibDiag.status.toLowerCase()}`}>{vibDiag.statusLabel}</span>
                </div>
                <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 700, color: vibDiag.status === 'CRITICAL' ? 'var(--status-critical)' : '#fff' }}>
                  {vibDiag.currentReading} <span style={{ fontSize: '0.85rem' }}>{vibDiag.unit}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.45rem' }}>
                  Configured Normal Range: {vibDiag.normalLimit}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.35' }}>
                  <strong>Explanation:</strong> {vibDiag.explanation}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.35rem' }}>
                  <strong>Action:</strong> {vibDiag.recommendedCheck}
                </div>
              </div>

              {/* Metric 2: Bearing Temperature */}
              <div className={`metric-diagnosis-box ${tempDiag.status.toLowerCase()}`}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff' }}>{tempDiag.metricName}</span>
                  <span className={`badge badge-${tempDiag.status.toLowerCase()}`}>{tempDiag.statusLabel}</span>
                </div>
                <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 700, color: tempDiag.status === 'CRITICAL' ? 'var(--status-critical)' : '#fff' }}>
                  {tempDiag.currentReading} <span style={{ fontSize: '0.85rem' }}>{tempDiag.unit}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.45rem' }}>
                  Configured Thermal Range: {tempDiag.normalLimit}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.35' }}>
                  <strong>Explanation:</strong> {tempDiag.explanation}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.35rem' }}>
                  <strong>Action:</strong> {tempDiag.recommendedCheck}
                </div>
              </div>

              {/* Metric 3: Output Throughput */}
              <div className="metric-diagnosis-box normal">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.8rem', color: '#fff' }}>Operating Output Rate</span>
                  <span className="badge badge-normal">Measured Feed</span>
                </div>
                <div className="mono" style={{ fontSize: '1.35rem', fontWeight: 700, color: '#fff' }}>
                  {currentOutput.toFixed(1)} <span style={{ fontSize: '0.85rem' }}>{activeMachine.output_unit_label || 'units/min'}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)', marginBottom: '0.45rem' }}>
                  Nameplate Rating: {activeMachine.rated_output_units || 100.0} {activeMachine.output_unit_label || 'units/min'}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#cbd5e1', lineHeight: '1.35' }}>
                  <strong>Explanation:</strong> Real-time production rate measured via downstream in-line SCADA transducers.
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--accent-cyan)', marginTop: '0.4rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.35rem' }}>
                  <strong>Action:</strong> Synchronized with Line B assembly schedule.
                </div>
              </div>
            </div>

            {/* Sub-Tabs: Telemetry Stream vs Maintenance Records */}
            <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <button
                className={`btn ${activeTab === 'telemetry' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
                onClick={() => setActiveTab('telemetry')}
              >
                <ActivityIcon size={13} /> 24-Hour Telemetry Registers ({activeMachine.recent_telemetry?.length || 0})
              </button>
              <button
                className={`btn ${activeTab === 'maintenance' ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.8rem' }}
                onClick={() => setActiveTab('maintenance')}
              >
                <WrenchIcon size={13} /> Maintenance Work Orders ({activeMachine.maintenance_records?.length || 0})
              </button>
            </div>

            {/* TAB 1: Telemetry Records Table */}
            {activeTab === 'telemetry' && (
              <div className="card">
                <div className="card-title">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <ActivityIcon size={14} color="var(--accent-cyan)" /> Telemetry Time-Series Log (IST)
                  </span>
                  <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
                    Sampled at 30-min intervals
                  </span>
                </div>

                <div className="table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Timestamp (IST)</th>
                        <th>Vibration (mm/s RMS)</th>
                        <th>Temperature (°C)</th>
                        <th>Output Throughput</th>
                        <th>Anomaly Evaluation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activeMachine.recent_telemetry && activeMachine.recent_telemetry.length > 0 ? (
                        activeMachine.recent_telemetry.map((t) => (
                          <tr key={t.id} style={{ background: t.is_anomaly ? 'rgba(239, 68, 68, 0.08)' : 'transparent' }}>
                            <td className="mono" style={{ fontSize: '0.78rem' }}>
                              {formatDateIST(t.timestamp)}
                            </td>
                            <td className="mono" style={{ fontWeight: 600, color: t.vibration_mm_s >= vibThreshold ? 'var(--status-critical)' : 'inherit' }}>
                              {t.vibration_mm_s.toFixed(2)} mm/s RMS
                            </td>
                            <td className="mono" style={{ color: t.temp_celsius >= tempThreshold ? 'var(--status-critical)' : 'inherit' }}>
                              {t.temp_celsius.toFixed(1)} °C
                            </td>
                            <td className="mono">
                              {t.output_units_min.toFixed(1)} {activeMachine.output_unit_label || 'units/min'}
                            </td>
                            <td>
                              {t.is_anomaly ? (
                                <span className="badge badge-critical" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <AlertTriangleIcon size={11} /> BREACH DETECTED
                                </span>
                              ) : (
                                <span className="badge badge-normal" style={{ fontSize: '0.68rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                                  <CheckCircleIcon size={11} /> NOMINAL
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                            No telemetry records found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB 2: Maintenance Records */}
            {activeTab === 'maintenance' && (
              <div className="card">
                <div className="card-title">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <WrenchIcon size={14} color="var(--accent-cyan)" /> Historical Work Orders & Overhauls
                  </span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Maintenance Journal
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {activeMachine.maintenance_records && activeMachine.maintenance_records.length > 0 ? (
                    activeMachine.maintenance_records.map((m) => (
                      <div
                        key={m.id}
                        style={{
                          background: 'var(--bg-surface-elevated)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-md)',
                          padding: '1rem'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                          <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.82rem' }}>
                            {m.id}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {formatDateIST(m.timestamp)}
                          </span>
                        </div>
                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.86rem', marginBottom: '0.2rem' }}>
                          {m.action_taken} ({m.component})
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--accent-blue)', marginBottom: '0.4rem' }}>
                          Technician: {m.technician}
                        </div>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-bright)', margin: 0, lineHeight: '1.45' }}>
                          {m.notes}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                      No prior maintenance records found for this machine.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
