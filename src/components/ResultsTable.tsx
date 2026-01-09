import { ChevronDown, Check, X, AlertTriangle, RefreshCcw, Shield, Gavel, Trash2 } from 'lucide-react';
import { useState } from 'react';
import styles from './ResultsTable.module.css';

interface Result {
    id: number;
    team_name: string;
    team_id?: string;
    track?: string;
    total_score: number;
    ai_verdict: string;
    admin_verdict: string;
    evaluation: {
        scores: Record<string, number>;
        missing_sections: string[];
        strengths: string[];
        weaknesses: string[];
    };
}

interface ResultsTableProps {
    results: Result[];
    readOnly?: boolean;
    onVerdictUpdate?: () => void;
}

export default function ResultsTable({ results, readOnly = false, onVerdictUpdate }: ResultsTableProps) {
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [updatingId, setUpdatingId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const handleVerdictChange = async (id: number, newVerdict: string) => {
        if (readOnly) return;
        setUpdatingId(id);
        try {
            await fetch('/api/verdict', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, verdict: newVerdict })
            });
            if (onVerdictUpdate) onVerdictUpdate();
        } catch (err) {
            console.error("Failed to update verdict", err);
        } finally {
            setUpdatingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this submission? This cannot be undone.")) return;

        try {
            const res = await fetch('/api/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            });

            if (res.ok) {
                if (onVerdictUpdate) onVerdictUpdate(); // Reuse refresh logic
            } else {
                alert("Failed to delete submission");
            }
        } catch (err) {
            console.error("Failed to delete", err);
            alert("Error deleting submission");
        }
    };

    if (results.length === 0) {
        return (
            <div className={styles.emptyState}>
                No submissions evaluated yet. Upload a PPT file above to begin.
            </div>
        )
    }

    return (
        <div className={styles.wrapper}>
            <table className={styles.tableContainer}>
                <thead>
                    <tr className={styles.headerRow}>
                        <th>Rank</th>
                        <th>Team Details</th>
                        <th>Score</th>
                        <th>AI Verdict</th>
                        <th>Final Decision</th>
                    </tr>
                </thead>
                <tbody>
                    {results.map((item, index) => (
                        <>
                            <tr
                                key={item.id}
                                onClick={() => toggleExpand(item.id)}
                                className={`${styles.row} ${expandedId === item.id ? styles.expanded : ''}`}
                            >
                                <td className={styles.cell}>
                                    <span className={styles.rank}>#{String(index + 1).padStart(2, '0')}</span>
                                </td>
                                <td className={styles.cell}>
                                    <div className={styles.teamCell}>
                                        <div className={`${styles.statusIndicator} ${item.admin_verdict === 'SHORTLIST' ? styles.statusShortlist : item.admin_verdict === 'REJECT' ? styles.statusReject : ''}`} />
                                        <div>
                                            <div style={{ fontWeight: 600 }}>{item.team_name}</div>
                                            {(item.team_id || item.track) && (
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', display: 'flex', gap: '8px' }}>
                                                    {item.team_id && <span>ID: {item.team_id}</span>}
                                                    {item.track && <span>Track: {item.track}</span>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className={styles.cell}>
                                    <span className={`${styles.scoreBadge} ${item.total_score >= 120 ? styles.scoreHigh : item.total_score >= 90 ? styles.scoreMid : styles.scoreLow
                                        }`}>
                                        {item.total_score}
                                    </span>
                                    <span style={{ fontSize: '0.8em', color: 'var(--text-muted)', marginLeft: '4px' }}>/ 150</span>
                                </td>
                                <td className={styles.cell}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', opacity: 0.8 }}>
                                        {item.ai_verdict === 'SHORTLIST' ? <Check size={14} color="var(--success)" /> : <X size={14} color="var(--error)" />}
                                        <span style={{ fontSize: '0.85rem' }}>{item.ai_verdict}</span>
                                    </div>
                                </td>
                                <td className={styles.cell} onClick={(e) => e.stopPropagation()}>
                                    {readOnly ? (
                                        <span className={`${styles.verdictBadge} ${item.admin_verdict === 'SHORTLIST' ? styles.verdictShortlist : item.admin_verdict === 'REJECT' ? styles.verdictReject : styles.verdictHold}`}>
                                            {item.admin_verdict}
                                        </span>
                                    ) : (
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div className="relative inline-block">
                                                <select
                                                    className={styles.verdictSelect}
                                                    value={item.admin_verdict}
                                                    onChange={(e) => handleVerdictChange(item.id, e.target.value)}
                                                    disabled={updatingId === item.id}
                                                    style={{
                                                        background: item.admin_verdict === 'SHORTLIST' ? 'rgba(16, 185, 129, 0.1)' :
                                                            item.admin_verdict === 'REJECT' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                                        color: item.admin_verdict === 'SHORTLIST' ? '#34d399' :
                                                            item.admin_verdict === 'REJECT' ? '#f87171' : 'var(--text-primary)',
                                                        border: '1px solid var(--border-color)',
                                                        padding: '4px 8px',
                                                        borderRadius: '6px',
                                                        fontSize: '0.85rem',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    <option value="SHORTLIST">SHORTLIST</option>
                                                    <option value="REJECT">REJECT</option>
                                                    <option value="HOLD">HOLD</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleDelete(item.id);
                                                }}
                                                className={styles.deleteButton}
                                                title="Delete Submission"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    )}
                                </td>
                            </tr>

                            {/* Expanded Row */}
                            {expandedId === item.id && (
                                <tr className={styles.expandedRow}>
                                    <td colSpan={5} className={styles.cellDetails}>
                                        <div className={styles.detailsGrid}>

                                            {/* Left Col: Scores */}
                                            <div>
                                                <div className={styles.sectionTitle}>
                                                    Score Breakdown <span className={styles.sectionLine} />
                                                </div>
                                                <div>
                                                    {Object.entries(item.evaluation.scores).map(([key, score]) => (
                                                        <div key={key} className={styles.scoreItem}>
                                                            <div className={styles.scoreLabel}>
                                                                <span style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                                                                <span className={styles.scoreValue}>{score} / 30</span>
                                                            </div>
                                                            <div className={styles.progressBar}>
                                                                <div className={styles.progressFill} style={{ width: `${(score / 30) * 100}%` }}></div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Right Col: Insights Grid */}
                                            <div>
                                                <div className={styles.sectionTitle}>
                                                    AI Assessment <span className={styles.sectionLine} />
                                                </div>

                                                <div className={styles.insightsGrid}>
                                                    {/* Critical Gaps */}
                                                    {item.evaluation.missing_sections?.length > 0 && (
                                                        <div className={styles.insightCard}>
                                                            <div className={`${styles.cardTitle} ${styles.gap}`}>
                                                                <AlertTriangle size={16} /> Critical Gaps
                                                            </div>
                                                            <ul className={styles.list}>
                                                                {item.evaluation.missing_sections.map((s, i) => (
                                                                    <li key={i} className={styles.listItem}>{s}</li>
                                                                ))}
                                                            </ul>
                                                        </div>
                                                    )}

                                                    {/* Strengths */}
                                                    <div className={styles.insightCard}>
                                                        <div className={`${styles.cardTitle} ${styles.strength}`}>
                                                            <Check size={16} /> Strengths
                                                        </div>
                                                        <ul className={styles.list}>
                                                            {item.evaluation.strengths?.slice(0, 3).map((s, i) => (
                                                                <li key={i} className={styles.listItem}>{s}</li>
                                                            ))}
                                                        </ul>
                                                    </div>

                                                    {/* Weaknesses */}
                                                    <div className={styles.insightCard}>
                                                        <div className={`${styles.cardTitle} ${styles.weakness}`}>
                                                            <RefreshCcw size={16} /> Improvement
                                                        </div>
                                                        <ul className={styles.list}>
                                                            {item.evaluation.weaknesses?.slice(0, 3).map((s, i) => (
                                                                <li key={i} className={styles.listItem}>{s}</li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>

                                        </div>
                                    </td>
                                </tr>
                            )}
                        </>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
