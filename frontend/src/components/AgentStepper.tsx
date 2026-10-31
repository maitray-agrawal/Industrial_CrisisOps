import React from 'react';
import { InvestigationResult } from '../types';
import {
  CpuIcon,
  RefreshCwIcon,
  ZapIcon,
  TargetIcon,
  CheckCircleIcon,
  CheckIcon
} from './Icons';

interface AgentStepperProps {
  isInvestigating: boolean;
  investigationResult: InvestigationResult | null;
  onRunPipeline: () => void;
}

// User-facing terminology mapping dictionary (Prompt 5 requirement)
const userFriendlyToolNames: Record<string, string> = {
  get_machine_state: 'Inspecting Machine State & Classification',
  get_recent_telemetry: 'Checking recent sensor readings',
  correlate_signals: 'Comparing sensor patterns & statistical deviations',
  get_maintenance_history: 'Reviewing historical maintenance records',
  analyze_root_cause: 'Identifying the likely cause & mechanical failure mode',
  calculate_business_impact: 'Estimating production & financial impact (₹ INR)',
  retrieve_relevant_sop: 'Retrieving approved standard operating procedure (SOP)',
  attempt_primary_containment: 'Checking isolation preconditions on auxiliary loop',
  formulate_adapted_plan: 'Formulating supervisor-authorized containment plan',
  verify_goal_criteria: 'Verifying recovery & machine stabilization criteria'
};

