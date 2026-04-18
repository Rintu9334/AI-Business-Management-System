import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { BrainCircuit, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

const AIAdvisor = () => {
    const [advice, setAdvice] = useState({ message: 'Initializing neural link...', type: 'info' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAdvice = async () => {
            try {
                const res = await api.get('ai/advice/');
                setAdvice(res.data);
            } catch (err) {
                console.error("Failed to fetch AI context", err);
                setAdvice({ message: "AI connection disrupted. Operating in manual mode.", type: 'alert' });
            } finally {
                setLoading(false);
            }
        };
        fetchAdvice();
        const interval = setInterval(fetchAdvice, 30000);
        return () => clearInterval(interval);
    }, []);

    // Configuration for styling based on the advice type returned by backend
    const styles = {
        alert: { border: 'var(--error)', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', Icon: AlertTriangle },
        warning: { border: 'var(--warning)', background: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', Icon: AlertTriangle },
        success: { border: 'var(--success)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', Icon: CheckCircle },
        info: { border: 'var(--primary)', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary)', Icon: Info }
    };

    const currentStyle = styles[advice.type] || styles.info;
    const IconComponent = currentStyle.Icon;

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="glass-card" 
            style={{ 
                padding: '20px', 
                background: `linear-gradient(90deg, ${currentStyle.background} 0%, rgba(17, 24, 39, 0.5) 100%)`, 
                borderLeft: `4px solid ${currentStyle.border}`,
                marginBottom: '20px'
            }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        borderRadius: '50%', 
                        background: currentStyle.background, 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        color: currentStyle.color,
                        boxShadow: `0 0 15px ${currentStyle.background}`
                    }}>
                        {loading ? <BrainCircuit size={20} className="spin-animation" /> : <IconComponent size={20} />}
                    </div>
                    <div>
                        <h4 style={{ margin: 0, fontSize: '0.9rem', color: currentStyle.color, fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            AI Node Advisory
                        </h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                            {advice.message}
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
                .spin-animation { animation: spin 4s linear infinite; }
            `}</style>
        </motion.div>
    );
};

export default AIAdvisor;
