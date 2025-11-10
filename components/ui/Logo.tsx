
import React from 'react';

interface LogoProps {
    size?: 'small' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'small' }) => {
    const isLarge = size === 'large';

    const logoWrapperStyle: React.CSSProperties = {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center', // Center align for the large version
    };

    const cunStyle: React.CSSProperties = {
        fontFamily: "'Yellowtail', cursive",
        fontSize: isLarge ? '10rem' : '5rem',
        lineHeight: 1,
        color: '#1e293b',
        textShadow: '1px 1px 3px rgba(0,0,0,0.1)',
    };
    
    const analyticsStyle: React.CSSProperties = {
        fontFamily: "sans-serif",
        fontWeight: 'bold',
        fontSize: isLarge ? '2.8rem' : '1.4rem',
        color: '#475569',
        marginTop: isLarge ? '-2rem' : '-1rem',
        paddingLeft: isLarge ? '3rem' : '1.5rem',
    };

    // Conditionally apply the shimmer class for the large logo
    const wrapperClasses = isLarge ? 'logo-shimmer' : '';

    return (
        <div style={logoWrapperStyle} className={wrapperClasses} aria-label="cun Analytics!">
            <div style={cunStyle} aria-hidden="true" className="animate-fade-in-up">
                cun
            </div>
            <div style={analyticsStyle} className="animate-fade-in-up [animation-delay:150ms]">
                Analytics!
            </div>
        </div>
    );
};

export default Logo;