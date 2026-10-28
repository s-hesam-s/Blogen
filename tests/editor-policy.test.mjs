import test from 'node:test';
import assert from 'node:assert/strict';
import { isAllowedLink, initialDocument } from '../src/editor-policy.mjs';

test('allows explicit web and email links', () => {
  for (const value of ['https://example.com/path?q=1', 'http://localhost:8000/', 'mailto:reader@example.com']) assert.equal(isAllowedLink(value), true);
});
test('rejects executable, local, relative and control-character links', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,test', 'file:///tmp/test', '//example.com', '/relative', 'https://example.com\n', '', null]) assert.equal(isAllowedLink(value), false);
});
test('initial text becomes a text node without HTML interpretation', () => {
  const text = '<strong>literal</strong>';
  assert.deepEqual(initialDocument(text).content[0].content, [{ type: 'text', text }]);
  assert.deepEqual(initialDocument(' ').content, [{ type: 'paragraph' }]);
});
