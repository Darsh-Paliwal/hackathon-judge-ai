"use client";

import { useState } from 'react';
import { Settings, Download, Cpu, Sliders } from 'lucide-react';
import styles from '../app/Home.module.css'; // Reusing panel styles

interface JudgeControlsProps {
    onExport: () => void;
}

export default function JudgeControls({ onExport }: JudgeControlsProps) {
    const [aiMode, setAiMode] = useState(true);
    const [threshold, setThreshold] = useState(70);

    return (
        <div className="glass-panel" style={{
            padding: '1.5rem',
            marginBottom: 'var(--spacing-8)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '2rem',
            alignItems: 'center',
            justifyContent: 'space-between'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                    width: '40px', height: '40px',
                    borderRadius: '8px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--primary)'
                }}>
                    <Settings size={20} />
                </div>
                <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '2px' }}>Control Panel</h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Adjust evaluation parameters</p>
                </div>
            </div>

            {/* Controls Group */}
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', flex: 1, justifyContent: 'center' }}>

                {/* AI Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setAiMode(!aiMode)}>
                    <div style={{
                        width: '42px', height: '24px',
                        background: aiMode ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                        borderRadius: '12px',
                        position: 'relative',
                        transition: '0.2s'
                    }}>
                        <div style={{
                            width: '20px', height: '20px',
                            background: 'white',
                            borderRadius: '50%',
                            position: 'absolute',
                            top: '2px',
                            left: aiMode ? '20px' : '2px',
                            transition: '0.2s'
                        }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        AI Assistance {aiMode ? 'ON' : 'OFF'}
                    </span>
                </div>

                {/* Threshold Slider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Cutoff Score: {threshold}</span>
                    <input
                        type="range"
                        min="50" max="90" step="5"
                        value={threshold}
                        onChange={(e) => setThreshold(parseInt(e.target.value))}
                        style={{ accentColor: 'var(--primary)', width: '120px' }}
                    />
                </div>
            </div>

            <button
                onClick={onExport}
                className="premium-button"
                style={{
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid var(--border-color)',
                    padding: '0.6rem 1.2rem',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                }}
            >
                <Download size={16} /> Export CSV
            </button>
        </div>
    );
}
