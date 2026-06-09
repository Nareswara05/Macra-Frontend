/**
 * Root page — the proxy (middleware) redirects:
 *   - Authenticated users → /dashboard
 *   - Unauthenticated users → /login
 *
 * This component is a fallback that should rarely render.
 */
export default function RootPage() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0d1117' }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%',
        border: '3px solid #21262d', borderTopColor: '#3fb950',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
