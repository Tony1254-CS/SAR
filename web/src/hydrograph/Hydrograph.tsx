import { useMemo } from 'react';
import { scaleTime, scaleLinear } from 'd3-scale';
import { line } from 'd3-shape';
import { extent, min, max } from 'd3-array';
import { useStore } from '../state/store';
import { MatchWaterButton } from './MatchWaterButton';

export function Hydrograph({ width = 800, height = 150 }) {
  const { stage, selectedDate, setSelectedDate, compare } = useStore();
  
  if (!stage) return <div className="hydrograph-skeleton" style={{ width, height }} />;

  const margin = { top: 20, right: 100, bottom: 20, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const tParse = (tStr: string) => new Date(tStr);
  
  const series = stage.series;
  const acqs = stage.acquisitions;
  
  if (series.length === 0) return null;

  const xScale = useMemo(() => {
    return scaleTime()
      .domain(extent(series, d => tParse(d.t)) as [Date, Date])
      .range([0, innerWidth]);
  }, [series, innerWidth]);

  const yScale = useMemo(() => {
    const minH = min(series, d => d.h) || 0;
    let maxH = max(series, d => d.h) || 10;
    if (stage.station?.danger_level_m && stage.station.danger_level_m > maxH) {
      maxH = stage.station.danger_level_m;
    }
    return scaleLinear()
      .domain([Math.max(0, minH - 1), maxH + 1])
      .range([innerHeight, 0]);
  }, [series, stage.station, innerHeight]);

  const linePath = useMemo(() => {
    return line<{ t: string; h: number }>()
      .x(d => xScale(tParse(d.t)))
      .y(d => yScale(d.h))
      (series);
  }, [series, xScale, yScale]);

  const ticks = xScale.ticks(5);

  const matchStage = useMemo(() => {
    if (!compare.active || !compare.t0 || !stage) return null;
    const acq = stage.acquisitions.find(a => a.date === compare.t0);
    return acq ? acq.h : null;
  }, [compare, stage]);

  const formatDate = (d: string) => {
    if (d.length !== 8) return d;
    const dt = new Date(`${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6, 8)}T00:00:00Z`);
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  };

  return (
    <div style={{ position: 'relative', width, height, background: 'var(--panel)', borderTop: '1px solid var(--line)' }}>
      {/* Rain strip slot */}
      <div style={{ position: 'absolute', top: 0, left: margin.left, width: innerWidth, height: 16, borderBottom: '1px solid var(--line)' }} />

      <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}>
        <MatchWaterButton />
      </div>

      {/* Big, unambiguous date-switch buttons -- the graph's tiny dots below
          are hard to notice/click reliably, so this is the primary control
          for browsing single-date imagery; the graph stays for context.
          Reuses the rain-strip's reserved top strip (currently unused). */}
      {!compare.active && (
        <div style={{
          position: 'absolute', top: 0, left: margin.left, height: 16, zIndex: 10,
          display: 'flex', gap: 6, alignItems: 'center', background: 'var(--panel)',
        }}>
          <span style={{ color: 'var(--text-3)', fontSize: '0.82rem' }}>Showing:</span>
          {acqs.filter(a => a.status === 'ok').map((a) => {
            const isSelected = a.date === selectedDate;
            return (
              <button
                key={a.date}
                onClick={() => setSelectedDate(a.date)}
                aria-pressed={isSelected}
                style={{
                  background: isSelected ? 'var(--water)' : 'transparent',
                  color: isSelected ? '#04222b' : 'var(--text)',
                  border: isSelected ? '1px solid var(--water)' : '1px solid var(--line-strong)',
                  fontWeight: isSelected ? 700 : 400,
                  padding: '0px 8px',
                  lineHeight: '14px',
                  borderRadius: 'var(--r)',
                  cursor: 'pointer',
                  fontSize: '0.82rem',
                }}
              >
                {isSelected ? '✓ ' : ''}{formatDate(a.date)}
              </button>
            );
          })}
        </div>
      )}

      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Y Axis Grid lines (2-3 max per spec) */}
          {yScale.ticks(3).map(tickValue => (
            <g key={tickValue} transform={`translate(0,${yScale(tickValue)})`}>
              <line x2={innerWidth} stroke="var(--line)" />
              <text x={-5} dy="0.32em" fill="var(--text-3)" fontSize="12" textAnchor="end">{tickValue}</text>
            </g>
          ))}

          {/* X Axis */}
          <g transform={`translate(0,${innerHeight})`}>
            <line x2={innerWidth} stroke="var(--line)" />
            {ticks.map(tickValue => {
              const dateStr = tickValue.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
              return (
                <g key={tickValue.toString()} transform={`translate(${xScale(tickValue)},0)`}>
                  <line y2={5} stroke="var(--line)" />
                  <text y={15} fill="var(--text-3)" fontSize="12" textAnchor="middle">{dateStr}</text>
                </g>
              );
            })}
          </g>

          {/* Danger line */}
          {stage.station?.danger_level_m && (
            <g transform={`translate(0,${yScale(stage.station.danger_level_m)})`}>
              <line x2={innerWidth} stroke="var(--fail)" strokeDasharray="4,4" opacity={0.5} />
              <text x={innerWidth} y={-5} fill="var(--fail)" fontSize="12" textAnchor="end" opacity={0.8}>Danger Level</text>
            </g>
          )}

          {/* Match Stage line */}
          {matchStage !== null && (
            <g transform={`translate(0,${yScale(matchStage)})`}>
              <line x2={innerWidth} stroke="var(--water)" opacity={0.8} />
            </g>
          )}

          {/* Stage curve */}
          <path d={linePath || undefined} fill="none" stroke="var(--text)" strokeWidth={1.5} />

          {/* Acquisition Ticks */}
          {acqs.filter(a => a.status === 'ok').map(a => {
            const cx = xScale(tParse(a.t));
            const cy = yScale(a.h);
            const isSelected = a.date === selectedDate;
            return (
              <g key={a.date} transform={`translate(${cx},${cy})`} style={{ cursor: 'pointer' }} onClick={() => setSelectedDate(a.date)}>
                <circle r={isSelected ? 4 : 3} fill="var(--bg)" stroke="var(--water)" strokeWidth={isSelected ? 2 : 1.5} />
                <rect x={-2} y={0} width={4} height={8} fill="var(--water)" />
              </g>
            );
          })}
          {/* Earthquake Ticks */}
          {[{ date: "2026-08-26", mag: 5.2 }, { date: "2026-09-19", mag: 4.8 }].map(eq => {
            const dateStr = eq.date + "T00:00:00Z";
            const cx = xScale(tParse(dateStr));
            // Find stage height at this date to put the marker on the curve if possible
            const acq = acqs.find(a => a.date === eq.date.replace(/-/g, ''));
            const cy = acq ? yScale(acq.h) : (innerHeight / 2);
            return (
              <g key={eq.date} transform={`translate(${cx},${cy})`}>
                <line y1={-20} y2={20} stroke="#ff5a00" strokeWidth={1} strokeDasharray="2,2" />
                <circle r={3} fill="#ff5a00" />
                <rect x={-8} y={-35} width={16} height={12} fill="#ff5a00" rx={2} />
                <text y={-26} fill="#fff" fontSize="12" textAnchor="middle" fontWeight="bold">EQ</text>
                <text x={10} y={-26} fill="#ff5a00" fontSize="11" fontWeight="bold">M {eq.mag}</text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
