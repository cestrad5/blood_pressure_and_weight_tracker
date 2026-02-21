export const getBloodPressureStatus = (systolic, diastolic) => {
  if (systolic >= 180 || diastolic >= 120) return { label: 'Hypertensive Crisis', color: '#ef4444', level: 5 };
  if (systolic >= 140 || diastolic >= 90) return { label: 'Hypertension Stage 2', color: '#f87171', level: 4 };
  if (systolic >= 130 || diastolic >= 80) return { label: 'Hypertension Stage 1', color: '#fb923c', level: 3 };
  if (systolic >= 120 && diastolic < 80) return { label: 'Elevated', color: '#fbbf24', level: 2 };
  if (systolic < 120 && diastolic < 80) return { label: 'Normal', color: '#22c55e', level: 1 };
  
  return { label: 'Uncategorized', color: '#94a3b8', level: 0 };
};
