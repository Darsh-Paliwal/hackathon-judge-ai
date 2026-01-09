"use client";

import { useState } from 'react';
import { Upload, X, FileText, Loader2, AlertCircle } from 'lucide-react';
import styles from './FileUpload.module.css';

interface UploadProps {
    onUploadSuccess: () => void;
}

export default function FileUpload({ onUploadSuccess }: UploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [teamName, setTeamName] = useState("");
    const [teamId, setTeamId] = useState("");
    const [track, setTrack] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.type === "dragenter" || e.type === "dragover" ? setIsDragging(true) : setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) validateAndSetFile(e.dataTransfer.files[0]);
    };

    const validateAndSetFile = (f: File) => {
        if (!f.name.match(/\.(ppt|pptx)$/)) {
            setError("Only .ppt or .pptx files are allowed.");
            return;
        }
        // Vercel Serverless Function Limit is 4.5MB
        if (f.size > 4.5 * 1024 * 1024) {
            setError("File exceeds Vercel's 4.5MB limit. Please compress images or try a smaller file.");
            return;
        }
        setError(null);
        setFile(f);
    };

    const uploadFile = async () => {
        if (!file) return;
        setIsUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('teamName', teamName);
        formData.append('teamId', teamId);
        formData.append('track', track);

        try {
            const res = await fetch('/api/upload', { method: 'POST', body: formData });

            // Handle non-JSON responses (e.g. Vercel 413/504 HTML errors)
            const contentType = res.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error(`Server Error (${res.status}): Likely file size limit exceeded.`);
            }

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Upload failed");

            setFile(null);
            onUploadSuccess();
        } catch (err) {
            console.error(err);
            setError((err as Error).message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div
                className={`${styles.uploadCard} ${isDragging ? styles.dragging : ''}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                {!file ? (
                    <div className={styles.content}>
                        <span className={styles.stepLabel}>Step 1: Submission</span>
                        <div className={styles.iconWrapper}>
                            <Upload className={styles.icon} />
                        </div>
                        <div>
                            <h3 className={styles.title}>Upload Presentation</h3>
                            <p className={styles.subtitle}>Drag & drop PPTX file here</p>
                        </div>

                        <input
                            type="file"
                            className={styles.fileInput}
                            id="file-upload"
                            accept=".ppt,.pptx"
                            onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])}
                        />
                        <label htmlFor="file-upload" className={styles.uploadBtn}>
                            Select File
                        </label>
                    </div>
                ) : (
                    <div className={styles.content}>
                        <div className={styles.fileCard}>
                            <FileText className={styles.fileIcon} size={24} />
                            <div className={styles.fileInfo}>
                                <p className={styles.fileName}>{file.name}</p>
                                <p className={styles.fileSize}>{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            {!isUploading && (
                                <button onClick={() => setFile(null)} className={styles.removeButton}>
                                    <X size={20} />
                                </button>
                            )}
                        </div>

                        {/* Metadata Inputs */}
                        {!isUploading && (
                            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
                                <input
                                    className="glass-panel"
                                    placeholder="Team Name (Optional)"
                                    value={teamName}
                                    onChange={(e) => setTeamName(e.target.value)}
                                    style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '6px' }}
                                />
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <input
                                        className="glass-panel"
                                        placeholder="Team ID (e.g. T-101)"
                                        value={teamId}
                                        onChange={(e) => setTeamId(e.target.value)}
                                        style={{ flex: 1, padding: '0.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', color: 'white', borderRadius: '6px' }}
                                    />
                                    <select
                                        className="glass-panel"
                                        value={track}
                                        onChange={(e) => setTrack(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            background: 'rgba(20, 20, 30, 0.8)', // Darker background for contrast
                                            border: '1px solid rgba(255,255,255,0.3)', // Brighter border
                                            color: 'white',
                                            borderRadius: '6px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        <option value="" style={{ color: 'black' }}>Select Track</option>
                                        <option value="AI / ML" style={{ color: 'black' }}>AI / ML</option>
                                        <option value="Web3" style={{ color: 'black' }}>Web3</option>
                                        <option value="Healthcare" style={{ color: 'black' }}>Healthcare</option>
                                        <option value="Fintech" style={{ color: 'black' }}>Fintech</option>
                                        <option value="Open Innovation" style={{ color: 'black' }}>Open Innovation</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {isUploading ? (
                            <div className={styles.analyzing}>
                                <Loader2 className={styles.spinner} size={24} />
                                <span>Analyzing Submission...</span>
                            </div>
                        ) : (
                            <button onClick={uploadFile} className={styles.uploadBtn}>
                                Run Evaluation
                            </button>
                        )}
                    </div>
                )}
            </div>

            {error && (
                <div className={styles.errorBox}>
                    <AlertCircle size={20} />
                    {error}
                </div>
            )}
        </div>
    );
}
