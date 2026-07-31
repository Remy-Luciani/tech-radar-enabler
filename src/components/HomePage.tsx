import { useEffect, useRef, useState } from 'react';
import { type Radar, canDeleteRadar } from '../radars';

interface HomePageProps {
  radars: Radar[];
  onOpen: (id: string) => void;
  onCreate: (name: string) => void;
  onDelete: (id: string) => void;
}

const CONFIRM_WINDOW_MS = 4000;

export default function HomePage({ radars, onOpen, onCreate, onDelete }: HomePageProps) {
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const confirmTimeout = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (confirmTimeout.current !== null) window.clearTimeout(confirmTimeout.current);
    };
  }, []);

  const armOrConfirmDelete = (radar: Radar) => {
    if (!canDeleteRadar(radar)) return;

    if (confirmingId === radar.id) {
      if (confirmTimeout.current !== null) window.clearTimeout(confirmTimeout.current);
      confirmTimeout.current = null;
      setConfirmingId(null);
      onDelete(radar.id);
      return;
    }

    if (confirmTimeout.current !== null) window.clearTimeout(confirmTimeout.current);
    setConfirmingId(radar.id);
    confirmTimeout.current = window.setTimeout(() => {
      setConfirmingId(null);
      confirmTimeout.current = null;
    }, CONFIRM_WINDOW_MS);
  };

  const handleCreate = () => {
    const trimmed = newName.trim();
    if (trimmed.length === 0) {
      onCreate('Untitled Radar');
    } else if (trimmed.length > 40) {
      onCreate(trimmed.slice(0, 40));
    } else {
      onCreate(trimmed);
    }
    setNewName('');
    setShowCreate(false);
  };

  return (
    <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ color: '#fff', fontSize: 22, margin: 0 }}>Your Radars</h2>
        {showCreate ? (
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              autoFocus
              value={newName}
              placeholder="Radar name"
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') { setShowCreate(false); setNewName(''); }
              }}
              style={{ padding: '7px 10px', background: '#11142aee', border: '1px solid #ffffff15', borderRadius: 6, color: '#fff', fontSize: 13 }}
            />
            <button onClick={handleCreate} style={{ padding: '7px 14px', background: '#6366f1', border: 'none', borderRadius: 6, color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Create</button>
            <button onClick={() => { setShowCreate(false); setNewName(''); }} style={{ padding: '7px 14px', background: 'transparent', border: '1px solid #ffffff15', borderRadius: 6, color: '#9ca3af', fontSize: 13, cursor: 'pointer' }}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setShowCreate(true)} style={{ padding: '8px 14px', background: '#6366f1', border: 'none', borderRadius: 6, color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', boxShadow: '0 2px 12px rgba(99,102,241,.4)' }}>+ New Radar</button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
        {radars.map(radar => {
          const deletable = canDeleteRadar(radar);
          const isConfirming = confirmingId === radar.id;

          let deleteLabel: string;
          if (!deletable) {
            deleteLabel = '';
          } else if (isConfirming) {
            deleteLabel = 'Confirm?';
          } else {
            deleteLabel = 'Delete';
          }

          return (
            <div
              key={radar.id}
              onClick={() => onOpen(radar.id)}
              style={{
                position: 'relative',
                background: '#1a1d30',
                border: radar.isExample ? '1px solid #6366f155' : '1px solid #ffffff15',
                borderRadius: 12,
                padding: 18,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
              }}
            >
              {radar.isExample && (
                <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 9, fontWeight: 700, letterSpacing: 0.5, color: '#a5b4fc', background: '#6366f125', padding: '3px 7px', borderRadius: 4 }}>EXAMPLE</span>
              )}
              <span style={{ color: '#fff', fontSize: 16, fontWeight: 700 }}>{radar.name}</span>
              <span style={{ color: '#6b7a99', fontSize: 12 }}>{radar.items.length} {radar.items.length === 1 ? 'item' : 'items'}</span>
              {deletable && (
                <button
                  onClick={e => { e.stopPropagation(); armOrConfirmDelete(radar); }}
                  style={{
                    alignSelf: 'flex-start',
                    marginTop: 4,
                    padding: '4px 10px',
                    background: isConfirming ? '#ef4444cc' : 'transparent',
                    border: isConfirming ? 'none' : '1px solid #ffffff15',
                    borderRadius: 6,
                    color: isConfirming ? '#fff' : '#9ca3af',
                    fontSize: 11,
                    cursor: 'pointer',
                  }}
                >
                  {deleteLabel}
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
