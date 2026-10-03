import { useStore } from '../state/store';
import type { ReachDetail } from '../data/types';

export function TelemetryPanel() {
  const { reach, selectedDate, manifest } = useStore();

  if (!reach) return null;
  const reachDetail = reach as ReachDetail;

  const headline = manifest?.metrics.find((m) => m.id === reachDetail.headline_metric_id);
  const params = headline?.params;
  
  let thresholdToDisplay = params?.threshold_db_t0;
  let thresholdLabel = 't0';
  
  if (selectedDate && reachDetail.primary_pair) {
    if (selectedDate === reachDetail.primary_pair.t1) {
      thresholdToDisplay = params?.threshold_db_t1;
      thresholdLabel = 't1';
    } else if (selectedDate === reachDetail.primary_pair.t0) {
      thresholdToDisplay = params?.threshold_db_t0;
      thresholdLabel = 't0';
    } else {
      thresholdLabel = 'other';
    }
  }

  // Find the exact granule for this date from inputs
  let currentGranule = 'L2 GCOV Provisional';
  if (selectedDate && headline?.inputs) {
    const yyyy = selectedDate.substring(0, 4);
    const mm = selectedDate.substring(4, 6);
    const dd = selectedDate.substring(6, 8);
    const dateStr = `${yyyy}-${mm}-${dd}`; // 2026-08-26
    
    const inputForDate = headline.inputs.find(inp => inp.acq_utc?.startsWith(dateStr) && inp.kind === 'NISAR_GCOV');
    if (inputForDate?.granule) {
      // Show the last part of the granule or the whole thing if it's short
      const parts = inputForDate.granule.split('_');
      // A common short representation for NISAR granules
      currentGranule = parts.length > 5 ? `${parts[0]}_..._${parts[parts.length-2]}` : inputForDate.granule;
    }
  }

  return (
    <div className="telemetry-panel">
      <div className="telemetry-header">
        <span>SAR OBSERVATION</span>
        <span style={{ fontSize: '0.78rem', opacity: 0.7 }}>L-BAND</span>
      </div>
      <div className="telemetry-data">
        <div className="telemetry-row">
          <span className="telemetry-label">SATELLITE:</span>
          <span className="telemetry-value highlight">NISAR</span>
        </div>
        <div className="telemetry-row">
          <span className="telemetry-label">GRANULE:</span>
          <span className="telemetry-value" title={currentGranule} style={{ fontSize: '0.78rem', maxWidth: '180px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            {currentGranule}
          </span>
        </div>
        <div className="telemetry-row">
          <span className="telemetry-label">REACH:</span>
          <span className="telemetry-value">{reachDetail.name.toUpperCase()}</span>
        </div>
        <div className="telemetry-row">
          <span className="telemetry-label">TRACK:</span>
          <span className="telemetry-value">
            {reachDetail.track?.relative_orbit} / {reachDetail.track?.direction} / F{reachDetail.track?.frame}
          </span>
        </div>
        <div className="telemetry-row">
          <span className="telemetry-label">POLARIZATION:</span>
          <span className="telemetry-value">HHHH (co-pol)</span>
        </div>
        <div className="telemetry-row">
          <span className="telemetry-label">ACTIVE DATE:</span>
          <span className="telemetry-value highlight">{selectedDate || '—'}</span>
        </div>
        {thresholdToDisplay != null && (
          <div className="telemetry-row">
            <span className="telemetry-label">THRESHOLD:</span>
            <span className="telemetry-value">
              {thresholdToDisplay.toFixed(1)} dB ({thresholdLabel})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
