import { useEffect, useState } from 'react';
import HomePage from './components/HomePage';
import RadarPage from './components/RadarPage';
import { useRadars } from './hooks/useRadars';

type Route = { view: 'home' } | { view: 'radar'; id: string };

function parseHash(hash: string): Route {
  const cleaned = hash.replace(/^#\/?/, '');
  if (cleaned.length === 0) return { view: 'home' };

  const parts = cleaned.split('/');
  if (parts[0] === 'radar' && typeof parts[1] === 'string' && parts[1].length > 0) {
    return { view: 'radar', id: parts[1] };
  }
  return { view: 'home' };
}

export default function App() {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash));
  const { radars, getRadar, addRadar, removeRadar, renameRadar, renameQuadrant, addItem, removeItem, cycleZone } = useRadars();

  useEffect(() => {
    const handler = () => setRoute(parseHash(window.location.hash));
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const goHome = () => { window.location.hash = ''; };
  const goToRadar = (id: string) => { window.location.hash = `#/radar/${id}`; };

  let title: string;
  let subtitle: string;
  if (route.view === 'radar') {
    const radar = getRadar(route.id);
    if (radar) {
      title = radar.name;
      subtitle = radar.isExample
        ? 'A ready-made example radar you can always come back to'
        : 'Click any dot to cycle its phase';
    } else {
      title = 'Radar not found';
      subtitle = 'It may have been deleted';
    }
  } else {
    title = 'Technology Radar';
    subtitle = "A living map of your organization's technology landscape";
  }

  return (
    <div className="app-shell" style={{ minHeight: '100vh', background: '#0a0b12', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px' }}>
      <header style={{ textAlign: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: '#fff', margin: 0, letterSpacing: -1.5 }}>{title}</h1>
        <p style={{ color: '#6b7a99', fontSize: 15, margin: '8px 0 0' }}>{subtitle}</p>
      </header>

      {route.view === 'home' && (
        <HomePage
          radars={radars}
          onOpen={goToRadar}
          onCreate={name => {
            const radar = addRadar(name);
            goToRadar(radar.id);
          }}
          onDelete={removeRadar}
        />
      )}

      {route.view === 'radar' && (() => {
        const radar = getRadar(route.id);
        if (!radar) {
          return (
            <button onClick={goHome} style={{ padding: '8px 16px', background: '#6366f1', border: 'none', borderRadius: 6, color: '#fff', cursor: 'pointer' }}>Back home</button>
          );
        }
        return (
          <RadarPage
            key={radar.id}
            radar={radar}
            onBack={goHome}
            onRenameRadar={name => renameRadar(radar.id, name)}
            onRenameQuadrant={(quadrant, name) => renameQuadrant(radar.id, quadrant, name)}
            onAddItem={input => addItem(radar.id, input)}
            onRemoveItem={itemId => removeItem(radar.id, itemId)}
            onCycleZone={itemId => cycleZone(radar.id, itemId)}
          />
        );
      })()}
    </div>
  );
}
