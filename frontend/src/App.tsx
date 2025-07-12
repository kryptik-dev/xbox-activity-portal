import './App.css'
import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

function XboxIcon({ className = '' }) {
  return (
    <span className={`status-icon xbox ${className}`} title="Xbox Connected">
      {/* SVG Xbox logo */}
      <svg width="1.2em" height="1.2em" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#7df900"/><path d="M16 4C10.477 4 6 8.477 6 14c0 2.21.895 4.21 2.343 5.657C10.79 21.105 12.79 22 15 22s4.21-.895 5.657-2.343C25.105 18.21 26 16.21 26 14c0-5.523-4.477-10-10-10z" fill="#181a28"/></svg>
    </span>
  );
}
function DiscordIcon({ className = '' }) {
  return (
    <span className={`status-icon discord ${className}`} title="Discord Connected">
      {/* SVG Discord logo */}
      <svg width="1.2em" height="1.2em" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#7289da"/><path d="M24.5 22.5s-1.5-2-6.5-2-6.5 2-6.5 2V11.5s1.5-2 6.5-2 6.5 2 6.5 2v11z" fill="#fff"/></svg>
    </span>
  );
}
function CrossIcon({ className = '' }) {
  return (
    <span className={`status-icon red ${className}`} title="Not Connected">
      {/* SVG Cross */}
      <svg width="1.1em" height="1.1em" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="10" fill="#ff6b6b"/><path d="M6 6l8 8M14 6l-8 8" stroke="#fff" strokeWidth="2"/></svg>
    </span>
  );
}

// Modern Lucide/Feather style settings icon
function SettingsIcon({ className = '' }) {
  return (
    <svg className={className} width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7df900" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8 4.6a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09c0 .66.39 1.25 1 1.51a1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.13.21.21.45.21.7s-.08.49-.21.7a1.65 1.65 0 0 0-.33 1.82c.13.21.21.45.21.7s-.08.49-.21.7z" />
    </svg>
  );
}

