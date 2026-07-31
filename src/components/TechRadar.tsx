import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ZONE_CONFIG, sampleData, QUADRANT_CONFIG, langColor, LANG_COLORS } from '../data';

export default function TechRadar() {
  const [zones, setZones] = useState<Record<string, string>>({});
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const getZone = (id: string): 'adopt' | 'trial' | 'assess' | 'hold' => {
    return (zones[id] as 'adopt' | 'trial' | 'assess' | 'hold') || 'adopt';
  };

  const cycleZone = (id: string) => {
    const zone = getZone(id);
    const next: Record<string, string> = { adopt: 'trial', trial: 'assess', assess: 'hold', hold: 'adopt' };
    setZones(p => ({ ...p, [id]: next[zone]! }));
  };

  // Precompute positions for all items in all zones via useMemo
  const positions = useMemo(() => {
    const result: Record<string, Record<string, { x: number; y: number }>> = {};

    for (const item of sampleData) {
      if (!result[item.id]) result[item.id] = {};
      const qItems = sampleData.filter(i => i.quadrant === item.quadrant);
      const idx = qItems.indexOf(item);
      const quad = QUADRANT_CONFIG[item.quadrant];

      for (const zoneKey of ['adopt' as const, 'trial' as const, 'assess' as const, 'hold' as const]) {
        const zc = ZONE_CONFIG[zoneKey];
        if (!result[item.id][zoneKey]) {
          const midAngle = (quad.angleRange[0] + quad.angleRange[1]) / 2;
          const spread = Math.PI / (qItems.length + 1);
          const angle = midAngle + (idx - (qItems.length - 1) / 2) * spread;
          const zoneCenter = zc.innerR + (zc.outerR - zc.innerR) / 2;
          const jitter = (idx % 3 - 1) * 4;
          result[item.id][zoneKey] = {
            x: (zoneCenter + jitter) * Math.cos(angle),
            y: -(zoneCenter + jitter) * Math.sin(angle),
          };
        }
      }
    }

    return result;
  }, []);

  const QUADRANT_COLOR_MAP = ['#ec489915', '#6366f115', '#06b6d415', '#a78bfa15'] as const;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Tooltip */}
      {hoveredId && (() => {
        const item = sampleData.find(i => i.id === hoveredId);
        if (!item) return null;
        return (
          <div
            style={{
              position: 'absolute',
              top: 20,
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1a1d30ee',
              border: '1px solid #ffffff18',
              borderRadius: 8,
              padding: '6px 14px',
              zIndex: 20,
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            <span style={{ color: langColor(item.language), fontWeight: 700, fontSize: 14 }}>
              {item.name}
            </span>
            <span style={{ color: '#8b9cb5', marginLeft: 8, fontSize: 12 }}>{item.language}</span>
          </div>
        );
      })()}

      <svg
        viewBox="-420 -420 840 840"
        style={{ width: '100%', maxWidth: 760, height: 'auto', background: '#11142a', borderRadius: 20 }}
      >
        {/* Background circle */}
        <circle cx="0" cy="0" r={400} fill="#11142a" />

        {/* Quadrant regions */}
        {[
          'Q1', 'Q2', 'Q3', 'Q4' as const].map((q, i) => {
            const qConfig = QUADRANT_CONFIG[q];
            const [startAngle, endAngle] = qConfig.angleRange;
            const x1 = 400 * Math.cos(startAngle);
            const y1 = -400 * Math.sin(startAngle);
            const x2 = 400 * Math.cos(endAngle);
            const y2 = -400 * Math.sin(endAngle);
            const largeArc = (endAngle - startAngle) > Math.PI ? 1 : 0;
            const d = `M ${x1} ${y1} A 400 400 0 0 ${largeArc} ${x2} ${y2}`;
            return <path key={q} d={d} fill={`${QUADRANT_CONFIG[q].color}15`} />;
          })}

        {/* Zone boundary circles */}
        {[ZONE_CONFIG.adopt.outerR, ZONE_CONFIG.trial.outerR, ZONE_CONFIG.assess.outerR, ZONE_CONFIG.hold.outerR].map((r, i) => (
          <circle key={i} cx="0" cy="0" r={r} fill="none" stroke="#ffffff08" strokeWidth={1} />
        ))}

        {/* Axis lines */}
        {[-Math.PI / 2, 0, Math.PI / 2, Math.PI].map((a) => (
          <line
            key={a.toString()}
            x1={-400 * Math.cos(a)} y1={-400 * Math.sin(a)}
            x2={400 * Math.cos(a)} y2={400 * Math.sin(a)}
            stroke="#ffffff06" strokeWidth={1}
          />
        ))}

        {/* Center dot */}
        <circle cx="0" cy="0" r={28} fill="#0a0c16" stroke="#ffffff12" strokeWidth={1.5} />
        <circle cx="0" cy="0" r={8} fill="#252840" />

        {/* Quadrant labels */}
        {([
          { key: 'Q1' as const, x: 260, y: -235 },
          { key: 'Q2' as const, x: -255, y: -215 },
          { key: 'Q3' as const, x: 260, y: 248 },
          { key: 'Q4' as const, x: -255, y: 228 },
        ]).map(({ key, x, y }) => (
          <text key={key} x={x} y={y} textAnchor={x > 0 ? 'start' : 'end'} fill={`${QUADRANT_CONFIG[key].color}cc`} fontSize={13} fontWeight={700}>
            {QUADRANT_CONFIG[key].name}
          </text>
        ))}

        {/* Zone ring radius labels */}
        {[ZONE_CONFIG.adopt, ZONE_CONFIG.trial, ZONE_CONFIG.assess, ZONE_CONFIG.hold].map((zc) => (
          <text key={zc.label} x={0} y={-(zc.innerR + zc.outerR) / 2 + 4} textAnchor="middle" fill={`${zc.color}70`} fontSize={9} fontWeight={600}>
            {Math.round((zc.innerR + zc.outerR) / 2)}
          </text>
        ))}

        {/* Items */}
        {sampleData.map((item) => {
          const zone = getZone(item.id);
          const pos = positions[item.id]?.[zone];
          if (!pos) return null;
          const c = langColor(item.language);
          const zc = ZONE_CONFIG[zone];
          const isHovered = hoveredId === item.id;

          return (
            <g
              key={item.id}
              onClick={(e) => { e.stopPropagation(); cycleZone(item.id); }}
              onMouseEnter={() => setHoveredId(item.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{ cursor: 'pointer' }}
            >
              <circle cx={pos.x} cy={pos.y} r={24} fill="transparent" />
              {isHovered && (
                <circle cx={pos.x} cy={pos.y} r={18} fill={`${c}15`} />
              )}
              <motion.circle
                cx={pos.x} cy={pos.y} r={isHovered ? 9 : 7}
                fill="none" stroke={zc.color} strokeWidth={2.5}
                layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
              <motion.circle
                cx={pos.x} cy={pos.y} r={isHovered ? 8 : 6}
                fill={c} stroke="#11142a" strokeWidth={3}
                layout transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            </g>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', gap: 24, alignItems: 'center', marginTop: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
        <span style={{ color: '#555', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>ZONE</span>
        {Object.values(ZONE_CONFIG).map((zc) => (
          <div key={zc.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, background: zc.color }} />
            <span style={{ color: '#9ca3af', fontSize: 10 }}>{zc.label}</span>
          </div>
        ))}
        <div style={{ width: 1, height: 16, background: '#ffffff10' }} />
        <span style={{ color: '#555', fontSize: 9, fontWeight: 700, letterSpacing: 1 }}>TYPE</span>
        {Object.entries(LANG_COLORS).map(([type, color]) => (
          <div key={type} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
            <span style={{ color: '#9ca3af', fontSize: 10 }}>{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
