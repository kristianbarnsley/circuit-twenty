import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BottomNav, Box, Header, Prompt } from '../components/ui';
import { EQUIPMENT_DEFS, exercisePool } from '../data/exercises';
import { useSessions } from '../db/repo';
import type { Equipment } from '../domain/types';
import { buildHistoryState } from '../engine/history';
import { generate } from '../engine/planner';
import { newSeed } from '../engine/rng';
import { useApp } from '../state/store';
import { makeSlot } from './shared';

export default function Create() {
  const nav = useNavigate();
  const equipment = useApp((s) => s.equipment);
  const setEquipment = useApp((s) => s.setEquipment);
  const setDraft = useApp((s) => s.setDraft);
  const sessions = useSessions();
  const [error, setError] = useState('');

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

  return (
    <>
      <Header />
      <main className="main">
        <div className="stack g10">
          <Prompt cmd="new_session" />
          <h1 className="h1 xl">Build a<br /><span className="hi">20:00</span> circuit</h1>
          <div className="chips"><span>3 exercises</span><span>AMRAP</span><span>20 min cap</span></div>
        </div>

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

        <div className="spacer" />

        <button type="button" className="cta" onClick={onGenerate} disabled={!sessions}>
          <span>GENERATE WORKOUT</span>
          <span style={{ fontSize: 18 }}>↵</span>
        </button>
      </main>
      <BottomNav />
    </>
  );
}
