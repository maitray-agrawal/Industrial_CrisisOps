import React, { useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { DemoGuideModal } from './DemoGuideModal';
import {
  SearchIcon,
  ShieldCheckIcon,
  ActivityIcon,
  AlertTriangleIcon,
  CpuIcon,
  BookOpenIcon,
  TrendingUpIcon,
  SlidersIcon,
  CompassIcon,
  BrainIcon,
  EyeIcon,
  BarChartIcon,
  UserIcon,
  ClockIcon
} from './Icons';

export type NavigationTab =
  | 'overview'
  | 'dashboard'
  | 'incidents'
  | 'machines'
  | 'monitoring'
  | 'predictive'
  | 'sops'
  | 'investigation'
  | 'analytics'
  | 'audit'
  | 'settings';

export type UserRole = 'operator' | 'engineer' | 'supervisor' | 'manager';

interface LayoutProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  children: React.ReactNode;
  activeIncidentCount?: number;
  pendingApprovalCount?: number;
  activeRole?: UserRole;
  onChangeRole?: (role: UserRole) => void;
}

export const Layout: React.FC<LayoutProps> = ({
  currentTab,
  onSelectTab,
  children,
  activeIncidentCount = 1,
  pendingApprovalCount = 1,
  activeRole = 'operator',
  onChangeRole
}) => {
  const [isDemoGuideOpen, setIsDemoGuideOpen] = useState<boolean>(false);
  const [systemHealthy, setSystemHealthy] = useState<boolean | null>(true);
  const [currentISTTime, setCurrentISTTime] = useState<string>('');

  // Normalize tab for active state comparison
  const normalizedTab = currentTab === 'dashboard' ? 'overview' : currentTab;

  useEffect(() => {
    // Update live IST clock every second
    const updateTime = () => {
      const now = new Date();
      const formatted = now.toLocaleTimeString('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
      const datePart = now.toLocaleDateString('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      setCurrentISTTime(`${datePart}, ${formatted} IST`);
    };

    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let isMounted = true;
    const checkSystemHealth = async () => {
      try {
        const health = await apiService.checkHealth();
        if (isMounted) {
          setSystemHealthy(health.status === 'healthy' || health.status === 'ok');
        }
      } catch {
        if (isMounted) {
          setSystemHealthy(false);
        }
      }
    };

    checkSystemHealth();
    const interval = setInterval(checkSystemHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const roleLabels: Record<UserRole, { title: string; subtitle: string }> = {
    operator: { title: 'Plant Operator', subtitle: 'Shift 2 • Machining Line B' },
    engineer: { title: 'Maintenance Engineer', subtitle: 'Mechanical & Hydraulics Team' },
    supervisor: { title: 'Shift Supervisor', subtitle: 'Safety & Actuation Authority' },
    manager: { title: 'Plant Manager', subtitle: 'Operations & Reliability Head' }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-dark)' }}>
      {/* Topmost Industrial Simulation Disclaimer Banner */}
      <div className="demo-env-banner">
        <div className="demo-env-tag">
          <span className="pulsate-dot" style={{ backgroundColor: '#f59e0b', boxShadow: '0 0 6px #f59e0b' }} />
          <span>DEMO DATA — SIMULATED INDUSTRIAL ENVIRONMENT</span>
          <span style={{ color: 'var(--text-dim)', margin: '0 0.4rem' }}>•</span>
          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>Pune Automotive Components Plant, Chakan MIDC, Maharashtra</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <ClockIcon size={12} color="var(--accent-cyan)" />
            <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>{currentISTTime || 'Asia/Kolkata (IST)'}</span>
          </span>
          <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>3 Shifts / 24h Production</span>
        </div>
      </div>

      <div className="app-layout" style={{ flex: 1 }}>
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">CO</div>
            <div>
              <div className="sidebar-brand-title">CrisisOps</div>
              <div className="sidebar-brand-sub">Industrial AI Platform</div>
            </div>
          </div>

          <nav className="sidebar-nav">
            <div className="nav-section-title">Operational Workspace</div>

            {/* 1. Overview */}
            <button
              className={`sidebar-item ${normalizedTab === 'overview' ? 'active' : ''}`}
              onClick={() => onSelectTab('overview')}
            >
              <span className="sidebar-item-label">
                <span className="item-icon"><ActivityIcon size={16} /></span>
                Overview
              </span>
            </button>

            {/* 2. Incidents */}
            <button
              className={`sidebar-item ${normalizedTab === 'incidents' ? 'active' : ''}`}
              onClick={() => onSelectTab('incidents')}
            >
              <span className="sidebar-item-label">
                <span className="item-icon"><AlertTriangleIcon size={16} /></span>
                Incidents
              </span>
              {activeIncidentCount > 0 && (
                <span className="sidebar-item-badge">{activeIncidentCount}</span>
              )}
              {pendingApprovalCount > 0 && (
                <span className="badge badge-warning" style={{ fontSize: '0.62rem', padding: '1px 5px', marginLeft: 'auto' }} title={`${pendingApprovalCount} pending supervisor approval`}>
                  {pendingApprovalCount} pend
                </span>
              )}
            </button>

            {/* 3. Machines */}
            <button
              className={`sidebar-item ${normalizedTab === 'machines' ? 'active' : ''}`}
              onClick={() => onSelectTab('machines')}
            >
              <span className="sidebar-item-label">
                <span className="item-icon"><CpuIcon size={16} /></span>
                Machines
              </span>
            </button>

            {/* 4. Live Monitoring */}
            <button
              className={`sidebar-item ${normalizedTab === 'monitoring' ? 'active' : ''}`}
              onClick={() => onSelectTab('monitoring')}
            >
              <span className="sidebar-item-label">
                <span className="item-icon"><EyeIcon size={16} /></span>
                Live Monitoring
              </span>
            </button>

            {/* 5. Predictive Maintenance */}
            <button
              className={`sidebar-item ${normalizedTab === 'predictive' ? 'active' : ''}`}
              onClick={() => onSelectTab('predictive')}
            >
              <span className="sidebar-item-label">
                <span className="item-icon"><TrendingUpIcon size={16} /></span>
                Predictive Maint.
              </span>
            </button>

            <div className="nav-section-title">Procedures & Intelligence</div>

            {/* 6. SOP Library */}
            <button
              className={`sidebar-item ${normalizedTab === 'sops' ? 'active' : ''}`}
              onClick={() => onSelectTab('sops')}
            >
              <span className="sidebar-item-label">
                <span className="item-icon"><BookOpenIcon size={16} /></span>
                SOP Library
              </span>
            </button>

            {/* 7. AI Investigation */}
            <button
              className={`sidebar-item ${normalizedTab === 'investigation' ? 'active' : ''}`}
              onClick={() => onSelectTab('investigation')}
            >
              <span className="sidebar-item-label">
                <span className="item-icon"><BrainIcon size={16} /></span>
                AI Investigation
              </span>
            </button>

            {/* 8. Reports & Analytics */}
            <button
              className={`sidebar-item ${normalizedTab === 'analytics' ? 'active' : ''}`}
              onClick={() => onSelectTab('analytics')}
            >
              <span className="sidebar-item-label">
                <span className="item-icon"><BarChartIcon size={16} /></span>
                Reports & Analytics
              </span>
            </button>

            {/* 9. Audit History */}
            <button
              className={`sidebar-item ${normalizedTab === 'audit' ? 'active' : ''}`}
              onClick={() => onSelectTab('audit')}
            >
              <span className="sidebar-item-label">
                <span className="item-icon"><ShieldCheckIcon size={16} /></span>
                Audit History
              </span>
            </button>

            <div className="nav-section-title">System</div>

            {/* 10. Settings */}
            <button
              className={`sidebar-item ${normalizedTab === 'settings' ? 'active' : ''}`}
              onClick={() => onSelectTab('settings')}
            >
              <span className="sidebar-item-label">
                <span className="item-icon"><SlidersIcon size={16} /></span>
                Settings
              </span>
            </button>
          </nav>

          <div className="sidebar-footer">
            <div style={{ color: 'var(--text-bright)', fontWeight: 600, fontSize: '0.8rem' }}>Pune Plant • Chakan MIDC</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>Shift 2 • 14:00 - 22:00 IST</div>
            <button
              onClick={() => setIsDemoGuideOpen(true)}
              className="btn btn-outline"
              style={{
                width: '100%',
                marginTop: '0.75rem',
                padding: '0.4rem 0.6rem',
                fontSize: '0.75rem',
                borderColor: 'rgba(6, 182, 212, 0.4)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
              title="Launch Hackathon Demo Walkthrough Guide"
            >
              <CompassIcon size={14} /> Hackathon Demo Guide
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="main-wrapper">
          {/* Top Header Bar */}
          <header className="top-header">
            <div className="search-box">
              <SearchIcon size={15} color="var(--text-muted)" />
              <input type="text" placeholder="Search machines, incidents, SOPs, sensors..." readOnly />
              <span className="search-shortcut">Ctrl+K</span>
            </div>

            <div className="top-header-actions">
              {/* System Health Status */}
              <div
                className="system-online-badge"
                style={{
                  background: systemHealthy === false ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                  borderColor: systemHealthy === false ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                  color: systemHealthy === false ? 'var(--status-critical)' : 'var(--status-normal)'
                }}
              >
                <span
                  className="pulsate-dot"
                  style={{
                    backgroundColor: systemHealthy === false ? 'var(--status-critical)' : 'var(--status-normal)',
                    boxShadow: `0 0 10px ${systemHealthy === false ? 'var(--status-critical)' : 'var(--status-normal)'}`
                  }}
                />
                <span>{systemHealthy === false ? 'API OFFLINE' : 'SYSTEM ONLINE'}</span>
              </div>

              {/* SHA-256 Ledger Status Badge */}
              <div
                style={{
                  background: 'rgba(6, 182, 212, 0.1)',
                  border: '1px solid rgba(6, 182, 212, 0.3)',
                  color: 'var(--accent-cyan)',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  padding: '0.35rem 0.65rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  letterSpacing: '0.03em'
                }}
              >
                <ShieldCheckIcon size={14} color="var(--accent-cyan)" />
                <span>SHA-256 LEDGER ACTIVE</span>
              </div>

              {/* Role Perspective Selector */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-surface-elevated)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Role:</span>
                <select
                  value={activeRole}
                  onChange={(e) => onChangeRole && onChangeRole(e.target.value as UserRole)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#fff',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value="operator" style={{ background: '#111827', color: '#fff' }}>👷 Plant Operator</option>
                  <option value="engineer" style={{ background: '#111827', color: '#fff' }}>🔧 Maintenance Engineer</option>
                  <option value="supervisor" style={{ background: '#111827', color: '#fff' }}>📋 Shift Supervisor</option>
                  <option value="manager" style={{ background: '#111827', color: '#fff' }}>📊 Plant Manager</option>
                </select>
              </div>

              {/* Operator Identity Card */}
              <div className="operator-profile">
                <div className="avatar-circle">
                  <UserIcon size={14} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#fff', lineHeight: 1.2 }}>
                    {roleLabels[activeRole].title}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {roleLabels[activeRole].subtitle}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main View Container */}
          <main style={{ flex: 1, padding: '1.25rem 1.5rem' }}>
            {children}
          </main>
        </div>

        {/* Hackathon Demo Guide Modal */}
        <DemoGuideModal
          isOpen={isDemoGuideOpen}
          onClose={() => setIsDemoGuideOpen(false)}
          onNavigateToTab={(tab) => {
            onSelectTab(tab as NavigationTab);
          }}
        />
      </div>
    </div>
  );
};
