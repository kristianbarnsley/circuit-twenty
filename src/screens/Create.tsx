import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav, Box, Header, Prompt } from '../components/ui';
import { EQUIPMENT_DEFS, exercisePool } from '../data/exercises';
import { useSavedWorkouts, useSessions } from '../db/repo';
import type { Equipment } from '../domain/types';
import { buildHistoryState } from '../engine/history';
import { generate } from '../engine/planner';
import { newSeed } from '../engine/rng';
import { useApp } from '../state/store';
import { equipmentTags, makeSlot, savedExercises, workoutEquipment } from './shared';

export default function Create() {
  const nav = useNavigate();
  const equipment = useApp((s) => s.equipment);
  const setEquipment = useApp((s) => s.setEquipment);
  const setDraft = useApp((s) => s.setDraft);
  const sessions = useSessions();
  const saved = useSavedWorkouts();
  const [tab, setTab] = useState<'gen' | 'saved'>('gen');
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Skip saved workouts that reference exercises since removed from the DB.
  const usable = (saved ?? []).flatMap((w) => {
    const exs = savedExercises(w);
    return exs ? [{ w, exs }] : [];
  });
  const picked = usable.find((u) => u.w.id === pickedId) ?? usable[0];

  const pool = exercisePool(equipment);
  const toggle = (id: Equipment) =>
    setEquipment(equipment.includes(id) ? equipment.filter((e) => e !== id) : [...equipment, id]);

  const onGenerate = () => {
    const hist = buildHistoryState(sessions ?? []);
    const seed = newSeed();
    const exs = generate(pool, hist, seed);
    if (!exs) {
      setError('no valid circuit for this equipment');
      return;
    }
    setDraft({ seed, equipment, slots: exs.map((e) => makeSlot(e, hist)), excluded: [], swaps: 0 });
    nav('/generate');
  };

  const onLoad = () => {
    if (!picked) return;
    const hist = buildHistoryState(sessions ?? []);
    // Include the user's equipment so swaps on the next screen can use it too.
    const eq = [...new Set([...equipment, ...workoutEquipment(picked.exs)])];
    setDraft({ seed: newSeed(), equipment: eq, slots: picked.exs.map((e) => makeSlot(e, hist)), excluded: [], swaps: 0 });
    nav('/generate');
  };

  return (
    <>
      <Header />
      <main className="main">
        <div className="stack g10">
          <Prompt cmd="new_session" />
          <h1 className="h1 xl">Build a<br /><span className="hi">20:00</span> circuit</h1>
          <div className="chips"><span>3 exercises</span><span>AMRAP</span><span>20 min cap</span></div>
        </div>

        <div className="tabs2" role="group" aria-label="Workout source">
          <button type="button" aria-pressed={tab === 'gen'} className={tab === 'gen' ? 'on' : ''} onClick={() => setTab('gen')}>GENERATE</button>
          <button type="button" aria-pressed={tab === 'saved'} className={tab === 'saved' ? 'on' : ''} onClick={() => setTab('saved')}>
            SAVED ({usable.length})
          </button>
        </div>

        {tab === 'gen' ? (
          <>
            <Box label="equipment.available" meta={`${equipment.length}/${EQUIPMENT_DEFS.length}`} className="g8" style={{ paddingTop: 20, paddingInline: 12, paddingBottom: 12 }}>
              {EQUIPMENT_DEFS.map((d) => {
                const on = equipment.includes(d.id);
                return (
                  <label key={d.id} className={`check ${on ? 'on' : ''}`}>
                    <input className="sr" type="checkbox" checked={on} onChange={() => toggle(d.id)} />
                    <span className="mark">{on ? '[x]' : '[ ]'}</span>
                    <span className="stack" style={{ gap: 2, flexGrow: 1 }}>
                      <span className="label">{d.label}</span>
                      <span className="desc">{d.desc}</span>
                    </span>
                    <span className="status">{on ? 'ONLINE' : 'OFF'}</span>
                  </label>
                );
              })}
            </Box>

            <div className="log-lines">
              <b>&gt;</b> {pool.length} exercises in pool<br />
              <b>&gt;</b> bodyweight moves always included
              {error && <><br /><span className="toast err">! {error}</span></>}
            </div>
          </>
        ) : (
          <>
            <Box label="workouts.saved" meta={usable.length} className="g8" style={{ paddingTop: 20, paddingInline: 12, paddingBottom: 12 }}>
              {usable.length === 0 && <div className="small muted">no saved workouts yet</div>}
              {usable.map(({ w, exs }) => {
                const on = w.id === picked?.w.id;
                return (
                  <button key={w.id} type="button" aria-pressed={on} className={`pick ${on ? 'on' : ''}`} onClick={() => setPickedId(w.id)}>
                    <span className="mark">{on ? '[•]' : '[ ]'}</span>
                    <span className="stack g6" style={{ flexGrow: 1, minWidth: 0 }}>
                      <span className="name">{w.name}</span>
                      <span className="list">{exs.map((e) => e.name).join(' · ')}</span>
                      <span className="ex-tag">{equipmentTags(workoutEquipment(exs))}</span>
                    </span>
                    <span className="small muted" style={{ flexShrink: 0 }}>{exs.length} ex</span>
                  </button>
                );
              })}
            </Box>

            <div className="log-lines">
              <b>&gt;</b> finish a generated workout to save it here
            </div>
          </>
        )}

        <div className="spacer" />

        {tab === 'gen' ? (
          <button type="button" className="cta" onClick={onGenerate} disabled={!sessions}>
            <span>GENERATE WORKOUT</span>
            <span style={{ fontSize: 18 }}>↵</span>
          </button>
        ) : (
          <button type="button" className="cta" onClick={onLoad} disabled={!sessions || !picked}>
            <span className="ellipsis">{picked ? `LOAD ${picked.w.name.toUpperCase()}` : 'NO SAVED WORKOUTS'}</span>
            <span style={{ fontSize: 18 }}>↵</span>
          </button>
        )}
      </main>
      <BottomNav />
    </>
  );
}
