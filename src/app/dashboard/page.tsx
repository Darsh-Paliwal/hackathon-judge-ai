"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import FileUpload from "@/components/FileUpload";
import ResultsTable from "@/components/ResultsTable";
import JudgeControls from "@/components/JudgeControls";
import styles from "../Home.module.css";
// We need to import it relative to this file? No, css modules are importable.
// Wait, the file is in src/app/Home.module.css. We are in src/app/dashboard/page.tsx.
// So path is ../Home.module.css
import { Sparkles, RefreshCw, LogOut, Shield } from "lucide-react";

interface Result {
    id: number;
    team_name: string;
    team_id?: string;
    track?: string;
    total_score: number;
    ai_verdict: string;
    admin_verdict: string;
    evaluation: any;
    status: string;
}

export default function Dashboard() {
    const router = useRouter();
    const [results, setResults] = useState<Result[]>([]);
    const [refreshKey, setRefreshKey] = useState(0);
    const [role, setRole] = useState<string | null>(null);

    // Auth Check
    useEffect(() => {
        const storedRole = localStorage.getItem("auth_role");
        if (!storedRole) {
            router.push("/login");
        } else {
            setRole(storedRole);
        }
    }, [router]);

    useEffect(() => {
        fetch("/api/results")
            .then((res) => res.json())
            .then((data) => setResults(data))
            .catch(err => console.error("Failed to load results", err));
    }, [refreshKey]);

    const handleLogout = () => {
        localStorage.removeItem("auth_role");
        document.cookie = "auth_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
        router.push("/login");
    };

    const handleExport = () => {
        const headers = ["Team Name", "Team ID", "Track", "Score", "AI Verdict", "Admin Verdict", "Status"];
        const csvContent = [
            headers.join(","),
            ...results.map(r => [
                `"${r.team_name}"`,
                r.team_id || "",
                r.track || "",
                r.total_score,
                r.ai_verdict,
                r.admin_verdict,
                r.status
            ].join(","))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "hackathon_results.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (!role) return null; // Or a loading spinner

    return (
        <main className={styles.container}>
            {/* Header / Nav */}
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 'var(--spacing-8)',
                padding: 'var(--spacing-4) 0',
                borderBottom: '1px solid var(--border-color)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className={styles.statusDot} style={{ background: 'var(--success)' }} />
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Hackathon Admin</span>
                    <span style={{
                        fontSize: '0.75rem',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        background: role === 'admin' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                        color: role === 'admin' ? '#818cf8' : 'var(--text-secondary)',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        {role === 'admin' ? 'JUDGE ACCESS' : 'VIEWER MODE'}
                    </span>
                </div>

                <button
                    onClick={handleLogout}
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-secondary)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.875rem'
                    }}
                >
                    <LogOut size={16} /> Logout
                </button>
            </header>

            <h1 className={styles.title} style={{ fontSize: '2rem', marginBottom: 'var(--spacing-6)' }}>
                Dashboard
            </h1>

            {/* Judge Controls - ONLY FOR ADMIN */}
            {role === 'admin' && (
                <JudgeControls onExport={handleExport} />
            )}

            {/* Upload Section - ONLY FOR ADMIN */}
            {role === 'admin' && (
                <section className={`${styles.section} ${styles.sectionDelay1}`}>
                    <FileUpload onUploadSuccess={() => setRefreshKey((prev) => prev + 1)} />
                </section>
            )}

            {/* Results Section */}
            <section className={`${styles.section} ${styles.sectionDelay2}`}>
                <div className={styles.sectionHeader}>
                    <div className={styles.sectionTitle}>
                        <Sparkles className="w-5 h-5 text-indigo-400" />
                        Live Leaderboard
                        {role !== 'admin' && <span style={{ fontSize: '0.75rem', marginLeft: '10px', color: 'var(--text-tertiary)' }}>(Read Only)</span>}
                    </div>

                    <button
                        onClick={() => setRefreshKey((prev) => prev + 1)}
                        className={styles.refreshButton}
                        title="Refresh Results"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                <ResultsTable
                    results={results}
                    readOnly={role !== 'admin'}
                    onVerdictUpdate={() => setRefreshKey((prev) => prev + 1)}
                />
            </section>
        </main>
    );
}
