function stripDangerousKeys(value) {
  if (Array.isArray(value)) return value.map(stripDangerousKeys);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !key.startsWith('$') && !key.includes('.'))
      .map(([key, nestedValue]) => [key, stripDangerousKeys(nestedValue)]),
  );
}

export function sanitizeRequest(req, _res, next) {
  if (req.body && typeof req.body === 'object') {
    req.body = stripDangerousKeys(req.body);
  }

  if (req.query && typeof req.query === 'object') {
    const sanitizedQuery = stripDangerousKeys(req.query);
    Object.keys(req.query).forEach((key) => {
      delete req.query[key];
    });
    Object.assign(req.query, sanitizedQuery);
  }

  next();
}
