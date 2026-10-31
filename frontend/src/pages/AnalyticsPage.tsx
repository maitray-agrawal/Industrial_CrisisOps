import React from 'react';
import { BarChartIcon } from '../components/Icons';

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Plant Reliability & Operations Analytics</h1>
            <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
              CHAKAN MIDC AUTOMOTIVE BENCHMARKS
            </span>
          </div>
          <p className="page-subtitle">
            Overall Equipment Effectiveness (OEE), Mean Time Metrics & Downtime Exposure in Indian Rupees (₹)
          </p>
        </div>
      </div>

      {/* Primary OEE & Reliability Metric Cards */}
      <div className="kpi-8-grid">
        {/* Card 1: OEE */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Plant OEE</span>
            <span className="badge badge-normal">World Class &gt;85%</span>
          </div>
          <div className="kpi-card-value mono" style={{ color: '#10b981' }}>
            82.6%
          </div>
          <div className="kpi-card-sub">Overall Equipment Effectiveness</div>
        </div>

        {/* Card 2: Plant Availability */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Line Availability</span>
            <span className="badge badge-warning">Target 95%</span>
          </div>
          <div className="kpi-card-value mono" style={{ color: '#f59e0b' }}>
            88.4%
          </div>
          <div className="kpi-card-sub">Affected by PMP-204 vibration spike</div>
        </div>

        {/* Card 3: Performance Rate */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Performance Rate</span>
            <span className="badge badge-normal">Nominal</span>
          </div>
          <div className="kpi-card-value mono" style={{ color: '#10b981' }}>
            94.2%
          </div>
          <div className="kpi-card-sub">Automotive machining cycle rate</div>
        </div>

        {/* Card 4: Quality Yield */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">First Pass Yield</span>
            <span className="badge badge-normal">Six Sigma</span>
          </div>
          <div className="kpi-card-value mono" style={{ color: '#10b981' }}>
            99.1%
          </div>
          <div className="kpi-card-sub">Machined part dimensional tolerance</div>
        </div>

        {/* Card 5: MTBF */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Mean Time Between Failures</span>
            <span className="badge badge-normal">MTBF</span>
          </div>
          <div className="kpi-card-value mono" style={{ color: '#fff' }}>
            342 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>hrs</span>
          </div>
          <div className="kpi-card-sub">Average runtime between stoppages</div>
        </div>

        {/* Card 6: MTTR */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Mean Time To Repair</span>
            <span className="badge badge-normal">MTTR</span>
          </div>
          <div className="kpi-card-value mono" style={{ color: '#fff' }}>
            2.4 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>hrs</span>
          </div>
          <div className="kpi-card-sub">Average containment & repair time</div>
        </div>

        {/* Card 7: Total Financial Exposure */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Est. Production Value Affected</span>
            <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>Current Shift</span>
          </div>
          <div className="kpi-card-value mono" style={{ color: '#fbbf24' }}>
            ₹3.06 lakh
          </div>
          <div className="kpi-card-sub">₹3,06,000 across 360 units</div>
        </div>

        {/* Card 8: Planned vs Unplanned Downtime */}
        <div className="kpi-card">
          <div className="kpi-card-header">
            <span className="kpi-card-title">Downtime Split</span>
            <span className="badge badge-warning">Unplanned Risk</span>
          </div>
          <div className="kpi-card-value mono" style={{ fontSize: '1.2rem', color: '#fff' }}>
            82% <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Planned / 18% Unplanned</span>
          </div>
          <div className="kpi-card-sub">Target unplanned: &lt;10%</div>
        </div>
      </div>

      {/* Financial Exposure by Machine Table */}
      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <div className="card-title">
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BarChartIcon size={14} color="var(--accent-cyan)" /> Production Value Exposure by Machine Asset (INR ₹)
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Pune Plant Cost Model (120 units/hr @ ₹850 illustrative value)
          </span>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Machine Asset</th>
                <th>Equipment Type</th>
                <th>Est. Downtime</th>
                <th>Units Affected</th>
                <th>Est. Production Value Affected</th>
                <th>Est. Maintenance Cost</th>
                <th>Total Exposure</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: 'rgba(239, 68, 68, 0.05)' }}>
                <td className="mono" style={{ fontWeight: 700, color: 'var(--status-critical)' }}>
                  PMP-204 (M-204)
                </td>
                <td>Centrifugal Coolant Pump</td>
                <td>3.0 hours</td>
                <td className="mono">360 parts</td>
                <td className="mono" style={{ color: '#fbbf24', fontWeight: 600 }}>₹3,06,000</td>
                <td className="mono">₹45,000</td>
                <td className="mono" style={{ color: 'var(--status-critical)', fontWeight: 700 }}>₹3,51,000 (~₹3.51 lakh)</td>
                <td><span className="badge badge-critical">CRITICAL</span></td>
              </tr>
              <tr style={{ background: 'rgba(245, 158, 11, 0.03)' }}>
                <td className="mono" style={{ fontWeight: 700, color: '#f59e0b' }}>
                  CMP-301 (M-305)
                </td>
                <td>Rotary Screw Air Compressor</td>
                <td>1.5 hours</td>
                <td className="mono">180 parts</td>
                <td className="mono" style={{ color: '#fbbf24', fontWeight: 600 }}>₹1,53,000</td>
                <td className="mono">₹18,000</td>
                <td className="mono" style={{ color: '#f59e0b', fontWeight: 700 }}>₹1,71,000 (~₹1.71 lakh)</td>
                <td><span className="badge badge-warning">WARNING</span></td>
              </tr>
              <tr style={{ background: 'rgba(245, 158, 11, 0.03)' }}>
                <td className="mono" style={{ fontWeight: 700, color: '#f59e0b' }}>
                  CNC-101 (M-101)
                </td>
                <td>5-Axis Machining Centre</td>
                <td>0.8 hours</td>
                <td className="mono">96 parts</td>
                <td className="mono" style={{ color: '#fbbf24', fontWeight: 600 }}>₹81,600</td>
                <td className="mono">₹12,000</td>
                <td className="mono" style={{ color: '#f59e0b', fontWeight: 700 }}>₹93,600</td>
                <td><span className="badge badge-warning">WARNING</span></td>
              </tr>
              <tr>
                <td className="mono" style={{ fontWeight: 700, color: 'var(--status-normal)' }}>
                  HYD-105
                </td>
                <td>500T Hydraulic Forming Press</td>
                <td>0.0 hours</td>
                <td className="mono">0 parts</td>
                <td className="mono">₹0</td>
                <td className="mono">₹0</td>
                <td className="mono" style={{ color: 'var(--status-normal)' }}>₹0</td>
                <td><span className="badge badge-normal">NOMINAL</span></td>
              </tr>
              <tr>
                <td className="mono" style={{ fontWeight: 700, color: 'var(--status-normal)' }}>
                  CON-401
                </td>
                <td>Pallet Transfer Conveyor</td>
                <td>0.0 hours</td>
                <td className="mono">0 parts</td>
                <td className="mono">₹0</td>
                <td className="mono">₹0</td>
                <td className="mono" style={{ color: 'var(--status-normal)' }}>₹0</td>
                <td><span className="badge badge-normal">NOMINAL</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* 3-Shift Pattern Performance */}
      <div className="card">
        <div className="card-title">
          <span>Three-Shift Operating Pattern Breakdown (24h Automotive Cycle)</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chakan MIDC Standard Roster</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <strong style={{ color: '#fff', fontSize: '0.86rem' }}>Shift 1: Morning</strong>
              <span className="badge badge-normal">COMPLETED</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>06:00 – 14:00 IST • 8 Hours</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Production Output: <strong>942 units</strong> (Target: 960) • Stoppages: 0
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <strong style={{ color: '#fff', fontSize: '0.86rem' }}>Shift 2: Afternoon (Current)</strong>
              <span className="badge badge-critical">ACTIVE ALERT</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>14:00 – 22:00 IST • 8 Hours</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Production Output: <strong>680 units</strong> (Target: 960) • PMP-204 degradation incident flagged.
            </div>
          </div>

          <div style={{ background: 'var(--bg-surface-elevated)', padding: '1rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <strong style={{ color: '#fff', fontSize: '0.86rem' }}>Shift 3: Night</strong>
              <span className="badge" style={{ background: 'rgba(255,255,255,0.06)' }}>UPCOMING</span>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>22:00 – 06:00 IST • 8 Hours</div>
            <div style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>
              Scheduled Bearing Overhaul window planned for PMP-204 under LOTO safety protocol.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
