import { motion } from 'framer-motion';
import { useState, useMemo, useCallback, useEffect } from 'react';
import { ZONE_CONFIG, DEFAULT_ITEMS, QUADRANT_CONFIG, langColor, LANG_COLORS, loadItems, saveItems, type TechItem, type Zone, type QuadrantCode } from '../data';

export default function TechRadar() {
  const [items, setItems] = useState<TechItem[]>(() => loadItems());
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', language: 'Framework' as string, quadrant: 'Q1' as QuadrantCode, zone: 'adopt' as Zone });

  useEffect(() => { saveItems(items); }, [items]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setShowModal(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const positions = useMemo(() => {
    const result: Record<string, Partial<Record<Zone, { x: number; y: number }>>> = {};
    for (const item of items) {
      if (!result[item.id]) result[item.id] = {};
      const qItems = items.filter(i => i.quadrant === item.quadrant);
      const idx = qItems.indexOf(item);
      const quad = QUADRANT_CONFIG[item.quadrant];
      for (const zk of ['adopt' as Zone, 'trial', 'assess', 'hold'] as Zone[]) {
        const zc = ZONE_CONFIG[zk];
        const midAngle = (quad.angleRange[0] + quad.angleRange[1]) / 2;
        const quadWidth = quad.angleRange[1] - quad.angleRange[0];
        const spread = quadWidth / (qItems.length + 1);
        const angle = midAngle + (idx - (qItems.length - 1) / 2) * spread;
        const zoneCenter = zc.innerR + (zc.outerR - zc.innerR) / 2;
        result[item.id][zk] = { x: zoneCenter * Math.cos(angle), y: -zoneCenter * Math.sin(angle) };
      }
    }
    return result;
  }, [items]);

  const getZone = (item: TechItem): Zone => (item.zone || 'adopt') as Zone;

  const handleAdd = useCallback(() => {
    if (!form.name.trim()) return;
    setItems(prev => [...prev, { ...form, name: form.name.trim(), id: String(Math.max(0, ...prev.map(i => parseInt(i.id))) + 1) }]);
    setShowModal(false);
    setForm({ name: '', language: 'Framework', quadrant: 'Q1', zone: 'adopt' });
  }, [form]);

  const handleRemove = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const cycleZone = useCallback((item: TechItem) => {
    const nxt: Record<Zone, Zone> = { adopt: 'trial', trial: 'assess', assess: 'hold', hold: 'adopt' };
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, zone: nxt[i.zone!] } : i));
  }, []);

  const resetToDefaults = useCallback(() => setItems(DEFAULT_ITEMS), []);

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <button onClick={() => setShowModal(true)} style={{ position:'absolute',top:-60,right:0,padding:'8px 14px',background:'#6366f1',border:'none',borderRadius:6,color:'#fff',fontSize:14,fontWeight:600,cursor:'pointer',boxShadow:'0 2px 12px rgba(99,102,241,.4)' }}>+ Add Technology</button>
      {showModal && <div style={{position:'fixed',inset:0,background:'#000a',zIndex:49}} onClick={() => setShowModal(false)} />}
      {showModal && (
        <motion.div initial={{ opacity:0,scale:.95 }} animate={{ opacity:1,scale:1 }} style={{position:'fixed',top:'50%',left:'50%',transform:'translate(-50%,-50%)',background:'#1a1d30',border:'1px solid #ffffff15',borderRadius:14,padding:24,boxShadow:'0 24px 64px rgba(0,0,0,.6)',minWidth:310,zIndex:50}}>
          <h3 style={{color:'#fff',margin:'0 0 16px'}}>Add Technology</h3>
          {(['name','language','quadrant','zone'] as const).map(field => (
            <div key={field} style={{marginBottom:12}}>
              <label style={{display:'block',color:'#9ca3af',fontSize:11,marginBottom:3}}>{field.charAt(0).toUpperCase()+field.slice(1)}</label>
              {field === 'name' ? (
                <input value={form[field]} onChange={e => setForm(p=>({...p,[field]:e.target.value}))} onKeyDown={e=>{if(e.key==='Enter')handleAdd()}} autoFocus style={{width:'100%',padding:'7px 10px',background:'#11142aee',border:'1px solid #ffffff15',borderRadius:6,color:'#fff',fontSize:13}} />
              ) : (
                <select value={form[field]} onChange={e => { const v = field==='quadrant'? e.target.value as QuadrantCode : field==='zone' ? e.target.value as Zone : e.target.value; setForm(p=>({...p,[field]:v})) }} style={{width:'100%',padding:'7px 10px',background:'#11142aee',border:'1px solid #ffffff15',borderRadius:6,color:'#fff',fontSize:13}}>
                  {field==='language' && ['Framework','Language','Practices','Platform','Architect.','Tool'].map(t=><option key={t} value={t}>{t}</option>)}
                  {field==='quadrant' && Object.entries(QUADRANT_CONFIG).map(([k,v])=>{const kv=k as QuadrantCode;return <option key={kv} value={kv}>{v.name}</option>})}
                  {field==='zone' && Object.entries(ZONE_CONFIG).map(([k,v])=>{const kv=k as Zone;return <option key={kv} value={kv}>{v.label}</option>})}
                </select>
              )}
            </div>
          ))}
          <div style={{display:'flex',gap:10,justifyContent:'flex-end'}}>
            <button onClick={()=>setShowModal(false)} style={{padding:'7px 14px',background:'transparent',border:'1px solid #ffffff15',borderRadius:6,color:'#9ca3af',fontSize:13}}>Cancel</button>
            <button onClick={handleAdd} style={{padding:'7px 14px',background:'#6366f1',border:'none',borderRadius:6,color:'#fff',fontSize:13,fontWeight:600}}>Add</button>
          </div>
        </motion.div>
      )}
      {hoveredId && (() => { const item = items.find(i => i.id === hoveredId); if (!item) return null; return (<div style={{position:'absolute',bottom:-10,left:'50%',transform:'translateX(-50%)',background:'#1a1d30ee',border:'1px solid #ffffff18',borderRadius:8,padding:'4px 12px',zIndex:20,pointerEvents:'none',whiteSpace:'nowrap',display:'flex',gap:6}}><span style={{color:langColor(item.language),fontWeight:700}}>{item.name}</span></div>); })()}
      <svg viewBox="-420 -420 840 840" style={{width:'100%',maxWidth:760,height:'auto',background:'#11142a',borderRadius:20}}>
        <circle cx="0" cy="0" r={400} fill="#11142a" />
        {(['Q1','Q2','Q3','Q4'] as QuadrantCode[]).map(q => {
          const a = QUADRANT_CONFIG[q].angleRange;
          const x1 = 400 * Math.cos(a[0]);
          const y1 = -400 * Math.sin(a[0]);
          const x2 = 400 * Math.cos(a[1]);
          const y2 = -400 * Math.sin(a[1]);
          const largeArc = (a[1] - a[0]) > Math.PI ? 1 : 0;
          const d = `M 0 0 L ${x1} ${y1} A 400 400 0 ${largeArc} 1 ${x2} ${y2} Z`;
          return <path key={q} d={d} fill={QUADRANT_CONFIG[q].color+'15'} />;
        })}
        {Object.values(ZONE_CONFIG).map(zc => <circle key={zc.label} cx="0" cy="0" r={zc.outerR} fill="none" stroke="#ffffff08" strokeWidth={1} />)}
        {[-Math.PI/2,0,Math.PI/2,Math.PI].map(a => <line key={'l'+a} x1={-400*Math.cos(a)} y1={-400*Math.sin(a)} x2={400*Math.cos(a)} y2={400*Math.sin(a)} stroke="#ffffff06" strokeWidth={1} />)}
        <circle cx="0" cy="0" r={28} fill="#0a0c16" stroke="#ffffff12" strokeWidth={1.5} /><circle cx="0" cy="0" r={8} fill="#252840" />
        {Object.entries(QUADRANT_CONFIG).map(([k,v]) => { const p: Record<QuadrantCode,[number,number]> = { Q1:[260,-235],Q2:[-255,-215],Q3:[260,248],Q4:[-255,228] }; const [x,y]=p[k as QuadrantCode]; return <text key={k} x={x} y={y} textAnchor={x>0?'start':'end'} fill={v.color+'cc'} fontSize={13} fontWeight={700}>{v.name}</text>; })}
        {items.map(item => { const zone=getZone(item); const pos=positions[item.id]?.[zone]; if(!pos) return null; const c=langColor(item.language); const zc=ZONE_CONFIG[zone]; const hv=hoveredId===item.id; return (<g key={item.id} style={{cursor:'pointer'}} onClick={()=>cycleZone(item)} onMouseEnter={()=>setHoveredId(item.id)} onMouseLeave={()=>setHoveredId(null)}>{hv && <circle cx={pos.x} cy={pos.y} r={18} fill={`${c}15`} />}<circle cx={pos.x} cy={pos.y} r={7} fill={c} stroke="#11142a" strokeWidth={3}/><circle cx={pos.x} cy={pos.y} r={9} fill="none" stroke={zc.color} strokeWidth={2.5}/>{hv && (<g onClick={e=>{e.stopPropagation();handleRemove(item.id);}} style={{cursor:'pointer'}}><circle cx={pos.x+14} cy={pos.y-14} r={8} fill="#ef4444cc" stroke="#11142a" strokeWidth={2}/><text x={pos.x+14} y={pos.y-10} textAnchor="middle" fill="#fff" fontSize={11}>x</text></g>)}</g>); })}
      </svg>
      <div style={{display:'flex',gap:24,alignItems:'center',marginTop:16,flexWrap:'wrap',justifyContent:'center'}}>
        <span style={{color:'#555',fontSize:9,fontWeight:700,letterSpacing:1}}>ZONE</span>
        {Object.entries(ZONE_CONFIG).map(([k,v]) => (<div key={k} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:8,height:8,borderRadius:4,background:v.color}} /><span style={{color:'#9ca3af',fontSize:10}}>{v.label}</span></div>))}
        <div style={{width:1,height:16,background:'#ffffff10'}} />
        <span style={{color:'#555',fontSize:9,fontWeight:700,letterSpacing:1}}>TYPE</span>
        {Object.entries(LANG_COLORS).map(([t,c]) => (<div key={t} style={{display:'flex',alignItems:'center',gap:4}}><div style={{width:6,height:6,borderRadius:3,background:c}} /><span style={{color:'#9ca3af',fontSize:10}}>{t}</span></div>))}
      </div>
      <button onClick={resetToDefaults} style={{marginTop:8,background:'transparent',border:'none',color:'#555',fontSize:11,cursor:'pointer'}}>Reset defaults</button>
    </div>
  );
}
