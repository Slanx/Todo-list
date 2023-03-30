export const convertToMs = (value: string) => {
  const lastEl = value[value.length - 1];
  if (!Number.isNaN(Number(lastEl))) {
    return Number(value);
  }

  const amount = Number(value.slice(0, value.length - 1));

  const s = amount * 1000;
  const m = s * 60;
  const h = m * 60;
  const d = h * 24;

  switch (lastEl.toLowerCase()) {
    case 's':
      return s;
    case 'm':
      return m;
    case 'h':
      return h;
    case 'd':
      return d;
    default:
      throw new Error('Invalid value');
  }
};
