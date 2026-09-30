import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BottomNav, Box, Header, Prompt } from '../components/ui';
import { exportBackup, importBackup } from '../db/backup';
import { sessionRepo, useSessions } from '../db/repo';
import type { Session } from '../domain/types';
import {
  fmtClock, inRange, mostUsed, pacePerRound, roundsDecimal, scoreLabel, summarize, totalReps, weekStreak,
} from '../engine/stats';
import { fmtDate, loadLabel } from './shared';

const RANGES: { label: string; days: number | null }[] = [
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: 'ALL', days: null },
];
const EFFORTS = ['EASY', 'OK', 'HARD', 'V.HARD', 'MAX'];
const CHART_BARS = 12;

export default function History() {
  const all = useSessions();
  const [range, setRange] = useState(1);
  const [open, setOpen] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; err?: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const sessions = inRange(all ?? [], RANGES[range].days);
  const sum = summarize(sessions);
  const streak = weekStreak(all ?? []);
  const chart = sessions.slice(0, CHART_BARS).reverse();
  const chartMax = Math.max(1, ...chart.map(roundsDecimal));
  const used = mostUsed(sessions);
  const usedMax = Math.max(1, ...used.map((u) => u.count));

  const onImport = async (file: File | undefined) => {
    if (!file) return;
    try {
      const n = await importBackup(file);
      setToast({ msg: `[ok] imported ${n} session${n === 1 ? '' : 's'}` });
    } catch (e) {
      setToast({ msg: `! import failed: ${(e as Error).message}`, err: true });
    }
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <>
      <Header />
      <main className="main">
        <div className="stack g12">
          <Prompt cmd="log --stats" />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <h1 className="h1">History</h1>
            <div role="group" aria-label="Range" className="seg-ctl">
              {RANGES.map((r, i) => (
                <button key={r.label} type="button" aria-pressed={range === i} className={range === i ? 'on' : ''} onClick={() => setRange(i)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {all && all.length === 0 ? (
          <div className="empty">
            <span className="hi">&gt;</span> no sessions logged yet<br />
            <span className="hi">&gt;</span> <Link to="/">build your first circuit</Link>
          </div>
        ) : (
          <>
            <div className="grid2" style={{ gap: 8 }}>
              <div className="tile lg"><span className="k">SESSIONS</span><span className="v">{sum.count}</span></div>
              <div className="tile lg">
                <span className="k">BEST</span>
                <span className="v hi">{sum.best ? sum.best.rounds : '—'}{sum.best && <small> +{sum.best.partial}</small>}</span>
              </div>
              <div className="tile lg"><span className="k">AVG ROUNDS</span><span className="v">{sum.avgRounds.toFixed(1)}</span></div>
              <div className="tile lg hot"><span className="k">STREAK</span><span className="v">{streak}<small> wk{streak === 1 ? '' : 's'}</small></span></div>
            </div>

            {chart.length > 0 && (
              <Box label="rounds / session" style={{ gap: 10, paddingTop: 20, paddingBottom: 12 }}>
                <div className="chart">
                  {chart.map((s, i) => (
                    <div key={s.id} className={i === chart.length - 1 ? 'last' : ''}>
                      <span className="lbl">{s.rounds}</span>
                      <span className="bar" style={{ height: `${Math.round((roundsDecimal(s) / chartMax) * 100)}px` }} />
                    </div>
                  ))}
                </div>
                <div className="chart-axis">
                  <span>{fmtDate(chart[0].createdAt).split(' · ')[1]}</span>
                  <span>latest · {fmtDate(chart[chart.length - 1].createdAt).split(' · ')[1]}</span>
                </div>
              </Box>
            )}

            {used.length > 0 && (
              <Box label="most.used" quiet style={{ gap: 10, paddingTop: 20 }}>
                {used.map((u) => (
                  <div className="used" key={u.name}>
                    <span className="nm">{u.name}</span>
                    <span className="track"><span className="fill" style={{ width: `${Math.round((u.count / usedMax) * 100)}%` }} /></span>
                    <span className="n">{u.count}</span>
                  </div>
                ))}
              </Box>
            )}

            <section aria-label="Sessions" className="stack g8">
              <div className="small muted">sessions</div>
              {sessions.length === 0 && <div className="empty">nothing in this range</div>}
              {sessions.map((s) => (
                <SessionCard
                  key={s.id}
                  s={s}
                  open={open === s.id}
                  onToggle={() => { setOpen(open === s.id ? null : s.id); setConfirmDelete(null); }}
                  confirming={confirmDelete === s.id}
                  onDelete={() => setConfirmDelete(s.id)}
                  onCancelDelete={() => setConfirmDelete(null)}
                  onConfirmDelete={() => { sessionRepo.remove(s.id); setConfirmDelete(null); setOpen(null); }}
                />
              ))}
            </section>
          </>
        )}

        <div className="spacer" />

        <Box label="backup" quiet style={{ gap: 10, paddingTop: 20 }}>
          <div className="small muted">history lives on this phone only — export a copy now and then.</div>
          <div className="grid2">
            <button type="button" className="btn" onClick={() => exportBackup()}>EXPORT</button>
            <button type="button" className="btn" onClick={() => fileRef.current?.click()}>IMPORT</button>
          </div>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
          {toast && <div className={`toast ${toast.err ? 'err' : ''}`}>{toast.msg}</div>}
        </Box>
      </main>
      <BottomNav />
    </>
  );
}

function SessionCard({
  s, open, onToggle, confirming, onDelete, onCancelDelete, onConfirmDelete,
}: {
  s: Session;
  open: boolean;
  onToggle(): void;
  confirming: boolean;
  onDelete(): void;
  onCancelDelete(): void;
  onConfirmDelete(): void;
}) {
  return (
    <article className={`sess ${open ? 'open' : ''}`}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="stack g6" style={{ all: 'unset', display: 'flex', flexDirection: 'column', gap: 6, cursor: 'pointer' }}>
        <div className="sess-top">
          <span className="sess-date">{fmtDate(s.createdAt)}</span>
          <span className="sess-score">{scoreLabel(s)}</span>
        </div>
        <div className="sess-exs">{s.exercises.map((e) => e.name).join(' / ')}</div>
        {s.notes && !open && <div className="sess-note" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}><b>#</b> {s.notes}</div>}
      </button>
      {open && (
        <div className="stack g8" style={{ paddingTop: 6 }}>
          {s.exercises.map((e) => (
            <div className="row" key={e.exerciseId} style={{ fontSize: 12 }}>
              <span>{e.name} <span className="muted">×{e.reps}</span></span>
              <span className="muted">{loadLabel(e)}</span>
            </div>
          ))}
          <div className="small muted">
            {fmtClock(s.durationSec)} · {totalReps(s)} reps · {pacePerRound(s)}/rnd · effort <span className="amber">{EFFORTS[s.effort]}</span>
          </div>
          {s.notes && <div className="sess-note"><b>#</b> {s.notes}</div>}
          {confirming ? (
            <div className="confirm">
              <span>delete this session?</span>
              <div className="grid2">
                <button type="button" className="btn" onClick={onCancelDelete}>KEEP</button>
                <button type="button" className="btn danger" onClick={onConfirmDelete}>DELETE</button>
              </div>
            </div>
          ) : (
            <button type="button" className="link-btn" style={{ alignSelf: 'flex-end', color: 'var(--danger)' }} onClick={onDelete}>delete</button>
          )}
        </div>
      )}
    </article>
  );
}
