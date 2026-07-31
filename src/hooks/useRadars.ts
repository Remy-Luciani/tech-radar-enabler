import { useCallback, useEffect, useState } from 'react';
import { type TechItem, type QuadrantCode, type Zone } from '../data';
import { type Radar, loadRadars, saveRadars, canDeleteRadar, createRadar } from '../radars';

export interface AddItemInput {
  name: string;
  language: string;
  quadrant: QuadrantCode;
  zone: Zone;
}

export function useRadars() {
  const [radars, setRadars] = useState<Radar[]>(() => loadRadars());

  useEffect(() => {
    saveRadars(radars);
  }, [radars]);

  const getRadar = useCallback((id: string): Radar | undefined => {
    return radars.find(r => r.id === id);
  }, [radars]);

  const addRadar = useCallback((name: string): Radar => {
    const radar = createRadar(radars, name);
    setRadars(prev => [...prev, radar]);
    return radar;
  }, [radars]);

  const removeRadar = useCallback((id: string) => {
    setRadars(prev => {
      const target = prev.find(r => r.id === id);
      if (target === undefined) return prev;
      if (!canDeleteRadar(target)) return prev;
      return prev.filter(r => r.id !== id);
    });
  }, []);

  const renameRadar = useCallback((id: string, name: string) => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return;
    setRadars(prev => prev.map(r => {
      if (r.id !== id) return r;
      return { ...r, name: trimmed };
    }));
  }, []);

  const renameQuadrant = useCallback((radarId: string, quadrant: QuadrantCode, name: string): string | null => {
    const trimmed = name.trim();
    if (trimmed.length === 0) return 'Quadrant name cannot be empty';
    if (trimmed.length > 24) return 'Quadrant name is too long (max 24 characters)';

    const target = radars.find(r => r.id === radarId);
    if (target === undefined) return null;

    const otherNames = Object.entries(target.quadrantNames)
      .filter(([code]) => code !== quadrant)
      .map(([, value]) => value.toLowerCase());

    if (otherNames.includes(trimmed.toLowerCase())) return 'Another quadrant already has this name';

    setRadars(prev => prev.map(r => {
      if (r.id !== radarId) return r;
      return { ...r, quadrantNames: { ...r.quadrantNames, [quadrant]: trimmed } };
    }));

    return null;
  }, [radars]);

  const addItem = useCallback((radarId: string, input: AddItemInput) => {
    const trimmedName = input.name.trim();
    if (trimmedName.length === 0) return;

    setRadars(prev => prev.map(r => {
      if (r.id !== radarId) return r;

      const numericIds = r.items.map(i => parseInt(i.id)).filter(n => !Number.isNaN(n));
      const nextId = numericIds.length > 0 ? Math.max(0, ...numericIds) + 1 : 1;

      const newItem: TechItem = {
        id: String(nextId),
        name: trimmedName,
        language: input.language,
        quadrant: input.quadrant,
        zone: input.zone,
      };

      return { ...r, items: [...r.items, newItem] };
    }));
  }, []);

  const removeItem = useCallback((radarId: string, itemId: string) => {
    setRadars(prev => prev.map(r => {
      if (r.id !== radarId) return r;
      return { ...r, items: r.items.filter(i => i.id !== itemId) };
    }));
  }, []);

  const cycleZone = useCallback((radarId: string, itemId: string) => {
    const nextZone: Record<Zone, Zone> = { adopt: 'trial', trial: 'assess', assess: 'hold', hold: 'adopt' };
    setRadars(prev => prev.map(r => {
      if (r.id !== radarId) return r;
      return {
        ...r,
        items: r.items.map(i => {
          if (i.id !== itemId) return i;
          const currentZone = i.zone ?? 'adopt';
          return { ...i, zone: nextZone[currentZone] };
        }),
      };
    }));
  }, []);

  return { radars, getRadar, addRadar, removeRadar, renameRadar, renameQuadrant, addItem, removeItem, cycleZone };
}
