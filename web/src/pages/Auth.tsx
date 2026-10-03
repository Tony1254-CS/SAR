import { useState } from 'react';
import { Navbar } from '../components/Navbar';

// Demo sign-in only -- there is no backend, no accounts, and nothing here is
// gated by real auth. This exists so the app has the entry flow of a real
// product; it always "succeeds" and sends you to /app.
export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const enter = () => {
    window.location.href = '/cases';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'transparent',
        color: 'var(--text)',
        fontFamily: 'var(--font-text)',
      }}
    >
      <Navbar />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          enter();
        }}
        style={{
          width: 360,
          background: 'var(--panel)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--r-md)',
          padding: 'var(--s5)',
        }}
      >
        <div style={{ marginBottom: 'var(--s4)' }}>
          <span className="mono" style={{ letterSpacing: '0.08em', color: 'var(--water)', fontWeight: 600, fontSize: 'var(--text-sm)' }}>
            FLUVISAR
          </span>
        </div>
        <h2 style={{ margin: '0 0 var(--s1)', fontSize: 'var(--text-xl)' }}>Welcome back</h2>
        <p style={{ margin: '0 0 var(--s4)', color: 'var(--text-2)', fontSize: 'var(--text-base)' }}>
          Sign in to open the reach dashboard.
        </p>

        <button
          type="button"
          onClick={enter}
          style={{
            width: '100%',
            padding: '10px',
            marginBottom: 'var(--s4)',
            background: 'transparent',
            border: '1px solid var(--line-strong)',
            borderRadius: 'var(--r-md)',
            color: 'var(--text)',
            cursor: 'pointer',
          }}
        >
          Continue with Google
        </button>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--s2)',
            color: 'var(--text-3)',
            fontSize: 'var(--text-xs)',
            margin: '0 0 var(--s4)',
          }}
        >
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
          or use email
          <div style={{ flex: 1, height: 1, background: 'var(--line)' }} />
        </div>

        <input
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px',
            marginBottom: 'var(--s3)',
            background: 'var(--bg)',
            border: '1px solid var(--line-strong)',
            borderRadius: 'var(--r-md)',
            color: 'var(--text)',
          }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '10px',
            marginBottom: 'var(--s4)',
            background: 'var(--bg)',
            border: '1px solid var(--line-strong)',
            borderRadius: 'var(--r-md)',
            color: 'var(--text)',
          }}
        />
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '10px',
            background: 'var(--water)',
            color: '#04222b',
            fontWeight: 700,
            border: 'none',
            borderRadius: 'var(--r-md)',
            cursor: 'pointer',
          }}
        >
          Sign in
        </button>

        <p style={{ textAlign: 'center', marginTop: 'var(--s4)', fontSize: 'var(--text-xs)', color: 'var(--text-3)' }}>
          {'Demo only — no account needed, any details work.'}
        </p>
      </form>
    </div>
  );
}
