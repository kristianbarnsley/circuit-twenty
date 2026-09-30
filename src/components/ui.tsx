import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { ChartIcon, MinusIcon, PlusIcon } from './icons';

export function Header({ children }: { children?: ReactNode }) {
  return (
    <header className="hdr">
      <div className="logo">CIRCUIT<span>//</span>20</div>
      {children}
    </header>
  );
}

export function BottomNav() {
  return (
    <nav className="nav" aria-label="Primary">
      <NavLink to="/" end className={({ isActive }) => (isActive ? 'active' : '')}>
        <PlusIcon /> NEW
      </NavLink>
      <NavLink to="/history" className={({ isActive }) => (isActive ? 'active' : '')}>
        <ChartIcon /> LOG
      </NavLink>
    </nav>
  );
}

/** `~/circuit $ <cmd>` */
export function Prompt({ cmd }: { cmd: string }) {
  return <div className="prompt">~/circuit <b>$</b> {cmd}</div>;
}

/** Bordered section with its label notched into the top border. */
export function Box({
  label, meta, quiet, className = '', children, ...rest
}: {
  label: string;
  meta?: ReactNode;
  quiet?: boolean;
  className?: string;
  children: ReactNode;
} & React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={`box ${quiet ? 'quiet' : ''} ${className}`} {...rest}>
      <div className="box-label">{label}</div>
      {meta !== undefined && <div className="box-meta">{meta}</div>}
      {children}
    </section>
  );
}

export function Stepper({
  id, label, note, value, unit, step, min = 0, onChange, name,
}: {
  id: string;
  label: ReactNode;
  note?: string;
  value: number;
  unit: string;
  step: number;
  min?: number;
  name: string;
  onChange(v: number): void;
}) {
  const set = (v: number) => onChange(Math.max(min, Math.round(v * 100) / 100));
  return (
    <div className="stepper-row">
      <label htmlFor={id} className="stepper-label">
        <span>{label}</span>
        {note && <span className="note">{note}</span>}
      </label>
      <button type="button" className="icon-btn" aria-label={`Decrease ${unit} for ${name}`} onClick={() => set(value - step)}>
        <MinusIcon />
      </button>
      <div className="stepper-val">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          step={step}
          min={min}
          value={value}
          onChange={(e) => {
            const v = parseFloat(e.target.value);
            if (!Number.isNaN(v)) set(v);
          }}
        />
        <span>{unit}</span>
      </div>
      <button type="button" className="icon-btn" aria-label={`Increase ${unit} for ${name}`} onClick={() => set(value + step)}>
        <PlusIcon size={16} w={2.5} />
      </button>
    </div>
  );
}
