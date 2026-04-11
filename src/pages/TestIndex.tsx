export default function TestIndex() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '1rem' }}>GREEN LOOP</h1>
        <p style={{ color: '#64748b', marginBottom: '2rem' }}>Plastic recycling & carbon credits</p>
        <div style={{ 
          width: '48px', 
          height: '48px', 
          border: '4px solid #e2e8f0', 
          borderTop: '4px solid #facc15',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p style={{ color: '#64748b' }}>App is loading correctly...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
