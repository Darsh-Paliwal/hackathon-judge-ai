"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Login.module.css";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogin = (role: 'admin' | 'viewer') => {
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
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Email</label>
                        <input type="email" placeholder="judge@hackathon.com" className={styles.input} />
                    </div>
                    <div className={styles.inputGroup}>
                        <label className={styles.label}>Password</label>
                        <input type="password" placeholder="••••••••" className={styles.input} />
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
