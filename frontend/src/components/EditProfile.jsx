import React, { useState, useRef } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

const EditProfile = ({ user, onClose, onUpdate }) => {
    const [name, setName] = useState(user.name || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [address, setAddress] = useState(user.address || '');
    const [company, setCompany] = useState(user.company || '');
    const [preview, setPreview] = useState(
        user.profileImage ? `${API.replace('/api', '')}${user.profileImage}` : null
    );
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const fileRef = useRef();

    const handleImageChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setUploading(true);
        setError('');
        try {
            const form = new FormData();
            form.append('profileImage', file);
            const uid = user.id || user._id;
            const res = await axios.post(`${API}/profile/${uid}/upload-image`, form, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const updated = { ...user, profileImage: res.data.imageUrl };
            localStorage.setItem('user', JSON.stringify(updated));
            onUpdate(updated);
        } catch (err) {
            setError('Image upload failed. Please ensure the file is a valid image under 50MB.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        try {
            const uid = user.id || user._id;
            const res = await axios.put(`${API}/profile/${uid}`, { name, phone, address, company });
            const updated = { ...user, name: res.data.name, phone: res.data.phone, address: res.data.address, company: res.data.company };
            localStorage.setItem('user', JSON.stringify(updated));
            onUpdate(updated);
            onClose();
        } catch (err) {
            setError('Failed to save changes.');
            console.error('Save profile error:', err);
        } finally {
            setSaving(false);
        }
    };

    const initial = name?.charAt(0).toUpperCase() || '?';

    return (
        <div style={styles.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
            <div style={styles.modal}>
                {/* Header */}
                <div style={styles.header}>
                    <h2 style={styles.title}><i className="fas fa-user-edit" style={{ marginRight: 8, color: 'var(--secondary)' }}></i>Edit Profile</h2>
                    <button style={styles.closeBtn} onClick={onClose}><i className="fas fa-times"></i></button>
                </div>

                {/* Avatar upload */}
                <div style={styles.avatarSection}>
                    <div
                        style={styles.avatarWrap}
                        onClick={() => fileRef.current.click()}
                        title="Click to change photo"
                    >
                        {preview ? (
                            <img src={preview} alt="Profile" style={styles.avatarImg} />
                        ) : (
                            <div style={styles.avatarInitial}>{initial}</div>
                        )}
                        <div style={styles.avatarOverlay}>
                            {uploading
                                ? <i className="fas fa-spinner fa-spin"></i>
                                : <i className="fas fa-camera"></i>}
                        </div>
                    </div>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={handleImageChange}
                    />
                    <p style={{ color: 'var(--gray)', fontSize: '0.82rem', marginTop: '0.5rem' }}>
                        Click avatar to upload photo (max 5MB)
                    </p>
                </div>

                {error && <div style={styles.error}><i className="fas fa-exclamation-circle"></i> {error}</div>}

                {/* Form */}
                <form onSubmit={handleSave}>
                    <div style={styles.formRow}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Full Name</label>
                            <input
                                type="text"
                                className="form-control"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label className="form-label">Phone Number</label>
                            <input
                                type="tel"
                                className="form-control"
                                value={phone}
                                onChange={e => setPhone(e.target.value)}
                                placeholder="+1 234 567 8900"
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Company / Organisation</label>
                        <input
                            type="text"
                            className="form-control"
                            value={company}
                            onChange={e => setCompany(e.target.value)}
                            placeholder="Optional"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Address</label>
                        <textarea
                            className="form-control"
                            rows={2}
                            value={address}
                            onChange={e => setAddress(e.target.value)}
                            placeholder="Your address (optional)"
                            style={{ resize: 'none' }}
                        />
                    </div>
                    <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                        <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" style={{ flex: 2 }} disabled={saving || uploading}>
                            {saving ? <><i className="fas fa-spinner fa-spin"></i> Saving…</> : <><i className="fas fa-save"></i> Save Changes</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999, backdropFilter: 'blur(3px)',
    },
    modal: {
        background: 'white', borderRadius: 16, padding: '2rem',
        width: '100%', maxWidth: 520,
        boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
        animation: 'fadeIn 0.25s ease',
        maxHeight: '90vh', overflowY: 'auto',
    },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' },
    title: { fontSize: '1.3rem', fontWeight: 700, color: 'var(--primary)' },
    closeBtn: {
        background: '#f0f4f8', border: 'none', borderRadius: '50%',
        width: 36, height: 36, cursor: 'pointer', fontSize: '1rem', color: 'var(--gray)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    avatarSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '1.5rem' },
    avatarWrap: {
        position: 'relative', width: 100, height: 100,
        borderRadius: '50%', cursor: 'pointer',
        border: '3px solid var(--secondary)',
        overflow: 'hidden', flexShrink: 0,
    },
    avatarImg: { width: '100%', height: '100%', objectFit: 'cover' },
    avatarInitial: {
        width: '100%', height: '100%',
        background: 'var(--gradient)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem', fontWeight: 700, color: 'white',
    },
    avatarOverlay: {
        position: 'absolute', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'white', fontSize: '1.4rem',
        opacity: 0,
        transition: 'opacity 0.2s',
    },
    formRow: { display: 'flex', gap: '1rem' },
    error: {
        background: '#fee9e7', color: 'var(--danger)',
        padding: '0.7rem 1rem', borderRadius: 8,
        fontSize: '0.88rem', marginBottom: '1rem',
    },
};

// Show overlay on avatar hover via CSS injection
if (!document.getElementById('ep-style')) {
    const s = document.createElement('style');
    s.id = 'ep-style';
    s.textContent = `
        [data-avatar-wrap]:hover [data-avatar-overlay] { opacity: 1 !important; }
    `;
    document.head.appendChild(s);
}

export default EditProfile;
