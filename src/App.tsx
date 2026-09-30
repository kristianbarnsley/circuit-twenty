import { useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import Create from './screens/Create';
import Generate from './screens/Generate';
import History from './screens/History';
import Run from './screens/Run';
import Submit from './screens/Submit';
import { useApp } from './state/store';

/** On launch, jump back into an unfinished workout. */
function ResumeRun() {
  const nav = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    const run = useApp.getState().run;
    if (!run) return;
    const target = run.endedAt ? '/submit' : '/run';
    if (pathname !== target) nav(target, { replace: true });
    // Only on first mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}

export default function App() {
  return (
    <HashRouter>
      <ResumeRun />
      <div className="app">
        <Routes>
          <Route path="/" element={<Create />} />
          <Route path="/generate" element={<Generate />} />
          <Route path="/run" element={<Run />} />
          <Route path="/submit" element={<Submit />} />
          <Route path="/history" element={<History />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </HashRouter>
  );
}
