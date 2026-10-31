import React, { useEffect, useState } from 'react';
import { apiService } from '../services/api';
import { SOPDocument } from '../types';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { ErrorAlert } from '../components/ErrorAlert';
import {
  RefreshCwIcon,
  SearchIcon,
  ShieldCheckIcon
} from '../components/Icons';

export const SopLibraryPage: React.FC = () => {
  const [sops, setSops] = useState<SOPDocument[]>([]);
  const [selectedSop, setSelectedSop] = useState<SOPDocument | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const loadSOPs = async (showLoading = false) => {
    if (showLoading) setLoading(true);
    setError(null);
    try {
      const data = await apiService.getSOPs();
      setSops(data);
      if (data.length > 0 && !selectedSop) {
        setSelectedSop(data[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load Standard Operating Procedures.');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    loadSOPs(true);
  }, []);

  if (loading && sops.length === 0) {
    return <LoadingSpinner message="Querying SOP vector knowledge repository..." />;
  }

  if (error) return <ErrorAlert message={error} onRetry={() => loadSOPs(true)} />;

  const filteredSops = sops.filter(s => {
    const q = searchQuery.toLowerCase();
    return (
      s.title.toLowerCase().includes(q) ||
      s.sop_code.toLowerCase().includes(q) ||
      s.target_component.toLowerCase().includes(q) ||
      s.content_markdown.toLowerCase().includes(q)
    );
  });

  return (
    <div className="page-container">
      {/* Top Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <h1 className="page-title">Standard Operating Procedures (SOP Library)</h1>
            <span className="badge badge-normal" style={{ fontSize: '0.7rem' }}>
              8 INDEXED PROCEDURES
            </span>
          </div>
          <p className="page-subtitle">
            Digitized Engineering Operating Standards, Emergency Containment Protocols & LOTO Safety Checklists
          </p>
        </div>
        <div>
          <button
            className="btn btn-outline"
            onClick={() => loadSOPs(true)}
            style={{ fontSize: '0.8rem', padding: '0.45rem 0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <RefreshCwIcon size={14} /> Refresh Library
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Left: Search & SOP List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Search Box */}
          <div style={{ display: 'flex', alignItems: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.5rem 0.75rem', gap: '0.5rem' }}>
            <SearchIcon size={15} color="var(--text-muted)" />
            <input
              type="text"
              placeholder="Search SOP by code, machine, component..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '0.82rem', outline: 'none', width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '680px', overflowY: 'auto' }}>
            {filteredSops.map((sopDoc) => {
              const isSelected = selectedSop?.id === sopDoc.id;
              return (
                <div
                  key={sopDoc.id}
                  className={`card ${isSelected ? 'ai-card-highlight' : ''}`}
                  style={{
                    cursor: 'pointer',
                    borderColor: isSelected ? 'var(--accent-cyan)' : 'var(--border-color)',
                    backgroundColor: isSelected ? 'rgba(6, 182, 212, 0.06)' : 'var(--bg-surface)',
                    padding: '0.85rem'
                  }}
                  onClick={() => setSelectedSop(sopDoc)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                    <span className="mono" style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>
                      {sopDoc.sop_code}
                    </span>
                    <span className="badge badge-normal" style={{ fontSize: '0.62rem' }}>
                      INDEXED
                    </span>
                  </div>

                  <div style={{ fontWeight: 600, fontSize: '0.86rem', color: '#fff', marginBottom: '0.2rem' }}>
                    {sopDoc.title}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Target: <strong style={{ color: '#cbd5e1' }}>{sopDoc.target_component}</strong>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active SOP Content Viewer */}
        {selectedSop ? (
          <div className="card" style={{ gridColumn: 'span 2', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.85rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <span className="mono" style={{ color: 'var(--accent-cyan)', fontWeight: 700, fontSize: '0.9rem' }}>
                  {selectedSop.sop_code}
                </span>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 700, color: '#fff', margin: '0.25rem 0' }}>
                  {selectedSop.title}
                </h2>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  Target Component: <strong style={{ color: '#fff' }}>{selectedSop.target_component}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span className="badge badge-normal" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                  <ShieldCheckIcon size={12} /> Plant Safety Verified
                </span>
              </div>
            </div>

            {/* Markdown Body */}
            <div
              style={{
                background: 'var(--bg-surface-elevated)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.86rem',
                lineHeight: '1.6',
                color: '#e2e8f0',
                whiteSpace: 'pre-wrap',
                fontFamily: 'var(--font-sans)',
                maxHeight: '540px',
                overflowY: 'auto'
              }}
            >
              {selectedSop.content_markdown}
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem', color: 'var(--text-dim)' }}>
              <span>Applicable to Pune Automotive Components Plant (Chakan MIDC)</span>
              <span>Controlled Engineering Document • Rev 4.2</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
