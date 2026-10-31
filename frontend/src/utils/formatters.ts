/**
 * Industrial CrisisOps — Indian Domain Localization & Formatting Utilities
 * Standard: Indian Rupee (₹), Lakhs/Crores, DD MMM YYYY, Asia/Kolkata (IST), Engineering Units
 */

/**
 * Format a number into Indian Rupees with Indian numbering comma placement or compact Lakh/Crore notation.
 * Examples: ₹75,000; ₹3.06 lakh; ₹1.25 crore
 */
export function formatINR(val: number | null | undefined, options: { compact?: boolean } = {}): string {
  if (val === null || val === undefined || isNaN(val)) return '₹0';

  const num = Math.abs(val);

  if (options.compact) {
    if (num >= 10000000) {
      const crores = (val / 10000000).toFixed(2).replace(/\.00$/, '');
      return `₹${crores} crore`;
    }
    if (num >= 100000) {
      const lakhs = (val / 100000).toFixed(2).replace(/\.00$/, '');
      return `₹${lakhs} lakh`;
    }
  }

  // Standard Indian comma system: 12,34,567
  const formatted = Number(val).toLocaleString('en-IN', {
    maximumFractionDigits: 0
  });

  return `₹${formatted}`;
}

/**
 * Format date string into Indian Standard Time (IST) in DD MMM YYYY, HH:mm IST format.
 * Example: 31 Oct 2026, 14:30 IST
 */
export function formatDateIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    // Format with English month abbreviation
    const day = d.toLocaleDateString('en-IN', { day: '2-digit', timeZone: 'Asia/Kolkata' });
    const month = d.toLocaleDateString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' });
    const year = d.toLocaleDateString('en-IN', { year: 'numeric', timeZone: 'Asia/Kolkata' });
    const time = d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata' });

    return `${day} ${month} ${year}, ${time} IST`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Format date only: DD MMM YYYY (e.g. 31 Oct 2026)
 */
export function formatDateOnlyIST(dateInput: string | Date | null | undefined): string {
  if (!dateInput) return '—';
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const day = d.toLocaleDateString('en-IN', { day: '2-digit', timeZone: 'Asia/Kolkata' });
    const month = d.toLocaleDateString('en-IN', { month: 'short', timeZone: 'Asia/Kolkata' });
    const year = d.toLocaleDateString('en-IN', { year: 'numeric', timeZone: 'Asia/Kolkata' });

    return `${day} ${month} ${year}`;
  } catch {
    return String(dateInput);
  }
}

/**
 * Technical metric diagnosis helper providing units, reference limits, status, and plain-language interpretation.
 */
export interface MetricDiagnosis {
  metricName: string;
  currentReading: string;
  unit: string;
  normalLimit: string;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL';
  statusLabel: string;
  explanation: string;
  recommendedCheck: string;
}

export function diagnoseVibration(vibration_mm_s: number, threshold = 4.5): MetricDiagnosis {
  const isCritical = vibration_mm_s >= threshold;
  const isWarning = vibration_mm_s >= 2.5 && !isCritical;
  const status = isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'NORMAL';

  let explanation = 'Machine vibration is within normal ISO 10816 baseline limits. Mechanical balance is healthy.';
  let check = 'Continue regular 3-shift vibration logging.';

  if (isCritical) {
    explanation = `The machine is vibrating at ${vibration_mm_s.toFixed(2)} mm/s RMS, exceeding its configured threshold of ${threshold.toFixed(1)} mm/s RMS.`;
    check = 'Maintenance team should immediately inspect bearing assembly, shaft alignment, and foundation mounting bolts.';
  } else if (isWarning) {
    explanation = `Vibration is elevated (${vibration_mm_s.toFixed(2)} mm/s RMS) above standard 2.5 mm/s baseline but below critical emergency shutdown threshold.`;
    check = 'Schedule lubrication check and inspect for dynamic imbalance or loose coupling.';
  }

  return {
    metricName: 'Vibration Amplitude',
    currentReading: `${vibration_mm_s.toFixed(2)}`,
    unit: 'mm/s RMS',
    normalLimit: `≤ ${threshold.toFixed(1)} mm/s RMS`,
    status,
    statusLabel: isCritical ? 'Above configured limit' : isWarning ? 'Approaching limit' : 'Nominal baseline',
    explanation,
    recommendedCheck: check
  };
}

export function diagnoseTemperature(temp_celsius: number, threshold = 75.0): MetricDiagnosis {
  const isCritical = temp_celsius >= 85.0;
  const isWarning = temp_celsius >= threshold && !isCritical;
  const status = isCritical ? 'CRITICAL' : isWarning ? 'WARNING' : 'NORMAL';

  let explanation = 'Bearing and motor housing temperatures are within normal operating envelope.';
  let check = 'Normal coolant circulation active.';

  if (isCritical) {
    explanation = `Thermal sensor reading (${temp_celsius.toFixed(1)}°C) breached emergency limit (85.0°C). Severe heat generation indicates lubrication failure or extreme friction.`;
    check = 'Check cooling water flow immediately; prepare for safe electrical isolation to prevent thermal shaft seizure.';
  } else if (isWarning) {
    explanation = `Temperature (${temp_celsius.toFixed(1)}°C) is above normal configured limit of ${threshold.toFixed(1)}°C. Heat dissipation rate is degrading.`;
    check = 'Inspect lubrication level, clean cooler matrix, and verify auxiliary cooling bypass loop.';
  }

  return {
    metricName: 'Bearing Temperature',
    currentReading: `${temp_celsius.toFixed(1)}`,
    unit: '°C',
    normalLimit: `≤ ${threshold.toFixed(1)} °C`,
    status,
    statusLabel: isCritical ? 'Critical thermal breach' : isWarning ? 'Elevated temperature' : 'Nominal temperature',
    explanation,
    recommendedCheck: check
  };
}