function App() {
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [env, setEnv] = useState<any>(null);
  const [envLoading, setEnvLoading] = useState(false);
  const [envError, setEnvError] = useState<string | null>(null);
  const [envSaving, setEnvSaving] = useState(false);
  const [envForm, setEnvForm] = useState({ clientId: '', IP: '', showGamertag: 'true' });
  const [restarting, setRestarting] = useState(false);
  const [showRestartNotice, setShowRestartNotice] = useState(false);
  const [autoConnectEnabled, setAutoConnectEnabled] = useState(true);

  // Fetch status from backend
  const fetchStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/status`);
      if (!res.ok) throw new Error('Failed to fetch status');
      const data = await res.json();
      setStatus(data);
    } catch (err: any) {
      setError(err.message);
      // Do not clear status; keep last known good state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchAutoConnectStatus();
    const interval = setInterval(fetchStatus, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  // Fetch auto-connect status
  const fetchAutoConnectStatus = async () => {
    try {
      const res = await fetch(`${API_URL}/auto-connect`);
      if (res.ok) {
        const data = await res.json();
        setAutoConnectEnabled(data.autoConnectEnabled);
      }
    } catch (err) {
      console.error('Failed to fetch auto-connect status:', err);
    }
  };

  // Toggle auto-connect
  const toggleAutoConnect = async () => {
    try {
      const res = await fetch(`${API_URL}/auto-connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !autoConnectEnabled }),
      });
      if (res.ok) {
        const data = await res.json();
        setAutoConnectEnabled(data.autoConnectEnabled);
      }
    } catch (err) {
      console.error('Failed to toggle auto-connect:', err);
    }
  };

  // Connect to Xbox
  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/connect`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to connect');
      await fetchStatus();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  // Settings modal logic
  const openSettings = async () => {
    setShowSettings(true);
    setEnvLoading(true);
    setEnvError(null);
    try {
      const res = await fetch(`${API_URL}/env`);
      if (!res.ok) throw new Error('Failed to fetch environment');
      const data = await res.json();
      setEnv(data);
      setEnvForm({
        clientId: data.clientId || '',
        IP: data.IP || '',
        showGamertag: data.showGamertag || 'true',
      });
    } catch (err: any) {
      setEnvError(err.message);
    } finally {
      setEnvLoading(false);
    }
  };

  const closeSettings = () => {
    setShowSettings(false);
    setEnvError(null);
  };

  const handleEnvChange = (e: any) => {
    const { name, value } = e.target;
    setEnvForm((prev: any) => ({ ...prev, [name]: value }));
  };

  const saveEnv = async (e: any) => {
    e.preventDefault();
    setEnvSaving(true);
    setEnvError(null);
    try {
      // Save environment settings
      const res = await fetch(`${API_URL}/env`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(envForm),
      });
      if (!res.ok) throw new Error('Failed to save environment');
      setShowSettings(false);
      setShowRestartNotice(true);
    } catch (err: any) {
      setEnvError(err.message);
    } finally {
      setEnvSaving(false);
    }
  };

  return (
    <div className="app-bg">
      <nav className="topbar">
        <img src="/xb.png" alt="Xbox Logo" className="xbox-logo" />
        <h1 className="topbar-title">Xbox 360 Activity Portal</h1>
        <button className="settings-icon" onClick={openSettings} title="Settings">
          <SettingsIcon />
        </button>
      </nav>
      <main className="center-content">
        <div className={`pro-card${status && status.xboxConnected ? ' connected' : ''}`}>
          <h2>Status</h2>
          {loading ? (
            <div className="loading-spinner" />
          ) : restarting ? (
            <div>
              <div className="loading-spinner" />
              <p style={{ color: '#7df900', fontWeight: 'bold', marginTop: '1rem' }}>Restarting backend...</p>
            </div>
          ) : error ? (
            <p style={{ color: '#ff6b6b' }}>Error: {error}</p>
          ) : status && !status.xboxConnected ? (
            <>
              <p style={{ fontWeight: 'bold', color: '#7df900', fontSize: '1.2em' }}>Connect your Xbox 360</p>
              <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button className="pro-btn" onClick={handleConnect} disabled={connecting}>
                  {connecting ? 'Connecting...' : 'Connect to Xbox'}
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={autoConnectEnabled}
                      onChange={toggleAutoConnect}
                      style={{ width: 16, height: 16 }}
                    />
                    <span>Auto-connect when Xbox is available</span>
                  </label>
                </div>
                {autoConnectEnabled && (
                  <p style={{ fontSize: '0.9em', color: '#7df900', textAlign: 'center', marginTop: 10 }}>
                    🔄 Auto-connecting every 10 seconds...
                  </p>
                )}
              </div>
            </>
          ) : status && status.xboxConnected ? (
            <>
              <p>
                <XboxIcon />
                <b>Xbox Connected:</b> <span className="pro-green">Yes</span>
              </p>
              <p>
                {status.discordConnected ? <DiscordIcon /> : <CrossIcon />}
                <b>Discord Connected:</b> <span className={status.discordConnected ? 'pro-green' : 'pro-red'}>{status.discordConnected ? 'Yes' : 'No'}</span>
              </p>
              <p><b>Title ID:</b> {status.titleId || '-'}</p>
              <p><b>Profile ID:</b> {status.profileId || '-'}</p>
              <p><b>Gamertag:</b> {status.gamertag || 'Not Signed In'}</p>
              <p><b>Game Name:</b> {status.gameName || '-'}</p>
            </>
          ) : null}
        </div>
      </main>
      {showSettings && (
        <div className="modal-backdrop" onClick={closeSettings}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2>Edit Environment Settings</h2>
            {envLoading ? <div className="loading-spinner" /> : (
              <form onSubmit={saveEnv}>
                <label>
                  Discord clientId:
                  <input name="clientId" value={envForm.clientId} onChange={handleEnvChange} required />
                </label>
                <label>
                  Xbox IP:
                  <input name="IP" value={envForm.IP} onChange={handleEnvChange} required />
                </label>
                <label>
                  Show Gamertag:
                  <select name="showGamertag" value={envForm.showGamertag} onChange={handleEnvChange}>
                    <option value="true">true</option>
                    <option value="false">false</option>
                  </select>
                </label>
                {envError && <p style={{ color: '#ff6b6b' }}>Error: {envError}</p>}
                <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                  <button className="pro-btn" type="submit" disabled={envSaving}>{envSaving ? 'Saving...' : 'Save'}</button>
                  <button className="pro-btn pro-btn-secondary" type="button" onClick={closeSettings}>Cancel</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {showRestartNotice && (
        <div style={{ margin: '1.5em 0', color: '#7df900', fontWeight: 'bold', fontSize: '1.1em' }}>
          Please restart the backend server manually for settings changes to take effect.
        </div>
      )}
    </div>
  )
}

export default App
