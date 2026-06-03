import sanitizeHtml from 'sanitize-html';

export function cleanString(value) {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value.trim(), { allowedAttributes: {}, allowedTags: [] });
}

export function cleanObject(input) {
  if (!input || typeof input !== 'object') return input;
  return Object.fromEntries(Object.entries(input).map(([key, value]) => [key, typeof value === 'string' ? cleanString(value) : value]));
}
