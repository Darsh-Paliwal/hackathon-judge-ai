"use client";

import styles from "./Home.module.css";
import Link from "next/link";
import { ArrowRight, Lock, LayoutDashboard } from "lucide-react";

export default function LandingPage() {
    return (
        <main className={styles.container}>
            {/* Hero Section */}
            <section className={styles.hero} style={{ minHeight: '80vh', justifyContent: 'center' }}>
                <div className={styles.badge}>
                    <div className={styles.statusDot} />
                    Official Hackathon Platform
                </div>

                <h1 className={styles.title}>
                    Automated Evaluation<br />System
                </h1>

                <p className={styles.subtitle} style={{ maxWidth: '600px', margin: '0 auto 2rem' }}>
                    Streamline your hackathon judging process. AI-powered shortlisting with human-in-the-loop controls.
                    Secure, unbiased, and incredibly fast.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '2rem' }}>
                    <Link href="/login" style={{ textDecoration: 'none' }}>
                        <button className="premium-button" style={{
                            background: 'var(--primary)',
                            color: 'white',
                            padding: '1rem 2rem',
                            borderRadius: 'var(--radius-md)',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: 600
                        }}>
                            <Lock size={18} /> Judge Login
                        </button>
                    </Link>

                    <Link href="/login" style={{ textDecoration: 'none' }}>
                        <button className="glass-panel" style={{
                            padding: '1rem 2rem',
                            color: 'var(--text-primary)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            fontSize: '1rem',
                            fontWeight: 500
                        }}>
                            <LayoutDashboard size={18} /> View Leaderboard
                        </button>
                    </Link>
                </div>
            </section>
        </main>
    );
}
