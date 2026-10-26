import React, { useState } from 'react';

const INK = '#21324a';
const MUTED = '#68778f';
const BLUE = '#27446e';
const GREEN = '#228d5c';
const ORANGE = '#f07e47';
const RED = '#c43f52';
const LINE = '#d7deea';

const DMODEL = 512;
const WARMUP = 4000;
const MAXSTEP = 300000;
const YMIN = 1e-7;
const YMAX = 2e-3;

const lrate = (step: number) => Math.pow(DMODEL, -0.5) * Math.min(Math.pow(Math.max(step, 1), -0.5), (Math.max(step, 1) * Math.pow(WARMUP, -1.5)));

/** 学习率公式（式 3）与训练预算：预热 4000 步后按 1/√step 衰减。 */
export const TrainCurve = () => {
  const [step, setStep] = useState(4000);
  const W = 1280;
  const H = 300;
  const lx = (s: number) => 80 + (Math.log10(Math.max(s, 1)) / Math.log10(MAXSTEP)) * (W - 140);
  const ly = (v: number) => 260 - ((Math.log10(v) - Math.log10(YMIN)) / (Math.log10(YMAX) - Math.log10(YMIN))) * 210;

  const pts = Array.from({ length: 220 }).map((_, k) => {
    const s = Math.pow(10, (k / 219) * Math.log10(MAXSTEP));
    return `${lx(s).toFixed(1)},${ly(lrate(s)).toFixed(1)}`;
  });

  const warm = step < WARMUP;
  const val = lrate(step);

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 16, color: INK }}>
      <div style={{ flex: 1, minHeight: 0, background: '#ffffff', border: `1px solid ${LINE}`, borderRadius: 18, padding: '10px 16px' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" role="img" aria-label="学习率随训练步数的变化曲线">
          <rect x={lx(1)} y="40" width={lx(WARMUP) - lx(1)} height="220" fill="#eef3fb" />
          <text x={(lx(1) + lx(WARMUP)) / 2} y="30" textAnchor="middle" fontSize="22" fill={BLUE}>预热 4000 步</text>
          <line x1="80" y1="260" x2={W - 60} y2="260" stroke="#9fb0c8" strokeWidth="2" />
          {[1, 10, 100, 1000, 10000, 100000].map((s) => (
            <g key={s}>
              <line x1={lx(s)} y1="256" x2={lx(s)} y2="268" stroke="#9fb0c8" strokeWidth="2" />
              <text x={lx(s)} y="290" textAnchor="middle" fontSize="20" fill={MUTED}>{s >= 1000 ? `${s / 1000}K` : s}</text>
            </g>
          ))}
          <polyline points={pts.join(' ')} fill="none" stroke={GREEN} strokeWidth="4" />

          {[
            { s: 100000, label: 'base 100K · 12h', color: BLUE },
            { s: 300000, label: 'big 300K · 3.5 天', color: ORANGE },
          ].map((m) => (
            <g key={m.s}>
              <line x1={lx(m.s)} y1="40" x2={lx(m.s)} y2="260" stroke={m.color} strokeWidth="2" strokeDasharray="6 6" />
              <text x={lx(m.s)} y="60" textAnchor="middle" fontSize="20" fill={m.color}>{m.label}</text>
            </g>
          ))}

          <circle cx={lx(step)} cy={ly(val)} r="10" fill={warm ? BLUE : GREEN} />
          <text x={lx(step)} y={ly(val) - 20} textAnchor="middle" fontSize="22" fill={warm ? BLUE : GREEN}>step {step >= 1000 ? `${(step / 1000).toFixed(1)}K` : step}</text>
        </svg>
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 16, background: '#f7f9fc', border: `1px solid ${LINE}`, borderRadius: 16, padding: '10px 20px' }}>
        <span style={{ fontSize: 'var(--ppt-body-text)', whiteSpace: 'nowrap' }}>step = {step.toLocaleString()}</span>
        <input
          type="range"
          min={1}
          max={MAXSTEP}
          step={500}
          value={step}
          onChange={(e) => setStep(Number(e.target.value))}
          aria-label="训练步数"
          style={{ flex: 1, accentColor: GREEN }}
        />
        <span style={{ fontSize: 'var(--ppt-body-text)', color: warm ? BLUE : GREEN, minWidth: 0 }}>
          {warm ? '线性升温' : '按 1/√step 衰减'}
        </span>
      </label>

      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ flex: 1, background: '#ffffff', border: `1px solid ${LINE}`, borderRadius: 16, padding: '12px 20px' }}>
          <div style={{ fontSize: 'var(--ppt-body-text)' }}>
            当前学习率 <strong style={{ color: GREEN }}>{val.toExponential(2)}</strong>
          </div>
          <div style={{ fontSize: 22, color: MUTED, marginTop: 6 }}>
            lrate = 512<sup>−0.5</sup> · min(step<sup>−0.5</sup>, step · 4000<sup>−1.5</sup>)
          </div>
        </div>
        <div style={{ flex: 1, background: '#f7f9fc', border: `1px solid ${LINE}`, borderRadius: 16, padding: '12px 20px', fontSize: 22, color: MUTED }}>
          横轴为对数刻度；base 与 big 的步数/时长取自 page 7 §5.2（8×P100）。{step > 100000 ? <span style={{ color: RED }}> 超过 100K 才进入 big 的训练区间。</span> : null}
          <div style={{ marginTop: 6 }}>
            正则化：dropout 0.1、label smoothing ε<sub>ls</sub> = 0.1（§5.4）；嵌入与 pre-softmax 共享权重，嵌入层再乘 √d<sub>model</sub>（§3.4）。
          </div>
        </div>
      </div>
    </div>
  );
};
