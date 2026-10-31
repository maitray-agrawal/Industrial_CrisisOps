import React, { useState } from 'react';
import { apiService } from '../services/api';
import {
  SlidersIcon,
  PlayIcon,
  FastForwardIcon,
  RotateCcwIcon,
  CheckCircleIcon,
  ShieldCheckIcon,
  CpuIcon
} from '../components/Icons';

export const SettingsPage: React.FC = () => {
  const [simActionNotice, setSimActionNotice] = useState<string | null>(null);
  const [vibLimit, setVibLimit] = useState<number>(4.5);
  const [tempLimit, setTempLimit] = useState<number>(75.0);
  const [autoRefreshSec, setAutoRefreshSec] = useState<number>(4);
  const [soundAlerts, setSoundAlerts] = useState<boolean>(true);

  const showSimNotice = (msg: string) => {
    setSimActionNotice(msg);
    setTimeout(() => setSimActionNotice(null), 4000);
  };

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Plant Configuration & Demonstration Deck</h1>
            <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
              CHAKAN MIDC SPECIFICATION
            </span>
          </div>
          <p className="page-subtitle">
            Operating Thresholds, Shift Scheduling, Zero-Trust Safety Governance & Simulation Scenario Controls
          </p>
        </div>
      </div>

      {simActionNotice && (
        <div style={{ padding: '0.75rem 1rem', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.4)', borderRadius: 'var(--radius-sm)', color: '#4ade80', fontSize: '0.84rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircleIcon size={15} /> {simActionNotice}
        </div>
      )}

      {/* SIMULATION CONTROLS DECK */}
      <div className="card" style={{ marginBottom: '1.5rem', border: '1px solid rgba(6, 182, 212, 0.4)', background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, rgba(15, 23, 42, 0.95) 100%)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <span className="badge" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)', borderColor: 'rgba(6, 182, 212, 0.4)', marginBottom: '0.35rem' }}>
              SIMULATION SCENARIO DECK
            </span>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', margin: '0.2rem 0' }}>
              Scenario: PMP-204 Coolant Pump Bearing Degradation
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
              Injects deterministic vibration and thermal anomalies to demonstrate end-to-end multi-agent AI response.
            </p>
          </div>
          <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
            API: /api/simulation
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          {/* Trigger Failure */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff', marginBottom: '0.25rem' }}>Trigger Failure Scenario</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Injects 7.82 mm/s vibration jump and generates active CRITICAL incident ticket for PMP-204.
            </p>
            <button
              className="btn"
              style={{ width: '100%', background: 'linear-gradient(135deg, #ef4444, #b91c1c)', color: '#fff', fontSize: '0.8rem', padding: '0.5rem' }}
              onClick={async () => {
                try {
                  await apiService.triggerDegradation();
                  window.dispatchEvent(new Event('simulation-updated'));
                  showSimNotice('PMP-204 bearing degradation triggered. Active incident loaded.');
                } catch (e: any) {
                  showSimNotice(`Error: ${e.message}`);
                }
              }}
            >
              <PlayIcon size={14} /> Trigger PMP-204 Fault
            </button>
          </div>

          {/* Advance Simulation */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff', marginBottom: '0.25rem' }}>Advance Time Step</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Advances plant telemetry clock by 1 discrete time step across all 10 monitored assets.
            </p>
            <button
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem', borderColor: 'var(--accent-blue)', color: '#60a5fa' }}
              onClick={async () => {
                try {
                  await apiService.triggerSimulationTick();
                  window.dispatchEvent(new Event('simulation-updated'));
                  showSimNotice('Plant telemetry stream advanced by 1 step.');
                } catch (e: any) {
                  showSimNotice(`Error: ${e.message}`);
                }
              }}
            >
              <FastForwardIcon size={14} /> Advance Telemetry Tick
            </button>
          </div>

          {/* Reset Baseline */}
          <div style={{ background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '1rem' }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#fff', marginBottom: '0.25rem' }}>Reset to Nominal Baseline</div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Restores nominal sensor registers and resets scenario database to initial plant state.
            </p>
            <button
              className="btn btn-outline"
              style={{ width: '100%', fontSize: '0.8rem', padding: '0.5rem', borderColor: 'var(--border-color)', color: 'var(--text-muted)' }}
              onClick={async () => {
                try {
                  await apiService.resetSimulation();
                  window.dispatchEvent(new Event('simulation-updated'));
                  showSimNotice('Plant simulation reset to nominal baseline state.');
                } catch (e: any) {
                  showSimNotice(`Error: ${e.message}`);
                }
              }}
            >
              <RotateCcwIcon size={14} /> Reset Scenario
            </button>
          </div>
        </div>
      </div>

      {/* PLANT OPERATING CONFIGURATION & THRESHOLDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem', marginBottom: '1.5rem' }}>
        {/* Plant Metadata */}
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CpuIcon size={14} /> Plant Manufacturing Specification
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.82rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Facility Name</span>
              <strong style={{ color: '#fff' }}>Pune Automotive Components Manufacturing Plant</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Location</span>
              <strong style={{ color: '#fff' }}>Chakan MIDC Industrial Area, Pune, Maharashtra, India</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Operating Pattern</span>
              <strong style={{ color: '#fff' }}>Three Shifts • 24-Hour Continuous Automotive Precision Line</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Shift Hours</span>
              <span style={{ color: '#cbd5e1' }}>Shift 1 (06:00–14:00), Shift 2 (14:00–22:00), Shift 3 (22:00–06:00 IST)</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)', display: 'block', fontSize: '0.72rem' }}>Default Currency & Formatting</span>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>Indian Rupee (₹) • Lakhs / Crores notation</span>
            </div>
          </div>
        </div>

        {/* Configurable Sensor Alarm Limits */}
        <div className="card">
          <div className="card-title">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <SlidersIcon size={14} /> Configurable Alarm Thresholds
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>Vibration Emergency Limit</span>
                <span className="mono" style={{ color: 'var(--status-critical)', fontWeight: 700 }}>{vibLimit.toFixed(1)} mm/s RMS</span>
              </div>
              <input
                type="range"
                min="2.0"
                max="8.0"
                step="0.1"
                value={vibLimit}
                onChange={(e) => setVibLimit(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                ISO 10816 Class II industrial equipment limit.
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>Bearing Temperature Thermal Alert</span>
                <span className="mono" style={{ color: 'var(--status-critical)', fontWeight: 700 }}>{tempLimit.toFixed(1)} °C</span>
              </div>
              <input
                type="range"
                min="50.0"
                max="95.0"
                step="1.0"
                value={tempLimit}
                onChange={(e) => setTempLimit(parseFloat(e.target.value))}
                style={{ width: '100%' }}
              />
              <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '0.2rem' }}>
                Standard thermal cutoff for high-viscosity synthetic lubrication.
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.3rem' }}>
                <span style={{ color: '#fff', fontWeight: 600 }}>SCADA Telemetry Polling Rate</span>
                <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 700 }}>{autoRefreshSec}s</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={autoRefreshSec}
                onChange={(e) => setAutoRefreshSec(parseInt(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
              <span style={{ color: '#fff', fontWeight: 600 }}>Audible Klaxon Sound Alerts</span>
              <input
                type="checkbox"
                checked={soundAlerts}
                onChange={(e) => setSoundAlerts(e.target.checked)}
              />
            </div>

            <button
              className="btn btn-outline"
              style={{ fontSize: '0.78rem', alignSelf: 'flex-start' }}
              onClick={() => showSimNotice('Operating preferences and threshold limits updated.')}
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>

      {/* ZERO-TRUST OPERATIONAL GOVERNANCE PARAMETERS */}
      <div className="card">
        <div className="card-header-label">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <ShieldCheckIcon size={14} /> Zero-Trust Safety Invariants & Cryptographic Policy
          </span>
          <span className="badge badge-normal">ENFORCED</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Human-in-the-Loop Safety Gate</div>
            <div style={{ fontWeight: 600, color: '#fff', marginTop: '0.2rem', fontSize: '0.86rem' }}>Strict Supervisor Signoff Policy</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--status-normal)', marginTop: '0.25rem' }}>HTTP 403 Forbidden enforced on unapproved actuation</div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tamper-Evident Ledger Protocol</div>
            <div style={{ fontWeight: 600, color: '#fff', marginTop: '0.2rem', fontSize: '0.86rem' }}>SHA-256 Hash Chain Integrity</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginTop: '0.25rem' }}>Verified in-browser via Web Crypto API</div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Adaptive Agent Loop</div>
            <div style={{ fontWeight: 600, color: '#fff', marginTop: '0.2rem', fontSize: '0.86rem' }}>Dynamic Tool Selection Registry</div>
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '0.25rem' }}>Precondition failure recovery & goal verification</div>
          </div>
        </div>
      </div>
    </div>
  );
};
