import TechRadar from './components/TechRadar'

export default function App() {
  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: '#0a0b12', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 48, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -1.5 }}>Technology Radar</h1>
        <p style={{ color: '#6b7a99', fontSize: 15, margin: '8px 0 0' }}>Click any dot to cycle its phase • A living map of your organization's technology landscape</p>
      </header>
      <TechRadar />
    </div>
  )
}
