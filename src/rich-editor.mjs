import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import { initialDocument, isAllowedLink } from './editor-policy.mjs';

function initializeEditor(textarea) {
  const wrapper = document.createElement('div');
  wrapper.className = 'rich-editor';
  const toolbar = document.createElement('div');
  toolbar.className = 'rich-editor__toolbar';
  toolbar.setAttribute('role', 'group');
  toolbar.setAttribute('aria-label', 'Text formatting');
  const content = document.createElement('div');
  const status = document.createElement('span');
  status.className = 'rich-editor__status';
  status.setAttribute('role', 'status');
  const label = textarea.parentElement.querySelector('label');
  const editorId = `${textarea.name}-editor`;
  if (label) label.id = `${editorId}-label`;
  wrapper.append(toolbar, content, status);
  textarea.after(wrapper);

  const editor = new Editor({
    element: content,
    extensions: [StarterKit.configure({
      heading: { levels: [2, 3] },
      link: {
        openOnClick: false,
        autolink: false,
        linkOnPaste: false,
        isAllowedUri: (url, context) => context.defaultValidate(url) && isAllowedLink(url),
        HTMLAttributes: { rel: 'noopener noreferrer nofollow', target: null },
      },
    })],
    content: initialDocument(textarea.value),
    editorProps: { attributes: {
      id: editorId,
      role: 'textbox',
      'aria-multiline': 'true',
      ...(label ? { 'aria-labelledby': label.id } : { 'aria-label': 'Body' }),
    } },
    onUpdate: ({ editor: current }) => { textarea.value = current.getHTML(); },
  });
  textarea.hidden = true;
  if (label) label.addEventListener('click', () => editor.commands.focus());

  const actions = [
    ['Bold', 'B', 'toggleBold', 'bold'],
    ['Italic', 'I', 'toggleItalic', 'italic'],
    ['Underline', 'U', 'toggleUnderline', 'underline'],
    ['Bullet list', '• List', 'toggleBulletList', 'bulletList'],
    ['Numbered list', '1. List', 'toggleOrderedList', 'orderedList'],
    ['Undo', 'Undo', 'undo'],
    ['Redo', 'Redo', 'redo'],
  ];
  const buttons = [];
  for (const [name, text, command, mark] of actions) {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = text;
    button.setAttribute('aria-label', name);
    button.title = name;
    button.addEventListener('click', () => editor.chain().focus()[command]().run());
    toolbar.append(button);
    if (mark) buttons.push({ button, mark });
  }
  const linkInput = document.createElement('input');
  linkInput.type = 'url';
  linkInput.placeholder = 'https://example.com';
  linkInput.setAttribute('aria-label', 'Link URL');
  const applyLink = document.createElement('button');
  applyLink.type = 'button';
  applyLink.textContent = 'Apply link';
  applyLink.addEventListener('click', () => {
    if (!isAllowedLink(linkInput.value)) {
      status.textContent = 'Use an absolute https, http or mailto link.';
      linkInput.setAttribute('aria-invalid', 'true');
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: linkInput.value }).run();
    status.textContent = '';
    linkInput.removeAttribute('aria-invalid');
  });
  linkInput.addEventListener('keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault();
      applyLink.click();
    }
  });
  const removeLink = document.createElement('button');
  removeLink.type = 'button';
  removeLink.textContent = 'Remove link';
  removeLink.addEventListener('click', () => editor.chain().focus().unsetLink().run());
  toolbar.append(linkInput, applyLink, removeLink);
  const updateButtons = () => {
    for (const { button, mark } of buttons) button.setAttribute('aria-pressed', String(editor.isActive(mark)));
  };
  editor.on('transaction', updateButtons);
  updateButtons();
}

for (const textarea of document.querySelectorAll('textarea[name="editor1"]')) {
  initializeEditor(textarea);
}
