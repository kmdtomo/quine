/* ============================================================
   notion-editor.js
   Notion風ブロックエディタ（モックアップ用）
   - ブロック単位で見出し/段落/リスト/引用/コード/画像/区切り線を扱う
   - 各ブロックの左に「+」「⋮⋮」ハンドル
   - テキスト選択時にバブルメニュー（B / I / U / S / code / link）
   - Enter / Backspace / 矢印キーのNotion風挙動
   - スラッシュ（/）で挿入メニュー
   ============================================================ */
(function () {
  'use strict';

  // ------------------------------------------------------------
  // Block type definitions
  // ------------------------------------------------------------
  const BLOCK_TYPES = [
    {
      key: 'paragraph',
      label: 'テキスト',
      desc: 'プレーンな本文を書く',
      placeholder: 'なにか書き始める、または「/」でブロックを選択',
      hint: '',
      icon: svgIcon('paragraph'),
    },
    {
      key: 'heading-1',
      label: '見出し1',
      desc: '大見出し',
      placeholder: '見出し1',
      hint: '#',
      icon: svgIcon('h1'),
    },
    {
      key: 'heading-2',
      label: '見出し2',
      desc: '中見出し',
      placeholder: '見出し2',
      hint: '##',
      icon: svgIcon('h2'),
    },
    {
      key: 'heading-3',
      label: '見出し3',
      desc: '小見出し',
      placeholder: '見出し3',
      hint: '###',
      icon: svgIcon('h3'),
    },
    {
      key: 'bulleted-list',
      label: '箇条書きリスト',
      desc: '点付きのリスト',
      placeholder: 'リスト',
      hint: '・',
      icon: svgIcon('bullet'),
    },
    {
      key: 'numbered-list',
      label: '番号付きリスト',
      desc: '番号付きのリスト',
      placeholder: 'リスト',
      hint: '1.',
      icon: svgIcon('number'),
    },
    {
      key: 'quote',
      label: '引用',
      desc: '引用文を入れる',
      placeholder: '引用',
      hint: '"',
      icon: svgIcon('quote'),
    },
    {
      key: 'code',
      label: 'コード',
      desc: 'コードスニペットを入れる',
      placeholder: 'コード',
      hint: '```',
      icon: svgIcon('code'),
    },
    {
      key: 'divider',
      label: '区切り線',
      desc: 'ブロック間に水平線を入れる',
      placeholder: '',
      hint: '---',
      icon: svgIcon('divider'),
    },
    {
      key: 'image',
      label: '画像',
      desc: '画像をアップロード',
      placeholder: '',
      hint: '',
      icon: svgIcon('image'),
    },
  ];

  const TYPE_MAP = BLOCK_TYPES.reduce((m, t) => (m[t.key] = t, m), {});
  const TEXT_TYPES = [
    'paragraph', 'heading-1', 'heading-2', 'heading-3',
    'bulleted-list', 'numbered-list', 'quote', 'code',
  ];
  const TURN_INTO_TYPES = [
    'paragraph', 'heading-1', 'heading-2', 'heading-3',
    'bulleted-list', 'numbered-list', 'quote', 'code',
  ];

  // ------------------------------------------------------------
  // SVG icon sources (inline, keyed by id)
  // ------------------------------------------------------------
  function svgIcon(id) {
    const s = {
      paragraph: '<path d="M6 4h12M6 10h12M6 16h8"/>',
      h1: '<path d="M6 4v16M14 4v16M6 12h8"/><path d="M18 8h2v12"/>',
      h2: '<path d="M4 4v16M12 4v16M4 12h8"/><path d="M17 9a2 2 0 114 0c0 3-4 3-4 7h4"/>',
      h3: '<path d="M4 4v16M12 4v16M4 12h8"/><path d="M17 8h4l-2 3.5a2.5 2.5 0 11-2 4"/>',
      bullet: '<circle cx="5" cy="6" r="1.5" fill="currentColor"/><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="5" cy="18" r="1.5" fill="currentColor"/><path d="M10 6h10M10 12h10M10 18h10"/>',
      number: '<path d="M5 4v4M4 6h2M4 16l2-1v5M11 6h9M11 12h9M11 18h9"/>',
      quote: '<path d="M7 7h3v3H7c0 2 1 3 3 3M15 7h3v3h-3c0 2 1 3 3 3"/>',
      code: '<path d="M8 7l-4 5 4 5M16 7l4 5-4 5M14 5l-4 14"/>',
      divider: '<path d="M3 12h18"/>',
      image: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M21 17l-5-5-9 9"/>',
      plus: '<path d="M12 5v14M5 12h14"/>',
      handle: '<circle cx="9" cy="6" r="1.2" fill="currentColor"/><circle cx="9" cy="12" r="1.2" fill="currentColor"/><circle cx="9" cy="18" r="1.2" fill="currentColor"/><circle cx="15" cy="6" r="1.2" fill="currentColor"/><circle cx="15" cy="12" r="1.2" fill="currentColor"/><circle cx="15" cy="18" r="1.2" fill="currentColor"/>',
      trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>',
      copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M4 16V6a2 2 0 012-2h10"/>',
      bold: '<path d="M7 5h6a3 3 0 010 6H7zM7 11h7a3 3 0 010 6H7z"/>',
      italic: '<path d="M10 5h8M6 19h8M14 5l-4 14"/>',
      underline: '<path d="M7 5v7a5 5 0 0010 0V5M5 21h14"/>',
      strike: '<path d="M4 12h16M8 7a4 4 0 015-2h2M8 17a4 4 0 004 2h2a4 4 0 000-8"/>',
      link: '<path d="M10 14a5 5 0 017 0l3-3a5 5 0 00-7-7l-1 1M14 10a5 5 0 01-7 0l-3 3a5 5 0 007 7l1-1"/>',
      inlineCode: '<path d="M9 8l-4 4 4 4M15 8l4 4-4 4"/>',
      chevron: '<path d="M9 6l6 6-6 6"/>',
      upload: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5"/><path d="M12 3v15"/>',
    };
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (s[id] || '') + '</svg>';
  }

  // ------------------------------------------------------------
  // Utilities
  // ------------------------------------------------------------
  function uid() {
    return 'b_' + Math.random().toString(36).slice(2, 9);
  }

  function el(tag, attrs, ...children) {
    const node = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(k => {
        if (k === 'class') node.className = attrs[k];
        else if (k === 'html') node.innerHTML = attrs[k];
        else if (k.startsWith('on')) node.addEventListener(k.slice(2), attrs[k]);
        else node.setAttribute(k, attrs[k]);
      });
    }
    children.flat().forEach(c => {
      if (c == null || c === false) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function isCaretAtStart(contentEl) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return false;
    const r = sel.getRangeAt(0);
    if (!r.collapsed) return false;
    if (!contentEl.contains(r.startContainer)) return false;
    // Compare with a range that spans from the very beginning of contentEl to the caret.
    const probe = document.createRange();
    probe.selectNodeContents(contentEl);
    probe.setEnd(r.startContainer, r.startOffset);
    return probe.toString().length === 0;
  }

  function isCaretAtEnd(contentEl) {
    const sel = window.getSelection();
    if (!sel.rangeCount) return false;
    const r = sel.getRangeAt(0);
    if (!r.collapsed) return false;
    if (!contentEl.contains(r.startContainer)) return false;
    const probe = document.createRange();
    probe.selectNodeContents(contentEl);
    probe.setStart(r.endContainer, r.endOffset);
    return probe.toString().length === 0;
  }

  function placeCaretAt(contentEl, where /* 'start' | 'end' */) {
    contentEl.focus();
    const sel = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(contentEl);
    range.collapse(where !== 'end');
    sel.removeAllRanges();
    sel.addRange(range);
  }

  function contentText(block) {
    const c = block.querySelector('.n-block__content');
    return c ? c.textContent : '';
  }

  function contentEl(block) {
    return block.querySelector('.n-block__content');
  }

  // ------------------------------------------------------------
  // Editor instance
  // ------------------------------------------------------------
  function createEditor(root) {
    root.classList.add('n-editor');
    root.innerHTML = '';

    // Overlay layer (menus, bubble, slash) is appended to body to avoid overflow issues.
    const overlay = document.body;

    // Menu state
    let addMenu = null;
    let actionsMenu = null;
    let slashMenu = null;
    let bubbleMenu = null;
    let dragState = null;

    // --------------------------------------------------------
    // Block creation
    // --------------------------------------------------------
    function createBlock(type, opts) {
      opts = opts || {};
      const t = TYPE_MAP[type] || TYPE_MAP.paragraph;
      const block = el('div', {
        class: 'n-block',
        'data-type': t.key,
        'data-id': uid(),
      });

      // Gutter (handles)
      const gutter = el('div', { class: 'n-block__gutter' },
        el('button', {
          class: 'n-block__handle n-block__handle--add',
          type: 'button',
          'aria-label': 'Add block',
          title: 'Click to add a block below',
          html: svgIcon('plus'),
          onclick: (e) => { e.stopPropagation(); openAddMenu(block, e.currentTarget); },
        }),
        el('button', {
          class: 'n-block__handle n-block__handle--menu',
          type: 'button',
          'aria-label': 'Block options',
          title: 'Click to open menu, drag to move',
          html: svgIcon('handle'),
          onclick: (e) => { e.stopPropagation(); openActionsMenu(block, e.currentTarget); },
          onmousedown: (e) => { startDrag(block, e); },
        })
      );
      block.appendChild(gutter);

      // Body by type
      if (t.key === 'divider') {
        block.appendChild(el('hr', { class: 'n-block__hr' }));
      } else if (t.key === 'image') {
        block.appendChild(renderImageBody(block, opts.src || ''));
      } else {
        // Optional prefix (bullet / number)
        const prefix = renderPrefix(t.key);
        if (prefix) block.appendChild(prefix);

        const content = el('div', {
          class: 'n-block__content',
          contenteditable: 'true',
          spellcheck: 'false',
          'data-placeholder': t.placeholder,
        });
        if (opts.html) content.innerHTML = opts.html;
        else if (opts.text) content.textContent = opts.text;
        attachContentHandlers(content, block);
        block.appendChild(content);
      }
      return block;
    }

    function renderPrefix(type) {
      if (type === 'bulleted-list') {
        return el('div', { class: 'n-block__prefix n-block__prefix--bullet' }, '•');
      }
      if (type === 'numbered-list') {
        return el('div', { class: 'n-block__prefix n-block__prefix--number' }, '1.');
      }
      return null;
    }

    function renderImageBody(block, src) {
      const wrap = el('div', { class: 'n-block__image-wrap' });
      if (src) {
        wrap.appendChild(renderImageFilled(block, src));
      } else {
        wrap.appendChild(renderImageEmpty(block));
      }
      return wrap;
    }

    function renderImageEmpty(block) {
      const input = el('input', { type: 'file', accept: 'image/*', hidden: 'hidden' });
      input.addEventListener('change', (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
          const wrap = block.querySelector('.n-block__image-wrap');
          wrap.innerHTML = '';
          wrap.appendChild(renderImageFilled(block, reader.result));
        };
        reader.readAsDataURL(file);
      });

      const wrap = el('div', { class: 'n-block__image-empty' });

      const placeholder = el('button', {
        class: 'n-block__image-placeholder',
        type: 'button',
        onclick: () => input.click(),
      },
        el('span', { class: 'n-block__image-placeholder-icon', html: svgIcon('image') }),
        el('span', { class: 'n-block__image-placeholder-text' }, 'Click to upload an image'),
        el('span', { class: 'n-block__image-placeholder-hint' }, 'PNG · JPG · GIF / Max 2MB')
      );
      placeholder.appendChild(input);

      const removeBtn = el('button', {
        class: 'n-block__image-remove',
        type: 'button',
        'aria-label': 'ブロックを削除',
        title: 'ブロックを削除',
        html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
        onclick: (e) => {
          e.stopPropagation();
          e.preventDefault();
          deleteBlock(block);
        },
      });

      wrap.appendChild(placeholder);
      wrap.appendChild(removeBtn);
      return wrap;
    }

    function renderImageFilled(block, src) {
      const frame = el('div', { class: 'n-block__image-frame' },
        el('img', { class: 'n-block__image', src: src, alt: '' }),
        el('button', {
          class: 'n-block__image-remove',
          type: 'button',
          'aria-label': 'ブロックを削除',
          title: 'ブロックを削除',
          html: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
          onclick: (e) => {
            e.stopPropagation();
            deleteBlock(block);
          },
        })
      );
      return frame;
    }

    // --------------------------------------------------------
    // Content editable handlers
    // --------------------------------------------------------
    function attachContentHandlers(content, block) {
      content.addEventListener('keydown', (e) => handleKeydown(e, content, block));
      content.addEventListener('input', () => handleInput(content, block));
      content.addEventListener('focus', () => {
        block.classList.add('is-focused');
      });
      content.addEventListener('blur', () => {
        block.classList.remove('is-focused');
      });
    }

    function handleInput(content, block) {
      // Keep `is-empty` in sync so placeholder reflects empty state.
      const empty = !content.textContent && !content.querySelector('img');
      block.classList.toggle('is-empty', empty);

      // Slash menu trigger: open when `/` is typed into an empty block or at the start of a new word.
      const text = content.textContent || '';
      if (text === '/') {
        openSlashMenu(block);
      } else if (slashMenu && slashMenu.block === block) {
        // Update filter based on text after `/`
        if (text.startsWith('/')) {
          slashMenu.filter(text.slice(1));
        } else {
          closeSlashMenu();
        }
      }
    }

    function handleKeydown(e, content, block) {
      if (e.isComposing || e.keyCode === 229) return;

      // Slash menu navigation
      if (slashMenu && slashMenu.block === block && !slashMenu.root.hidden) {
        if (e.key === 'ArrowDown') { e.preventDefault(); slashMenu.move(1); return; }
        if (e.key === 'ArrowUp')   { e.preventDefault(); slashMenu.move(-1); return; }
        if (e.key === 'Enter')     { e.preventDefault(); slashMenu.commit(); return; }
        if (e.key === 'Escape')    { e.preventDefault(); closeSlashMenu(); return; }
      }

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleEnter(content, block);
        return;
      }

      if (e.key === 'Backspace') {
        if (isCaretAtStart(content)) {
          const handled = handleBackspaceAtStart(content, block);
          if (handled) e.preventDefault();
        }
        return;
      }

      if (e.key === 'ArrowUp') {
        if (caretAtFirstLine(content)) {
          const prev = block.previousElementSibling;
          if (prev && prev.classList.contains('n-block')) {
            e.preventDefault();
            focusBlock(prev, 'end');
          }
        }
        return;
      }
      if (e.key === 'ArrowDown') {
        if (caretAtLastLine(content)) {
          const next = block.nextElementSibling;
          if (next && next.classList.contains('n-block')) {
            e.preventDefault();
            focusBlock(next, 'start');
          }
        }
        return;
      }
    }

    function handleEnter(content, block) {
      const type = block.dataset.type;

      // Empty list item → convert to paragraph (Notion behavior)
      if ((type === 'bulleted-list' || type === 'numbered-list') && !content.textContent.trim()) {
        convertBlockType(block, 'paragraph');
        return;
      }

      // Split at caret: content after caret goes to new block
      const after = extractAfterCaret(content);
      const nextType = (type === 'bulleted-list' || type === 'numbered-list') ? type : 'paragraph';
      const newBlock = createBlock(nextType, { html: after });
      block.after(newBlock);
      renumberLists();
      focusBlock(newBlock, 'start');
    }

    function handleBackspaceAtStart(content, block) {
      const type = block.dataset.type;

      // Non-paragraph → convert to paragraph first
      if (type !== 'paragraph') {
        convertBlockType(block, 'paragraph');
        return true;
      }

      // Paragraph at start:
      const prev = block.previousElementSibling;
      if (!prev || !prev.classList.contains('n-block')) return false;

      // Previous is non-text (divider / image) → delete previous
      if (prev.dataset.type === 'divider' || prev.dataset.type === 'image') {
        prev.remove();
        return true;
      }

      // Merge current content into previous text block
      const prevContent = contentEl(prev);
      if (!prevContent) return false;
      const prevLen = prevContent.textContent.length;
      const frag = document.createDocumentFragment();
      while (content.firstChild) frag.appendChild(content.firstChild);
      prevContent.appendChild(frag);
      block.remove();
      renumberLists();

      // Place caret where the join happened
      placeCaretAtOffset(prevContent, prevLen);
      return true;
    }

    function placeCaretAtOffset(contentEl, offset) {
      contentEl.focus();
      const sel = window.getSelection();
      const range = document.createRange();
      // Walk text nodes to find offset
      let remaining = offset;
      let node = null;
      (function walk(n) {
        if (node) return;
        if (n.nodeType === 3) {
          if (remaining <= n.nodeValue.length) {
            node = n;
            return;
          }
          remaining -= n.nodeValue.length;
        } else {
          for (let i = 0; i < n.childNodes.length; i++) walk(n.childNodes[i]);
        }
      })(contentEl);
      if (node) {
        range.setStart(node, remaining);
      } else {
        range.selectNodeContents(contentEl);
        range.collapse(false);
      }
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
    }

    function extractAfterCaret(contentEl) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return '';
      const r = sel.getRangeAt(0);
      const after = document.createRange();
      after.setStart(r.endContainer, r.endOffset);
      after.setEndAfter(contentEl.lastChild || contentEl);
      const frag = after.extractContents();
      const tmp = document.createElement('div');
      tmp.appendChild(frag);
      return tmp.innerHTML;
    }

    function caretAtFirstLine(contentEl) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return false;
      const r = sel.getRangeAt(0);
      if (!contentEl.contains(r.startContainer)) return false;
      const probe = r.cloneRange();
      const rect = probe.getClientRects()[0] || contentEl.getBoundingClientRect();
      const cRect = contentEl.getBoundingClientRect();
      return (rect.top - cRect.top) < 8;
    }

    function caretAtLastLine(contentEl) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return false;
      const r = sel.getRangeAt(0);
      if (!contentEl.contains(r.startContainer)) return false;
      const probe = r.cloneRange();
      const rect = probe.getClientRects()[0] || contentEl.getBoundingClientRect();
      const cRect = contentEl.getBoundingClientRect();
      return (cRect.bottom - rect.bottom) < 8;
    }

    // --------------------------------------------------------
    // Block type conversion & reordering
    // --------------------------------------------------------
    function convertBlockType(block, newType) {
      const oldType = block.dataset.type;
      if (oldType === newType) return;

      // Non-text → non-text conversion: replace block entirely
      if (oldType === 'divider' || oldType === 'image' || newType === 'divider' || newType === 'image') {
        const fresh = createBlock(newType);
        block.replaceWith(fresh);
        renumberLists();
        if (TEXT_TYPES.indexOf(newType) !== -1) focusBlock(fresh, 'end');
        return;
      }

      // Text → text: keep content
      const oldContent = contentEl(block);
      const html = oldContent ? oldContent.innerHTML : '';
      const fresh = createBlock(newType, { html: html });
      block.replaceWith(fresh);
      renumberLists();
      focusBlock(fresh, 'end');
    }

    function focusBlock(block, where) {
      const c = contentEl(block);
      if (c) placeCaretAt(c, where || 'end');
    }

    function renumberLists() {
      let n = 0;
      root.querySelectorAll('.n-block').forEach(b => {
        if (b.dataset.type === 'numbered-list') {
          n++;
          const prefix = b.querySelector('.n-block__prefix--number');
          if (prefix) prefix.textContent = n + '.';
        } else {
          n = 0;
        }
      });
    }

    // --------------------------------------------------------
    // Add menu (`+` handle)
    // --------------------------------------------------------
    function openAddMenu(block, anchor) {
      closeAllMenus();
      const menu = renderPopup({
        title: '基本',
        search: true,
        footer: true,
        items: BLOCK_TYPES.map(t => ({
          key: t.key,
          label: t.label,
          desc: t.desc,
          hint: t.hint,
          icon: t.icon,
        })),
        onPick: (key) => {
          const newBlock = createBlock(key);
          block.after(newBlock);
          renumberLists();
          closeAllMenus();
          if (TEXT_TYPES.indexOf(key) !== -1) focusBlock(newBlock, 'start');
        },
      });
      addMenu = menu;
      positionMenuNear(menu.root, anchor, 'right');
      overlay.appendChild(menu.root);
      menu.focusSearch();
    }

    // --------------------------------------------------------
    // Actions menu (`⋮⋮` handle)
    // --------------------------------------------------------
    function openActionsMenu(block, anchor) {
      closeAllMenus();
      const menu = renderActionsMenu(block);
      actionsMenu = menu;
      positionMenuNear(menu.root, anchor, 'right');
      overlay.appendChild(menu.root);
    }

    // Turn-into menu opened from the bubble-menu [T] button
    function openTurnIntoMenu(block, anchor) {
      closeAllMenus();
      const menu = renderPopup({
        title: '基本',
        search: true,
        footer: true,
        items: TURN_INTO_TYPES.map(k => {
          const t = TYPE_MAP[k];
          return { key: t.key, label: t.label, desc: t.desc, hint: t.hint, icon: t.icon };
        }),
        onPick: (key) => {
          convertBlockType(block, key);
          closeAllMenus();
        },
      });
      actionsMenu = menu;
      positionMenuNear(menu.root, anchor, 'below');
      overlay.appendChild(menu.root);
      menu.focusSearch();
    }

    // Remove a block and move focus to a nearby block (or create a fresh paragraph).
    function deleteBlock(block) {
      const next = block.nextElementSibling;
      const prev = block.previousElementSibling;
      block.remove();
      renumberLists();
      const target = next && next.classList.contains('n-block') ? next
                   : prev && prev.classList.contains('n-block') ? prev : null;
      if (target) focusBlock(target, 'end');
      else ensureAtLeastOneBlock();
    }

    function renderActionsMenu(block) {
      const root = el('div', { class: 'n-popup n-popup--actions' });

      // Section: block ops
      const opsSection = el('div', { class: 'n-popup__section' });
      opsSection.appendChild(actionItem('削除', svgIcon('trash'), () => {
        deleteBlock(block);
        closeAllMenus();
      }));
      opsSection.appendChild(actionItem('複製', svgIcon('copy'), () => {
        const c = contentEl(block);
        const opts = {};
        if (c) opts.html = c.innerHTML;
        if (block.dataset.type === 'image') {
          const img = block.querySelector('.n-block__image');
          if (img) opts.src = img.src;
        }
        const dupe = createBlock(block.dataset.type, opts);
        block.after(dupe);
        renumberLists();
        closeAllMenus();
      }));
      root.appendChild(opsSection);

      // Section: turn into
      const turnHead = el('div', { class: 'n-popup__section-head' }, '種類を変更');
      root.appendChild(turnHead);
      const turnSection = el('div', { class: 'n-popup__section' });
      TURN_INTO_TYPES.forEach(key => {
        const t = TYPE_MAP[key];
        const active = block.dataset.type === key;
        const item = actionItem(t.label, t.icon, () => {
          convertBlockType(block, key);
          closeAllMenus();
        });
        if (active) item.classList.add('is-active');
        turnSection.appendChild(item);
      });
      root.appendChild(turnSection);

      return { root };
    }

    function actionItem(label, iconHTML, onClick) {
      return el('button', {
        class: 'n-popup__item',
        type: 'button',
        onclick: onClick,
      },
        el('span', { class: 'n-popup__item-icon', html: iconHTML }),
        el('span', { class: 'n-popup__item-label' }, label)
      );
    }

    // --------------------------------------------------------
    // Shared popup (add menu)
    // --------------------------------------------------------
    function renderPopup({ title, items, onPick, search, footer }) {
      const root = el('div', { class: 'n-popup' });

      let searchInput = null;
      if (search) {
        searchInput = el('input', {
          class: 'n-popup__search',
          type: 'text',
          placeholder: '入力して絞り込み...',
        });
        root.appendChild(searchInput);
      }

      if (title) {
        root.appendChild(el('div', { class: 'n-popup__section-head' }, title));
      }

      const list = el('div', { class: 'n-popup__section' });
      root.appendChild(list);

      let activeIdx = 0;
      let filtered = items.slice();

      function render() {
        list.innerHTML = '';
        filtered.forEach((it, i) => {
          const item = el('button', {
            class: 'n-popup__item n-popup__item--rich' + (i === activeIdx ? ' is-active' : ''),
            type: 'button',
            // Update keyboard-active index on hover without re-rendering the list
            // (re-rendering mid-hover churns the DOM and breaks clicks on items).
            onmouseenter: () => { activeIdx = i; updateActive(); },
            onmousedown: (e) => { e.preventDefault(); },  // don't blur menu/steal focus
            onclick: (e) => { e.stopPropagation(); onPick(it.key); },
          },
            el('span', { class: 'n-popup__item-icon', html: it.icon }),
            el('span', { class: 'n-popup__item-main' },
              el('span', { class: 'n-popup__item-label' }, it.label),
              it.desc ? el('span', { class: 'n-popup__item-desc' }, it.desc) : null
            ),
            it.hint ? el('span', { class: 'n-popup__item-hint' }, it.hint) : null
          );
          list.appendChild(item);
        });
        if (filtered.length === 0) {
          list.appendChild(el('div', { class: 'n-popup__empty' }, '該当なし'));
        }
      }

      function updateActive() {
        Array.from(list.children).forEach((c, j) => {
          if (c.classList && c.classList.contains('n-popup__item')) {
            c.classList.toggle('is-active', j === activeIdx);
          }
        });
      }

      function filter(query) {
        const q = query.trim().toLowerCase();
        filtered = items.filter(it =>
          it.label.toLowerCase().includes(q) || (it.desc || '').toLowerCase().includes(q)
        );
        activeIdx = 0;
        render();
      }

      function move(dir) {
        if (filtered.length === 0) return;
        activeIdx = (activeIdx + dir + filtered.length) % filtered.length;
        render();
        const active = list.children[activeIdx];
        if (active && active.scrollIntoView) active.scrollIntoView({ block: 'nearest' });
      }

      function commit() {
        if (filtered[activeIdx]) onPick(filtered[activeIdx].key);
      }

      if (searchInput) {
        searchInput.addEventListener('input', (e) => filter(e.target.value));
        searchInput.addEventListener('keydown', (e) => {
          if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
          else if (e.key === 'Enter') { e.preventDefault(); commit(); }
          else if (e.key === 'Escape') { e.preventDefault(); closeAllMenus(); }
        });
      }

      if (footer) {
        root.appendChild(el('div', { class: 'n-popup__footer' },
          el('span', { class: 'n-popup__footer-label' }, 'メニューを閉じる'),
          el('kbd', { class: 'n-popup__footer-kbd' }, 'esc')
        ));
      }

      render();

      return {
        root, filter, move, commit,
        focusSearch() { if (searchInput) searchInput.focus(); },
      };
    }

    // --------------------------------------------------------
    // Slash menu (typed `/` inside a block)
    // --------------------------------------------------------
    function openSlashMenu(block) {
      closeAllMenus();
      const menu = renderPopup({
        title: '基本',
        footer: true,
        items: BLOCK_TYPES.map(t => ({
          key: t.key, label: t.label, desc: t.desc, hint: t.hint, icon: t.icon,
        })),
        onPick: (key) => {
          const c = contentEl(block);
          if (c) c.textContent = '';
          convertBlockType(block, key);
          closeSlashMenu();
        },
      });
      slashMenu = Object.assign(menu, { block });
      positionMenuAtCaret(menu.root);
      overlay.appendChild(menu.root);
    }

    function closeSlashMenu() {
      if (slashMenu) {
        slashMenu.root.remove();
        slashMenu = null;
      }
    }

    // --------------------------------------------------------
    // Bubble menu (text selection)
    // --------------------------------------------------------
    function buildBubbleMenu() {
      const root = el('div', { class: 'n-bubble', hidden: 'hidden' });

      // [T] (種類を変更) — opens block picker
      // mousedown: preventDefault to keep text selection alive
      // click:     stopPropagation so the doc-level "click outside menu" handler
      //            doesn't immediately close the menu we're about to open
      const turnBtn = el('button', {
        class: 'n-bubble__btn n-bubble__btn--turn',
        type: 'button',
        title: '種類を変更',
        onmousedown: (e) => { e.preventDefault(); },
        onclick: (e) => {
          e.preventDefault();
          e.stopPropagation();
          const sel = window.getSelection();
          if (!sel.rangeCount) return;
          const r = sel.getRangeAt(0);
          const anchorNode = r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentElement;
          const host = anchorNode && anchorNode.closest('.n-block');
          if (!host) return;
          openTurnIntoMenu(host, turnBtn);
        },
      },
        el('span', { class: 'n-bubble__btn-text' }, 'T'),
        el('span', { class: 'n-bubble__btn-caret', html: svgIcon('chevron') })
      );
      root.appendChild(turnBtn);
      root.appendChild(el('div', { class: 'n-bubble__sep' }));

      // Text-styled inline format buttons
      const textButtons = [
        { key: 'bold',       text: 'B', title: '太字',       cmd: 'bold',         cls: 'n-bubble__btn--bold' },
        { key: 'italic',     text: 'I', title: '斜体',       cmd: 'italic',       cls: 'n-bubble__btn--italic' },
        { key: 'underline',  text: 'U', title: '下線',       cmd: 'underline',    cls: 'n-bubble__btn--underline' },
        { key: 'strike',     text: 'S', title: '取り消し線', cmd: 'strikeThrough', cls: 'n-bubble__btn--strike' },
      ];
      textButtons.forEach(a => {
        const btn = el('button', {
          class: 'n-bubble__btn ' + a.cls,
          type: 'button',
          title: a.title,
          onmousedown: (e) => { e.preventDefault(); runBubbleCmd(a.cmd); },
        }, el('span', { class: 'n-bubble__btn-text' }, a.text));
        btn.dataset.cmd = a.key;
        root.appendChild(btn);
      });

      root.appendChild(el('div', { class: 'n-bubble__sep' }));

      // Icon buttons: link, inline code
      const iconButtons = [
        { key: 'link', icon: svgIcon('link'),       title: 'リンク',             cmd: 'link' },
        { key: 'code', icon: svgIcon('inlineCode'), title: 'インラインコード',   cmd: 'inline-code' },
      ];
      iconButtons.forEach(a => {
        const btn = el('button', {
          class: 'n-bubble__btn',
          type: 'button',
          title: a.title,
          html: a.icon,
          onmousedown: (e) => { e.preventDefault(); runBubbleCmd(a.cmd); },
        });
        btn.dataset.cmd = a.key;
        root.appendChild(btn);
      });

      return root;
    }

    function runBubbleCmd(cmd) {
      if (cmd === 'inline-code') {
        wrapSelection('code');
        return;
      }
      if (cmd === 'link') {
        const url = window.prompt('URL');
        if (url) document.execCommand('createLink', false, url);
        return;
      }
      document.execCommand(cmd, false);
    }

    function wrapSelection(tag) {
      const sel = window.getSelection();
      if (!sel.rangeCount) return;
      const r = sel.getRangeAt(0);
      if (r.collapsed) return;
      const node = document.createElement(tag);
      try {
        node.appendChild(r.extractContents());
        r.insertNode(node);
        // Restore selection to cover the node
        sel.removeAllRanges();
        const after = document.createRange();
        after.selectNode(node);
        sel.addRange(after);
      } catch (_) { /* nested invalid ranges — ignore */ }
    }

    function updateBubble() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || !sel.rangeCount) {
        if (bubbleMenu) bubbleMenu.hidden = true;
        return;
      }
      const r = sel.getRangeAt(0);
      // Only show inside our editor text content
      const inEditor = root.contains(r.startContainer) && root.contains(r.endContainer);
      if (!inEditor) { if (bubbleMenu) bubbleMenu.hidden = true; return; }

      const host = (r.startContainer.nodeType === 1 ? r.startContainer : r.startContainer.parentElement).closest('.n-block__content');
      if (!host) { if (bubbleMenu) bubbleMenu.hidden = true; return; }

      if (!bubbleMenu) {
        bubbleMenu = buildBubbleMenu();
        overlay.appendChild(bubbleMenu);
      }
      bubbleMenu.hidden = false;

      const rect = r.getBoundingClientRect();
      const mRect = bubbleMenu.getBoundingClientRect();
      const top = window.scrollY + rect.top - mRect.height - 10;
      const left = window.scrollX + rect.left + rect.width / 2 - mRect.width / 2;
      bubbleMenu.style.top = Math.max(window.scrollY + 8, top) + 'px';
      bubbleMenu.style.left = Math.max(8, left) + 'px';
    }

    // --------------------------------------------------------
    // Drag & drop reordering (simple)
    // --------------------------------------------------------
    function startDrag(block, e) {
      if (e.button !== 0) return;
      const rect = block.getBoundingClientRect();
      const offsetY = e.clientY - rect.top;
      let moved = false;

      dragState = { block, offsetY };

      const ghost = block.cloneNode(true);
      ghost.classList.add('n-block--ghost');
      ghost.style.width = rect.width + 'px';
      ghost.style.position = 'fixed';
      ghost.style.pointerEvents = 'none';
      ghost.style.opacity = '0.85';
      ghost.style.zIndex = '9999';
      ghost.style.left = rect.left + 'px';
      ghost.style.top = rect.top + 'px';

      const indicator = el('div', { class: 'n-drop-indicator' });

      function onMove(ev) {
        if (!moved) {
          const dx = ev.clientX - e.clientX;
          const dy = ev.clientY - e.clientY;
          if (Math.hypot(dx, dy) < 4) return;
          moved = true;
          document.body.appendChild(ghost);
          root.appendChild(indicator);
          block.classList.add('n-block--dragging');
        }
        ghost.style.top = (ev.clientY - offsetY) + 'px';

        // Find target block
        const target = findDropTarget(ev.clientY, block);
        if (target) {
          const targetRect = target.block.getBoundingClientRect();
          indicator.style.display = 'block';
          indicator.style.top = (target.where === 'before' ? targetRect.top : targetRect.bottom) + window.scrollY + 'px';
          indicator.style.left = (targetRect.left + window.scrollX) + 'px';
          indicator.style.width = targetRect.width + 'px';
        } else {
          indicator.style.display = 'none';
        }
      }

      function onUp(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        if (!moved) { dragState = null; return; }
        ghost.remove();
        indicator.remove();
        block.classList.remove('n-block--dragging');
        const target = findDropTarget(ev.clientY, block);
        if (target) {
          if (target.where === 'before') target.block.before(block);
          else target.block.after(block);
          renumberLists();
        }
        dragState = null;
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    }

    function findDropTarget(y, self) {
      const blocks = Array.from(root.querySelectorAll('.n-block'));
      for (const b of blocks) {
        if (b === self) continue;
        const rect = b.getBoundingClientRect();
        if (y < rect.top + rect.height / 2) {
          return { block: b, where: 'before' };
        }
      }
      const last = blocks[blocks.length - 1];
      if (last && last !== self) return { block: last, where: 'after' };
      return null;
    }

    // --------------------------------------------------------
    // Menu positioning
    // --------------------------------------------------------
    function positionMenuNear(menuEl, anchor, side) {
      menuEl.style.visibility = 'hidden';
      menuEl.style.position = 'absolute';
      document.body.appendChild(menuEl);
      const aRect = anchor.getBoundingClientRect();
      const mRect = menuEl.getBoundingClientRect();

      let left, top;
      if (side === 'below') {
        left = aRect.left;
        top = aRect.bottom + 6;
      } else if (side === 'right') {
        left = aRect.right + 6;
        top = aRect.top;
      } else {
        left = aRect.left - mRect.width - 6;
        top = aRect.top;
      }

      // Flip horizontally if overflowing
      if (left + mRect.width > window.innerWidth - 8) {
        left = (side === 'below')
          ? Math.max(8, window.innerWidth - mRect.width - 8)
          : aRect.left - mRect.width - 6;
      }
      if (left < 8) left = 8;

      // Flip vertically if overflowing
      if (top + mRect.height > window.innerHeight - 8) {
        if (side === 'below') {
          top = Math.max(8, aRect.top - mRect.height - 6);
        } else {
          top = Math.max(8, window.innerHeight - mRect.height - 8);
        }
      }

      menuEl.style.left = (left + window.scrollX) + 'px';
      menuEl.style.top = (top + window.scrollY) + 'px';
      menuEl.style.visibility = 'visible';
    }

    function positionMenuAtCaret(menuEl) {
      const sel = window.getSelection();
      menuEl.style.position = 'absolute';
      menuEl.style.visibility = 'hidden';
      document.body.appendChild(menuEl);

      let x = window.innerWidth / 2, y = window.innerHeight / 2;
      if (sel && sel.rangeCount) {
        const r = sel.getRangeAt(0).cloneRange();
        const rect = r.getBoundingClientRect();
        if (rect.width || rect.height) {
          x = rect.left;
          y = rect.bottom + 6;
        }
      }

      const mRect = menuEl.getBoundingClientRect();
      if (x + mRect.width > window.innerWidth - 8) x = window.innerWidth - mRect.width - 8;
      if (y + mRect.height > window.innerHeight - 8) y = y - mRect.height - 24;

      menuEl.style.left = (x + window.scrollX) + 'px';
      menuEl.style.top = (y + window.scrollY) + 'px';
      menuEl.style.visibility = 'visible';
    }

    function closeAllMenus() {
      if (addMenu) { addMenu.root.remove(); addMenu = null; }
      if (actionsMenu) { actionsMenu.root.remove(); actionsMenu = null; }
      closeSlashMenu();
    }

    // --------------------------------------------------------
    // Global listeners
    // --------------------------------------------------------
    document.addEventListener('click', (e) => {
      if (addMenu && !addMenu.root.contains(e.target)) closeAllMenus();
      if (actionsMenu && !actionsMenu.root.contains(e.target)) closeAllMenus();
      if (slashMenu && !slashMenu.root.contains(e.target)) closeSlashMenu();
    });

    document.addEventListener('selectionchange', updateBubble);
    window.addEventListener('scroll', updateBubble, true);
    window.addEventListener('resize', updateBubble);

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeAllMenus();
    });

    // --------------------------------------------------------
    // Click on empty editor area → add a paragraph at end & focus
    // --------------------------------------------------------
    root.addEventListener('click', (e) => {
      if (e.target !== root) return;
      const last = root.lastElementChild;
      if (last && last.classList.contains('n-block')) {
        const type = last.dataset.type;
        if (TEXT_TYPES.indexOf(type) !== -1 && !contentText(last)) {
          focusBlock(last, 'end');
          return;
        }
      }
      const p = createBlock('paragraph');
      root.appendChild(p);
      focusBlock(p, 'start');
    });

    // --------------------------------------------------------
    // Content API
    // --------------------------------------------------------
    function ensureAtLeastOneBlock() {
      if (!root.querySelector('.n-block')) {
        root.appendChild(createBlock('paragraph'));
      }
    }

    function clear() {
      root.innerHTML = '';
      root.appendChild(createBlock('paragraph'));
    }

    function setContentFromText(text) {
      root.innerHTML = '';
      const paragraphs = String(text).split(/\n{2,}|\r\n{2,}/);
      paragraphs.forEach(p => {
        const chunk = p.trim();
        if (!chunk) return;

        // Split each paragraph on single newlines into separate blocks too
        // (easier to read; matches how Notion treats pasted text).
        chunk.split(/\n/).forEach(line => {
          const trimmed = line.trim();
          if (!trimmed) return;
          root.appendChild(createBlock('paragraph', { text: trimmed }));
        });
      });
      ensureAtLeastOneBlock();
      renumberLists();
    }

    function getHTML() {
      // Produce a clean serialization without gutters/handles.
      const out = [];
      root.querySelectorAll('.n-block').forEach(b => {
        const t = b.dataset.type;
        const c = contentEl(b);
        const inner = c ? c.innerHTML.trim() : '';
        switch (t) {
          case 'heading-1': out.push('<h1>' + inner + '</h1>'); break;
          case 'heading-2': out.push('<h2>' + inner + '</h2>'); break;
          case 'heading-3': out.push('<h3>' + inner + '</h3>'); break;
          case 'bulleted-list': out.push('<ul><li>' + inner + '</li></ul>'); break;
          case 'numbered-list': out.push('<ol><li>' + inner + '</li></ol>'); break;
          case 'quote': out.push('<blockquote>' + inner + '</blockquote>'); break;
          case 'code': out.push('<pre><code>' + inner + '</code></pre>'); break;
          case 'divider': out.push('<hr>'); break;
          case 'image': {
            const img = b.querySelector('.n-block__image');
            if (img) out.push('<img src="' + img.src + '" alt="">');
            break;
          }
          default: out.push('<p>' + inner + '</p>');
        }
      });
      return out.join('\n');
    }

    // --------------------------------------------------------
    // Initial state
    // --------------------------------------------------------
    clear();

    return {
      root,
      setContentFromText,
      clear,
      getHTML,
    };
  }

  // ------------------------------------------------------------
  // Auto-init
  // ------------------------------------------------------------
  function init() {
    const target = document.getElementById('contentEditor');
    if (!target) return;
    const editor = createEditor(target);
    window.NotionEditor = editor;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
