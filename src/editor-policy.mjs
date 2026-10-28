export function isAllowedLink(value) {
  if (typeof value !== 'string' || !value || /[\u0000-\u0020\u007f]/u.test(value)) return false;
  try {
    const url = new URL(value);
    return ['https:', 'http:', 'mailto:'].includes(url.protocol);
  } catch {
    return false;
  }
}

export function initialDocument(value) {
  const blocks = value.trim().split(/\r?\n\s*\r?\n/);
  return {
    type: 'doc',
    content: blocks.map(block => {
      const text = block.trim().replace(/[\t ]*\r?\n[\t ]*/g, ' ');
      return { type: 'paragraph', ...(text ? { content: [{ type: 'text', text }] } : {}) };
    }),
  };
}