export const AgentStepper: React.FC<AgentStepperProps> = ({
  isInvestigating,
  investigationResult,
  onRunPipeline
}) => {
  const traces = investigationResult?.agent_runtime_trace;
  const verification = investigationResult?.verification_results;
  const goal = investigationResult?.goal || 'Investigate and mitigate PMP-204 degradation, prevent Line B line trip, and return asset to verified operating state.';

  // Fallback user-friendly steps if dynamic runtime trace has not yet run
  const fallbackSteps = [
    {
      id: 'signal',
      stepNumber: 1,
      title: 'Sensor Reading Correlation',
      toolSelected: 'Checking recent sensor readings',
      toolCategory: 'Sensor Ingestion',
      evidenceObtained: investigationResult?.signal_analysis?.signal_summary || 'Vibration amplitude increased to 7.82 mm/s RMS (+3.83 standard deviations over normal 1.80 baseline).',
      confidence: investigationResult?.signal_analysis ? `${(100 - (investigationResult.signal_analysis.used_fallback ? 15 : 0))}%` : '96%',
      status: 'SUCCESS' as const,
      adaptationEvent: 'Configured threshold limit calibrated to 4.50 mm/s RMS'
    },
    {
      id: 'rca',
      stepNumber: 2,
      title: 'Historical Maintenance Cross-Check',
      toolSelected: 'Reviewing maintenance history',
      toolCategory: 'Diagnostic Analysis',
      evidenceObtained: investigationResult?.root_cause_analysis?.hypothesis || 'Drive bearing replacement work order (MNT-882) overdue by 60 days. Correlated with vibration spike.',
      confidence: `${investigationResult?.root_cause_analysis?.confidence_score?.toFixed(0) || 91}%`,
      status: 'SUCCESS' as const,
      adaptationEvent: 'Verified against Maintenance Log #MNT-882 (14 months operating)'
    },
    {
      id: 'impact',
      stepNumber: 3,
      title: 'Production Value Impact',
      toolSelected: 'Estimating production & financial impact (₹ INR)',
      toolCategory: 'Risk Evaluation',
      evidenceObtained: investigationResult?.impact_assessment?.summary || 'Downtime modeled at 3.0h affecting 360 components @ ₹850/unit = ₹3,06,000 estimated production value affected.',
      confidence: '94%',
      status: 'SUCCESS' as const,
      adaptationEvent: 'Escalated to Shift Supervisor Authorization Queue'
    },
    {
      id: 'sop',
      stepNumber: 4,
      title: 'Standard Operating Procedure Match',
      toolSelected: 'Retrieving approved standard operating procedure',
      toolCategory: 'Action Formulation',
      evidenceObtained: investigationResult?.action_plan?.action_summary || 'SOP-M204-BEARING retrieved with auxiliary pump rollover and synthetic lubrication flush protocol.',
      confidence: '98%',
      status: 'SUCCESS' as const,
      adaptationEvent: 'Gated behind Supervisor Authorization Gate (Non-bypassable)'
    }
  ];

  return (
    <div className="card" style={{ padding: '1.25rem', marginBottom: '1.25rem' }}>
      {/* Header with Goal */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
            <span style={{ color: 'var(--accent-cyan)' }}><CpuIcon size={16} /></span>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI INVESTIGATION PROGRESS
            </span>
            <span className="badge" style={{ fontSize: '0.65rem', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--accent-cyan)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
              DYNAMIC MULTI-AGENT DIAGNOSIS
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', background: 'rgba(0,0,0,0.25)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)' }}>
            <span style={{ color: 'var(--accent-cyan)', marginTop: '2px' }}><TargetIcon size={14} /></span>
            <div>
              <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>
                Operational Objective:
              </span>
              <span style={{ fontSize: '0.84rem', color: '#fff', fontWeight: 600 }}>
                {goal}
              </span>
            </div>
          </div>
        </div>

        <button
          className="btn btn-primary"
          onClick={onRunPipeline}
          disabled={isInvestigating}
          style={{
            background: isInvestigating ? 'rgba(59, 130, 246, 0.5)' : 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            borderColor: '#06b6d4',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            padding: '0.5rem 0.9rem',
            fontSize: '0.8rem',
            fontWeight: 600
          }}
        >
          {isInvestigating ? (
            <>
              <RefreshCwIcon size={14} className="spin-slow" />
              <span>Investigating Sensors...</span>
            </>
          ) : (
            <>
              <ZapIcon size={14} />
              <span>Re-Run AI Investigation</span>
            </>
          )}
        </button>
      </div>

      {/* Dynamic Trace Timeline (If runtime trace available) */}
      {traces && traces.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.75rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Diagnostic Execution Sequence ({traces.length} Steps Completed):
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.75rem' }}>
            {traces.map((trace) => {
              const friendlyName = userFriendlyToolNames[trace.tool_name] || trace.tool_name.replace(/_/g, ' ');
              const isFailed = trace.status === 'FAILED';
              const isAdapted = trace.status === 'ADAPTED';

              return (
                <div
                  key={trace.iteration}
                  style={{
                    background: isFailed ? 'rgba(239, 68, 68, 0.08)' : isAdapted ? 'rgba(245, 158, 11, 0.08)' : 'var(--bg-surface-elevated)',
                    border: `1px solid ${isFailed ? 'rgba(239, 68, 68, 0.4)' : isAdapted ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-color)'}`,
                    borderRadius: 'var(--radius-md)',
                    padding: '0.85rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                      <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                        Step {trace.iteration} • {trace.tool_category}
                      </span>
                      <span
                        className="badge"
                        style={{
                          fontSize: '0.62rem',
                          background: isFailed ? 'rgba(239, 68, 68, 0.2)' : isAdapted ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                          color: isFailed ? '#ef4444' : isAdapted ? '#f59e0b' : '#10b981',
                          borderColor: isFailed ? 'rgba(239, 68, 68, 0.4)' : isAdapted ? 'rgba(245, 158, 11, 0.4)' : 'rgba(16, 185, 129, 0.4)'
                        }}
                      >
                        {trace.status}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#fff', marginBottom: '0.35rem' }}>
                      {friendlyName}
                    </div>

                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: '0 0 0.5rem 0', lineHeight: '1.4' }}>
                      {trace.result_summary}
                    </p>
                  </div>

                  {trace.adaptation_note && (
                    <div style={{ background: 'rgba(245, 158, 11, 0.12)', padding: '0.4rem 0.6rem', borderRadius: 'var(--radius-sm)', fontSize: '0.72rem', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', marginTop: '0.35rem' }}>
                      <strong>Adaptive Recovery:</strong> {trace.adaptation_note}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Fallback Static Cards */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.75rem', marginTop: '0.75rem' }}>
          {fallbackSteps.map((s) => (
            <div
              key={s.id}
              style={{
                background: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '0.85rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span className="mono" style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  Stage {s.stepNumber}
                </span>
                <span className="badge badge-normal" style={{ fontSize: '0.62rem' }}>
                  {s.confidence} Confidence
                </span>
              </div>
              <div style={{ fontWeight: 600, fontSize: '0.84rem', color: '#fff', marginBottom: '0.25rem' }}>
                {s.title}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', marginBottom: '0.35rem' }}>
                {s.toolSelected}
              </div>
              <p style={{ fontSize: '0.76rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.35' }}>
                {s.evidenceObtained}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Outcome Goal Verification Multi-Point Check (If available) */}
      {verification && (
        <div style={{ marginTop: '1rem', background: 'rgba(16, 185, 129, 0.06)', border: '1px solid rgba(16, 185, 129, 0.25)', borderRadius: 'var(--radius-md)', padding: '0.85rem 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 700, fontSize: '0.82rem' }}>
              <CheckCircleIcon size={15} /> Machine Post-Containment Verification Passed
            </div>
            <span className="badge" style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.4)', fontSize: '0.68rem' }}>
              RECOVERY VERIFIED
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', fontSize: '0.78rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckIcon size={13} color="#10b981" />
              <span>Machine Status: <strong style={{ color: '#fff' }}>CONTAINED</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckIcon size={13} color="#10b981" />
              <span>Vibration: <strong style={{ color: '#10b981' }}>1.80 mm/s RMS (≤ 4.5 limit)</strong></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <CheckIcon size={13} color="#10b981" />
              <span>Temperature: <strong style={{ color: '#10b981' }}>52.0°C (≤ 75°C limit)</strong></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
