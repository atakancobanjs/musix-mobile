export const formatDuration = (value) => {
  if (!value || isNaN(value)) return "00:00";

  // Eğer değer 10.000'den büyükse muhtemelen milisaniyedir, saniyeye çevir.
  let seconds = value > 10000 ? Math.floor(value / 1000) : Math.floor(value);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
};
