import { useState } from 'react';
import TechRadar from './TechRadar';
import { type Radar } from '../radars';
import { type QuadrantCode } from '../data';

interface RadarPageProps {
  radar: Radar;
  onBack: () => void;
  onRenameRadar: (name: string) => void;
  onRenameQuadrant: (quadrant: QuadrantCode, name: string) => string | null;
  onAddItem: (input: { name: string; language: string; quadrant: QuadrantCode; zone: 'adopt' | 'trial' | 'assess' | 'hold' }) => void;
  onRemoveItem: (itemId: string) => void;
  onCycleZone: (itemId: string) => void;
}

const QUADRANT_ORDER: QuadrantCode[] = ['Q1', 'Q2', 'Q3', 'Q4'];

export default function RadarPage({ radar, onBack, onRenameRadar, onRenameQuadrant, onAddItem, onRemoveItem, onCycleZone }: RadarPageProps) {
  const [editingName, setEditingName] = useState(false);
  const [nameDraft, setNameDraft] = useState(radar.name);
  const [showQuadrantPanel, setShowQuadrantPanel] = useState(false);
  const [quadrantDrafts, setQuadrantDrafts] = useState<Record<QuadrantCode, string>>({ ...radar.quadrantNames });
  const [quadrantErrors, setQuadrantErrors] = useState<Partial<Record<QuadrantCode, string>>>({});

  const commitNameEdit = () => {
    const trimmed = nameDraft.trim();
    if (trimmed.length === 0) {
      setNameDraft(radar.name);
    } else {
      onRenameRadar(trimmed);
    }
    setEditingName(false);
  };

  const commitQuadrantEdit = (quadrant: QuadrantCode) => {
    const draft = quadrantDrafts[quadrant];
    if (draft === radar.quadrantNames[quadrant]) return;

    const error = onRenameQuadrant(quadrant, draft);
    setQuadrantErrors(prev => ({ ...prev, [quadrant]: error ?? undefined }));
  };

  return (
    <div style={{ width: '100%', maxWidth: 900, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onBack} style={{ background: 'transparent', border: 'none', color: '#6b7a99', fontSize: 13, cursor: 'pointer' }}>&larr; All radars</button>

        {editingName ? (
          <input
            autoFocus
            value={nameDraft}
            onChange={e => setNameDraft(e.target.value)}
            onBlur={commitNameEdit}
            onKeyDown={e => { if (e.key === 'Enter') commitNameEdit(); if (e.key === 'Escape') { setNameDraft(radar.name); setEditingName(false); } }}
            style={{ background: '#11142aee', border: '1px solid #ffffff15', borderRadius: 6, color: '#fff', fontSize: 20, fontWeight: 800, padding: '4px 10px', textAlign: 'center' }}
          />
        ) : (
          <h2 onClick={() => { if (!radar.isExample) { setNameDraft(radar.name); setEditingName(true); } }} style={{ color: '#fff', margin: 0, fontSize: 22, fontWeight: 800, cursor: radar.isExample ? 'default' : 'pointer' }}>
            {radar.name}{radar.isExample ? ' (example)' : ''}
          </h2>
        )}

        <button onClick={() => setShowQuadrantPanel(v => !v)} style={{ background: 'transparent', border: '1px solid #ffffff15', borderRadius: 6, color: '#9ca3af', fontSize: 12, padding: '6px 12px', cursor: 'pointer' }}>
          {showQuadrantPanel ? 'Hide quadrants' : 'Rename quadrants'}
        </button>
      </div>

      {showQuadrantPanel && (
        <div style={{ width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10, background: '#1a1d30', border: '1px solid #ffffff15', borderRadius: 10, padding: 14 }}>
          {QUADRANT_ORDER.map(q => (
            <div key={q} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ color: '#6b7a99', fontSize: 10, letterSpacing: 0.5 }}>{q}</label>
              <input
                value={quadrantDrafts[q]}
                onChange={e => setQuadrantDrafts(prev => ({ ...prev, [q]: e.target.value }))}
                onBlur={() => commitQuadrantEdit(q)}
                onKeyDown={e => { if (e.key === 'Enter') commitQuadrantEdit(q); }}
                style={{ background: '#11142aee', border: '1px solid #ffffff15', borderRadius: 6, color: '#fff', fontSize: 13, padding: '6px 8px' }}
              />
              {quadrantErrors[q] && <span style={{ color: '#ef4444', fontSize: 10 }}>{quadrantErrors[q]}</span>}
            </div>
          ))}
        </div>
      )}

      <TechRadar
        items={radar.items}
        quadrantNames={radar.quadrantNames}
        onAddItem={onAddItem}
        onRemoveItem={onRemoveItem}
        onCycleZone={onCycleZone}
      />
    </div>
  );
}
