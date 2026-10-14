// Ordena en memoria por un campo de fecha (Timestamp de Firestore, Date, string o numero).
// Se usa en lugar de where(...).orderBy(...) para no depender de indices compuestos en Firestore.
function toMillis(value) {
  if (!value) return 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value._seconds === 'number') return value._seconds * 1000;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : 0;
}

function sortByDateDesc(items, field) {
  return [...items].sort((a, b) => toMillis(b?.[field]) - toMillis(a?.[field]));
}

module.exports = { sortByDateDesc, toMillis };
