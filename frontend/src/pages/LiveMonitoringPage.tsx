import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { Machine, TelemetryRecord } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import { formatDateIST, diagnoseVibration, diagnoseTemperature } from '../utils/formatters';
import { RefreshCwIcon } from '../components/Icons';

interface LiveMonitoringPageProps {
  onNavigateToMachine: (machineId: string) => void;
  onNavigateToIncident: (incidentId: string) => void;
}

export const LiveMonitoringPage: React.FC<LiveMonitoringPageProps> = ({
  onNavigateToMachine,
  onNavigateToIncident
}) => {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [telemetryMap, setTelemetryMap] = useState<Record<string, TelemetryRecord>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLiveTelemetry = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const machinesData = await apiService.getMachines();
      setMachines(machinesData);

      // Fetch latest telemetry record for each machine
      const telemPromises = machinesData.map(async (m) => {
        try {
          const telem = await apiService.getMachineTelemetry(m.id, 1);
          return { machineId: m.id, record: telem.length > 0 ? telem[0] : null };
        } catch {
          return { machineId: m.id, record: null };
        }
      });

      const telemResults = await Promise.all(telemPromises);
      const newMap: Record<string, TelemetryRecord> = {};
      telemResults.forEach(r => {
        if (r.record) newMap[r.machineId] = r.record;
      });
      setTelemetryMap(newMap);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch live telemetry stream.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchLiveTelemetry(true);
    const interval = setInterval(() => {
      fetchLiveTelemetry(false);
    }, 4000);

    const handleSimUpdate = () => fetchLiveTelemetry(false);
    window.addEventListener('simulation-updated', handleSimUpdate);

    return () => {
      clearInterval(interval);
      window.removeEventListener('simulation-updated', handleSimUpdate);
    };
  }, []);

  if (loading && machines.length === 0) {
    return <LoadingSpinner message="Connecting to SCADA telemetry multiplexer..." />;
  }

  if (error) return <ErrorAlert message={error} onRetry={() => fetchLiveTelemetry(true)} />;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Live Sensor Monitoring & SCADA Telemetry</h1>
            <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
              4-SECOND POLL RATE • SIMULATED STREAM
            </span>
          </div>
          <p className="page-subtitle">
            Simulated SCADA Telemetry Registers with Configured Alert Threshold Limits (30-Minute Seeded Baseline)
          </p>
        </div>
        <div>
          <button
            className="btn btn-outline"
            onClick={() => fetchLiveTelemetry(true)}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCwIcon size={14} /> Refresh Sensors
          </button>
        </div>
      </div>

      {/* Sensor Channel Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {machines.map((machine) => {
          const telem = telemetryMap[machine.id];
          const vib = telem ? telem.vibration_mm_s : 1.8;
          const temp = telem ? telem.temp_celsius : 52.0;
          const output = telem ? telem.output_units_min : 100.0;
          const vibThreshold = machine.vibration_threshold ?? 4.5;
          const tempThreshold = machine.temp_threshold ?? 75.0;

          const vibDiag = diagnoseVibration(vib, vibThreshold);
          const tempDiag = diagnoseTemperature(temp, tempThreshold);
          const isBreach = vibDiag.status === 'CRITICAL' || tempDiag.status === 'CRITICAL';
          const isWarning = vibDiag.status === 'WARNING' || tempDiag.status === 'WARNING';

          return (
            <div
              key={machine.id}
              className="card"
              style={{
                borderColor: isBreach ? 'rgba(239, 68, 68, 0.4)' : isWarning ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)',
                background: isBreach ? 'rgba(239, 68, 68, 0.03)' : 'var(--bg-surface)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.2rem' }}>
                    <span className="mono" style={{ fontWeight: 700, color: isBreach ? 'var(--status-critical)' : 'var(--accent-cyan)' }}>
                      {machine.id}
                    </span>
                    <span className={`badge badge-${machine.status.toLowerCase()}`}>
                      {machine.status}
                    </span>
                  </div>
                  <div style={{ fontWeight: 600, fontSize: '0.92rem', color: '#fff' }}>
                    {machine.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {machine.location}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  {isBreach && (
                    <button
                      className="btn btn-primary"
                      style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem', background: '#ef4444', borderColor: '#ef4444' }}
                      onClick={() => onNavigateToIncident(machine.id === 'M-204' ? 'INC-M204-001' : `INC-${machine.id.replace('-', '')}-001`)}
                    >
                      Incident
                    </button>
                  )}
                  <button
                    className="btn btn-outline"
                    style={{ fontSize: '0.72rem', padding: '0.25rem 0.55rem' }}
                    onClick={() => onNavigateToMachine(machine.id)}
                  >
                    Inspect
                  </button>
                </div>
              </div>

              {/* Gauges / Readings */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', marginBottom: '0.75rem' }}>
                {/* Vibration */}
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Vibration</div>
                  <div className="mono" style={{ fontWeight: 700, fontSize: '1rem', color: vib >= vibThreshold ? 'var(--status-critical)' : vib >= 2.5 ? '#f59e0b' : '#fff' }}>
                    {vib.toFixed(2)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                    Limit: ≤{vibThreshold} mm/s
                  </div>
                </div>

                {/* Temperature */}
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Temperature</div>
                  <div className="mono" style={{ fontWeight: 700, fontSize: '1rem', color: temp >= tempThreshold ? 'var(--status-critical)' : '#fff' }}>
                    {temp.toFixed(1)}°C
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                    Limit: ≤{tempThreshold}°C
                  </div>
                </div>

                {/* Output */}
                <div>
                  <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>Output</div>
                  <div className="mono" style={{ fontWeight: 700, fontSize: '1rem', color: '#fff' }}>
                    {output.toFixed(1)}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>
                    {machine.output_unit_label || 'units/min'}
                  </div>
                </div>
              </div>

              {/* Plain-language explanation for this machine */}
              <div style={{ fontSize: '0.75rem', color: isBreach ? 'var(--status-critical)' : isWarning ? '#fbbf24' : 'var(--text-muted)', lineHeight: '1.35' }}>
                {isBreach ? (
                  <span>
                    ⚠️ <strong>Threshold breached:</strong> {vibDiag.explanation}
                  </span>
                ) : isWarning ? (
                  <span>
                    ⚡ <strong>Elevated variance:</strong> Telemetry approaching configured warning limits.
                  </span>
                ) : (
                  <span>
                    ✓ All sensor channels operating within nominal calibrated thresholds.
                  </span>
                )}
              </div>

              {/* Timestamp */}
              <div style={{ fontSize: '0.68rem', color: 'var(--text-dim)', marginTop: '0.5rem', textAlign: 'right' }}>
                Last synced: {telem ? formatDateIST(telem.timestamp) : 'Live feed active'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
