import { useStore } from '../state/store';
import type { ErosionProperties } from '../data/types';

function findFeature(
  fc: { features: { properties: ErosionProperties }[] } | null,
  id: string
): ErosionProperties | null {
  return fc?.features.find((f) => f.properties.id === id)?.properties ?? null;
}

export function EvidencePanel() {
  const { manifest, reach, stage, qc, erosion, accretion, selectedFeatureId, setSelectedFeatureId } = useStore();

  if (!selectedFeatureId || !manifest) return null;

  const feature =
    findFeature(erosion, selectedFeatureId) ??
    findFeature(accretion, selectedFeatureId) ??
    null;

  // Fall back to a headline metric when the selection is the headline, not a polygon.
  const metric =
    manifest.metrics.find((m) => m.id === selectedFeatureId) ??
    manifest.metrics.find((m) => m.id === reach?.headline_metric_id) ??
    null;

  const t0 = feature?.t0 ?? reach?.primary_pair?.t0 ?? null;
  const t1 = feature?.t1 ?? reach?.primary_pair?.t1 ?? null;
  const h0 = t0 ? stage?.acquisitions.find((a) => a.date === t0)?.h ?? null : null;
  const h1 = t1 ? stage?.acquisitions.find((a) => a.date === t1)?.h ?? null : null;

  const inputs = metric?.inputs ?? [];
  const checks = (metric?.qc_refs ?? [])
    .map((id) => qc?.checks.find((c) => c.id === id))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <div className="evidence-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--s3)' }}>
        <h3 style={{ margin: 0 }}>Evidence: {selectedFeatureId}</h3>
        <button
          onClick={() => setSelectedFeatureId(null)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text)', cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s3)' }}>
        {/* 1. What */}
        <section>
          <h4 style={{ margin: '0 0 var(--s1) 0' }}>What</h4>
          {feature ? (
            <div>
              {feature.class}: {feature.area_ha.toLocaleString()} ha
            </div>
          ) : metric ? (
            <div>
              {metric.label}: {metric.value.toLocaleString()} {metric.unit}
              {metric.low != null && metric.high != null ? ` (${metric.low}–${metric.high} ${metric.unit})` : ''}
            </div>
          ) : (
            <div>Not available</div>
          )}
        </section>

        {/* 2. Where */}
        <section>
          <h4 style={{ margin: '0 0 var(--s1) 0' }}>Where</h4>
          <div>{feature?.nearest_place ?? reach?.name ?? '—'}</div>
          {feature?.in_cegis_reach && <div style={{ color: 'var(--text-3)' }}>CEGIS reach: {feature.in_cegis_reach}</div>}
        </section>

        {/* 3. When */}
        <section>
          <h4 style={{ margin: '0 0 var(--s1) 0' }}>When</h4>
          <div>
            t0: {t0 ?? '—'} {h0 != null ? `(${h0} m)` : ''}
          </div>
          <div>
            t1: {t1 ?? '—'} {h1 != null ? `(${h1} m)` : ''}
          </div>
        </section>

        {/* 4. Radar crops */}
        {t0 && t1 && reach?.reach_id && (
          <section>
            <h4 style={{ margin: '0 0 var(--s1) 0' }}>Radar</h4>
            <div style={{ display: 'flex', gap: 'var(--s2)' }}>
              <img
                src={`/data/v1/${reach.reach_id}/img/radar_${t0}.png`}
                alt={`Radar ${t0}`}
                style={{ width: '50%', border: '1px solid var(--line)' }}
              />
              <img
                src={`/data/v1/${reach.reach_id}/img/radar_${t1}.png`}
                alt={`Radar ${t1}`}
                style={{ width: '50%', border: '1px solid var(--line)' }}
              />
            </div>
          </section>
        )}

        {/* 5. Sources */}
        <section>
          <h4 style={{ margin: '0 0 var(--s1) 0' }}>Sources</h4>
          {inputs.length === 0 && <div style={{ color: 'var(--text-3)' }}>No source data available</div>}
          {inputs.map((input, i) => (
            <div key={i} style={{ marginBottom: 'var(--s1)', fontSize: '0.92rem' }}>
              <div>{input.kind}</div>
              {input.granule && (
                <div>
                  <code style={{ color: 'var(--text-2)' }}>{input.granule}</code>
                </div>
              )}
              {input.acq_utc && <div style={{ color: 'var(--text-3)' }}>{input.acq_utc}</div>}
              {input.doi && (
                <a href={`https://doi.org/${input.doi}`} style={{ color: 'var(--water)' }}>
                  {input.doi}
                </a>
              )}
              {input.station && <div style={{ color: 'var(--text-2)' }}>Station: {input.station}</div>}
            </div>
          ))}
        </section>

        {/* 6. Method */}
        <section>
          <h4 style={{ margin: '0 0 var(--s1) 0' }}>Method</h4>
          <div>{metric?.definition ?? 'See Methods page.'}</div>
          {metric?.params && (
            <table style={{ marginTop: 'var(--s1)', fontSize: '0.9rem' }}>
              <tbody>
                {Object.entries(metric.params).map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ color: 'var(--text-3)', paddingRight: 'var(--s2)' }}>{k}</td>
                    <td>{String(v)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {metric?.method_ref && (
            <a href={`/${metric.method_ref}`} style={{ color: 'var(--water)' }}>
              Full method
            </a>
          )}
        </section>

        {/* 7. Checks */}
        <section>
          <h4 style={{ margin: '0 0 var(--s1) 0' }}>Checks</h4>
          {checks.length === 0 && <div style={{ color: 'var(--text-3)' }}>No linked checks</div>}
          {checks.map((c) => (
            <div key={c.id} style={{ fontSize: '0.92rem' }}>
              {c.status} — {c.label ?? c.id}
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
