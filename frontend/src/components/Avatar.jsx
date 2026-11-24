import React from 'react';

const BACKEND = 'http://localhost:5000';

/**
 * Shows profile photo if available, otherwise shows first letter of name.
 * Props: user, size (px), fontSize
 */
const Avatar = ({ user, size = 42, fontSize = '1.1rem', style = {} }) => {
    const initial = user?.name?.charAt(0).toUpperCase() || '?';
    const src = user?.profileImage ? `${BACKEND}${user.profileImage}` : null;

    const base = {
        width: size, 
        height: size, 
        borderRadius: size === 'auto' ? '8px' : '50%',
        flexShrink: 0, 
        overflow: 'hidden',
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: 'var(--gradient)', 
        color: 'white',
        fontWeight: 700, 
        fontSize,
        border: '2px solid rgba(255,255,255,0.3)',
        ...style,
    };

    return (
        <div style={base}>
            {src
                ? <img src={src} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : initial}
        </div>
    );
};

export default Avatar;
