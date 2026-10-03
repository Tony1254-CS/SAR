import { useStore } from '../state/store';

export function QCPanel() {
  const { qc } = useStore();

  if (!qc) return null;

  const order = { FAIL: 0, WARN: 1, NOT_EVALUATED: 2, PASS: 3, INFO: 4 };

  const sortedChecks = [...qc.checks].sort((a, b) => {
    return (order[a.status] ?? 99) - (order[b.status] ?? 99);
  });

  return (
    <div className="qc-panel" style={{ marginTop: 0 }}>
      <h3 style={{ borderBottom: '1px solid var(--line)', paddingBottom: 'var(--s2)' }}>Quality Control</h3>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s2)' }}>
        {sortedChecks.map(check => {
          const color = check.status === 'PASS' ? 'var(--pass)' :
                        check.status === 'FAIL' ? 'var(--fail)' :
                        check.status === 'WARN' ? 'var(--warn)' : 'var(--text-3)';
          
          return (
            <div key={check.id} style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s2)' }}>
              <span style={{ color, fontWeight: 'bold', fontSize: '0.9rem', marginTop: 2, minWidth: 40 }}>
                {check.status === 'NOT_EVALUATED' ? 'N/A' : check.status}
              </span>
              <div>
                <div style={{ fontWeight: 500 }}>{check.label || check.id}</div>
                {check.value !== undefined && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-2)' }}>
                    Value: {check.value} {check.unit}
                  </div>
                )}
                {check.explanation && (
                  <div style={{ fontSize: '0.9rem', color: 'var(--text-3)', fontStyle: 'italic' }}>
                    {check.explanation}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
