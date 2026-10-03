import { useStore } from '../state/store';

export function VerdictBadge() {
  const { reach } = useStore();

  if (!reach) return null;

  const verdict = reach.verdict;
  const color = verdict === 'SUPPORTED' ? 'var(--pass)' : verdict === 'LIMITED' ? 'var(--warn)' : 'var(--fail)';

  return (
    <div style={{ 
      display: 'inline-block',
      padding: '4px 8px',
      borderRadius: 'var(--r)',
      border: `1px solid ${color}`,
      color: color,
      fontWeight: 'bold',
      fontSize: '0.9rem',
      textTransform: 'uppercase',
      marginBottom: 'var(--s2)'
    }}>
      {verdict}
    </div>
  );
}
