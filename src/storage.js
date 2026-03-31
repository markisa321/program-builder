export function load(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch {
    return fallback;
  }
}

export function store(key, val) {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch {}
}
