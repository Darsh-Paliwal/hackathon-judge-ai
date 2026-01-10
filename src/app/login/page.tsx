"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = (role: 'admin' | 'viewer') => {
        setError(""); // Clear previous errors

        // Simple validation
        if (!email.trim() || !password.trim()) {
            setError("Please enter both email and password.");
            return;
        }

        setLoading(true);

        // Mock Auth Logic
        // In a real app, this would hit an API
        setTimeout(() => {
            // Set simple cookie for middleware (if we had it) or client-side check
            document.cookie = `auth_role=${role}; path=/; max-age=86400`;
            localStorage.setItem("auth_role", role);

            router.push("/dashboard");
        }, 800);
    };

    return (
        <main className={styles.container}>
            <div className={styles.loginCard}>
                <div className={styles.header}>
                    <h1 className={styles.title}>Welcome Back</h1>
                    <p className={styles.subtitle}>Sign in to access the Evaluation Dashboard</p>
                </div>

                <div className={styles.form}>
                    {error && (
                        <div style={{
                            color: 'var(--error)',
                            backgroundColor: 'var(--error-bg)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.9rem',
                            marginBottom: '1rem',
                            border: '1px solid var(--error)'
                        }}>
                            {error}
                        </div>
                    )}
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input
                            type="email"
                            placeholder="judge@hackathon.com"
                            className={styles.input}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            className={styles.input}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>

                    <button
                        className={styles.buttonPrimary}
                        onClick={() => handleLogin('admin')}
                        disabled={loading}
                    >
                        {loading ? "Authenticating..." : "Login as Judge (Admin)"}
                    </button>

                    <div className={styles.divider}>OR</div>

                    <button
                        className={styles.buttonSecondary}
                        onClick={() => handleLogin('viewer')}
                        disabled={loading}
                    >
                        Continue as Guest Viewer
                    </button>
                </div>
            </div>
        </main>
    );
}
