import React, { useState } from 'react';

const INK = '#21324a';
const MUTED = '#68778f';
const RED = '#c43f52';
const GREEN = '#228d5c';
const BLUE = '#27446e';
const ORANGE = '#f07e47';
const LINE = '#d7deea';

const ROWS = [
  { h: 1, bleu: 24.9, ppl: 5.29 },
  { h: 4, bleu: 25.5, ppl: 5.0 },
  { h: 8, bleu: 25.8, ppl: 4.92 },
  { h: 16, bleu: 25.8, ppl: 4.91 },
  { h: 32, bleu: 25.4, ppl: 5.01 },
];
const MIN = 24.5;
const MAX = 26.0;

/** Table 3 行(A)：头数与开发集 BLEU / PPL 的真实关系。 */
export const HeadAblation = () => {
  const [cur, setCur] = useState(0);
  const row = ROWS[cur];
  const best = Math.max(...ROWS.map((r) => r.bleu));
  const delta = row.bleu - best;

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 18, color: INK }}>
      <div style={{ display: 'flex', gap: 14 }}>
        {ROWS.map((r, i) => (
          <button
            key={r.h}
            onClick={() => setCur(i)}
            aria-pressed={cur === i}
            style={{
              flex: 1,
              cursor: 'pointer',
              padding: '12px 10px',
              borderRadius: 14,
              fontSize: 'var(--ppt-body-text)',
              border: `2px solid ${cur === i ? BLUE : LINE}`,
              background: cur === i ? '#eef3fb' : '#ffffff',
              color: cur === i ? BLUE : INK,
            }}
          >
            h = {r.h}
            <div style={{ fontSize: 22, color: MUTED }}>{r.bleu.toFixed(1)} BLEU</div>
          </button>
        ))}
      </div>

      <div style={{ flex: 1, minHeight: 0, background: '#ffffff', border: `1px solid ${LINE}`, borderRadius: 18, padding: '14px 26px 6px' }}>
        <svg viewBox="0 0 1280 320" width="100%" height="100%" style={{ display: 'block' }} role="img" aria-label="不同头数在开发集上的 BLEU 散点图">
          {[24.5, 25.0, 25.5, 26.0].map((t) => {
            const x = 150 + ((t - MIN) / (MAX - MIN)) * 900;
            return (
              <g key={t}>
                <line x1={x} y1="40" x2={x} y2="250" stroke={LINE} strokeWidth="1.5" strokeDasharray="4 6" />
                <text x={x} y="282" textAnchor="middle" fontSize="22" fill={MUTED}>{t.toFixed(1)}</text>
              </g>
            );
          })}
          <line x1="150" y1="250" x2="1050" y2="250" stroke="#9fb0c8" strokeWidth="2" />
          <text x="600" y="312" textAnchor="middle" fontSize="24" fill={MUTED}>开发集 BLEU（newstest2013，越高越好）</text>

          {ROWS.map((r, i) => {
            const y = 70 + i * 40;
            const x = 150 + ((r.bleu - MIN) / (MAX - MIN)) * 900;
            const isCur = i === cur;
            const isBest = r.bleu === best;
            return (
              <g key={r.h}>
                <text x="30" y={y + 8} fontSize="24" fill={isCur ? INK : MUTED}>h={r.h}</text>
                <line x1="120" y1={y} x2={x} y2={y} stroke={isCur ? BLUE : '#e3e9f2'} strokeWidth={isCur ? 3 : 2} />
                <circle cx={x} cy={y} r={isCur ? 14 : 9} fill={isBest ? GREEN : isCur ? BLUE : '#9fb0c8'} />
                <text x={x + 26} y={y + 8} fontSize="24" fill={isCur ? INK : MUTED}>{r.bleu.toFixed(1)}</text>
                <text x="1120" y={y + 8} fontSize="24" fill={MUTED}>PPL {r.ppl.toFixed(2)}</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div style={{ display: 'flex', gap: 18, alignItems: 'stretch' }}>
        <div style={{ flex: 1, background: delta < -0.5 ? '#fdf2f4' : '#f4faf6', border: `1px solid ${delta < -0.5 ? '#f0c9d0' : '#cce5d8'}`, borderRadius: 16, padding: '12px 20px', fontSize: 'var(--ppt-body-text)' }}>
          {delta === 0
            ? `当前是这组实验里的最佳设置：${row.bleu.toFixed(1)} BLEU / ${row.ppl.toFixed(2)} PPL。`
            : `相对最佳设置 ${delta.toFixed(1)} BLEU${row.h === 1 ? '，与论文「单头差 0.9 BLEU」一致' : ''}。`}
        </div>
        <div style={{ flex: 1, background: '#f7f9fc', border: `1px solid ${LINE}`, borderRadius: 16, padding: '12px 20px', fontSize: 22, color: MUTED }}>
          Table 3 行(A)（page 9）：保持计算量近似不变，仅改头数（h=1/4/16/32 各自 d_k=512/128/32/16）；h=8 取同表 base 行。横轴为 24.5–26.0 的局部刻度，故用散点而非零基线柱形。
        </div>
      </div>
    </div>
  );
};
