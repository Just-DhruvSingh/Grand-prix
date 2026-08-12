import React, { useState, useEffect } from 'react';
import KineticFlowDashboard from './components/KineticFlowDashboard';

function App() {
  const [backendStatus, setBackendStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  // API Test Hookup: Fetch /api/health to confirm frontend & backend bridge works cleanly
  useEffect(() => {
    console.log('📡 Testing Backend API Connection at /api/health...');
    
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        console.log('✅ Backend API Connected Successfully:', data);
        setBackendStatus(data);
        setLoading(false);
      })
      .catch(err => {
        console.warn('⚠️ Could not connect to backend API /api/health:', err.message);
        setBackendStatus({ status: 'offline', error: err.message });
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full h-full relative">
      <KineticFlowDashboard backendHealth={backendStatus} />
    </div>
  );
}

export default App;
