/**
 * 轻量级 Markdown 渲染器（无外部依赖）
 * 支持：标题、列表、代码块、内联代码、粗体、斜体、引用、换行
 * variant: 'light' | 'dark'  — dark 用于用户绿色气泡内的代码块
 */
function MarkdownRenderer({ content, variant = 'light' }) {
  if (!content) return null;

  const isDark = variant === 'dark';

  // 深色/浅色样式
  const colors = {
    text: isDark ? '#fff' : '#1F2328',
    inlineCodeBg: isDark ? 'rgba(255,255,255,0.12)' : '#f6f8fa',
    inlineCodeBorder: isDark ? 'rgba(255,255,255,0.2)' : '#d0d7de',
    inlineCodeColor: isDark ? '#f0883e' : '#cf222e',
    codeBlockBg: isDark ? '#1c2128' : '#161b22',
    codeBlockBorder: isDark ? '#30363d' : '#30363d',
    blockquoteBorder: isDark ? 'rgba(255,255,255,0.3)' : '#d0d7de',
    blockquoteColor: isDark ? 'rgba(255,255,255,0.65)' : '#656d76',
    listMarker: isDark ? 'rgba(255,255,255,0.5)' : '#656d76',
  };

  const inlineStyles = {
    container: {
      fontSize: '14px',
      lineHeight: '1.7',
      color: colors.text,
      wordBreak: 'break-word',
      overflowWrap: 'break-word',
    },
    paragraph: { margin: '0 0 8px 0' },
    h1: { fontSize: '20px', fontWeight: '700', margin: '16px 0 8px 0', color: colors.text },
    h2: { fontSize: '17px', fontWeight: '600', margin: '14px 0 6px 0', color: colors.text },
    h3: { fontSize: '15px', fontWeight: '600', margin: '12px 0 4px 0', color: colors.text },
    inlineCode: {
      backgroundColor: colors.inlineCodeBg,
      border: `1px solid ${colors.inlineCodeBorder}`,
      borderRadius: '4px',
      padding: '1px 5px',
      fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
      fontSize: '13px',
      color: colors.inlineCodeColor,
    },
    codeBlock: {
      backgroundColor: colors.codeBlockBg,
      borderRadius: '8px',
      padding: '12px 16px',
      margin: '8px 0',
      overflowX: 'auto',
      border: `1px solid ${colors.codeBlockBorder}`,
    },
    codeBlockText: {
      color: '#e6edf3',
      fontFamily: 'ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, monospace',
      fontSize: '13px',
      lineHeight: '1.5',
      whiteSpace: 'pre',
    },
    blockquote: {
      borderLeft: `3px solid ${colors.blockquoteBorder}`,
      margin: '8px 0',
      paddingLeft: '12px',
      color: colors.blockquoteColor,
      fontStyle: 'italic',
    },
    list: { margin: '4px 0', paddingLeft: '20px' },
    listItem: { marginBottom: '4px' },
  };

  // HTML 转义
  const escapeHtml = (str) =>
    str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

  // 基础语法高亮（关键字、字符串、注释）
  const highlightCode = (code) => {
    const keywords = ['const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'class', 'import', 'export', 'from', 'default', 'async', 'await', 'try', 'catch', 'new', 'this', 'true', 'false', 'null', 'undefined', 'typeof', 'instanceof'];
    const keywordColor = '#ff7b72';
    const stringColor = '#a5d6ff';
    const commentColor = '#8b949e';
    const numberColor = '#79c0ff';
    const funcColor = '#d2a8ff';

    const lines = code.split('\n');
    return lines.map((line, li) => {
      let result = '';
      let i = 0;

      const consume = (len) => { result += line.slice(i, i + len); i += len; };

      while (i < line.length) {
        // 注释 //...
        if (line.slice(i, i + 2) === '//') {
          result += `<span style="color:${commentColor}">${escapeHtml(line.slice(i))}</span>`;
          break;
        }
        // 字符串 "..." 或 '...'
        const strMatch = line.slice(i).match(/^(["'`])(.*?)\1/);
        if (strMatch) {
          result += `<span style="color:${stringColor}">${escapeHtml(strMatch[0])}</span>`;
          i += strMatch[0].length;
          continue;
        }
        // 数字
        const numMatch = line.slice(i).match(/^\b(\d+\.?\d*)\b/);
        if (numMatch) {
          result += `<span style="color:${numberColor}">${escapeHtml(numMatch[0])}</span>`;
          i += numMatch[0].length;
          continue;
        }
        // 关键字
        let matched = false;
        for (const kw of keywords) {
          if (line.slice(i, i + kw.length) === kw && !/[a-zA-Z0-9_]/.test(line[i + kw.length] || '')) {
            result += `<span style="color:${keywordColor}">${kw}</span>`;
            i += kw.length;
            matched = true;
            break;
          }
        }
        if (matched) continue;
        // 普通字符
        const nextSpecial = [line.indexOf('//', i), line.indexOf('"', i), line.indexOf("'", i), line.indexOf('`', i)].filter(x => x !== -1);
        const next = nextSpecial.length > 0 ? Math.min(...nextSpecial) : -1;
        if (next === -1 || next === i) {
          result += escapeHtml(line[i]);
          i++;
        } else {
          result += escapeHtml(line.slice(i, next));
          i = next;
        }
      }

      return result;
    });
  };

  const renderCodeLine = (line) => {
    const highlighted = highlightCode(line);
    return highlighted;
  };

  // 处理内联格式：`**bold**`, `*italic*`, `__bold__`, `_italic_`, `code`
  const renderInline = (text) => {
    const parts = [];
    let remaining = text;
    let key = 0;

    while (remaining.length > 0) {
      // 匹配内联代码 `code`
      let m = remaining.match(/^`([^`]+)`/);
      if (m) {
        parts.push(
          <code key={key++} style={inlineStyles.inlineCode}>
            {m[1]}
          </code>
        );
        remaining = remaining.slice(m[0].length);
        continue;
      }
      // 匹配 **bold** 或 __bold__
      m = remaining.match(/^\*\*(.+?)\*\*/);
      if (!m) m = remaining.match(/^__(.+?)__/);
      if (m) {
        parts.push(
          <strong key={key++} style={{ fontWeight: '700' }}>
            {m[1]}
          </strong>
        );
        remaining = remaining.slice(m[0].length);
        continue;
      }
      // 匹配 *italic* 或 _italic_
      m = remaining.match(/^\*(.+?)\*/);
      if (!m) m = remaining.match(/^_(.+?)_/);
      if (m) {
        parts.push(
          <em key={key++} style={{ fontStyle: 'italic' }}>
            {m[1]}
          </em>
        );
        remaining = remaining.slice(m[0].length);
        continue;
      }
      // 普通字符，找下一个特殊字符之前
      const nextSpecial = remaining.search(/[`*_]/);
      if (nextSpecial === -1) {
        parts.push(remaining);
        break;
      }
      if (nextSpecial === 0) {
        parts.push(remaining[0]);
        remaining = remaining.slice(1);
      } else {
        parts.push(remaining.slice(0, nextSpecial));
        remaining = remaining.slice(nextSpecial);
      }
    }

    return parts.length > 0 ? parts : text;
  };

  // 处理标题
  const renderHeading = (text) => {
    const m = text.match(/^(#{1,3})\s+(.+)/);
    if (!m) return null;
    const level = m[1].length;
    const Tag = `h${level}`;
    return <Tag key={text} style={inlineStyles[`h${level}`]}>{renderInline(m[2])}</Tag>;
  };

  // 处理引用
  const renderBlockquote = (text) => {
    if (!text.startsWith('> ')) return null;
    return (
      <blockquote key={text} style={inlineStyles.blockquote}>
        {renderInline(text.slice(2))}
      </blockquote>
    );
  };

  // 处理列表项
  const renderListItem = (text) => {
    const m = text.match(/^([-*])\s+(.+)/);
    if (!m) return null;
    return (
      <li key={text} style={inlineStyles.listItem}>
        {renderInline(m[2])}
      </li>
    );
  };

  const renderParagraph = (text) => {
    const t = text.trim();
    if (!t) return null;
    const h = renderHeading(t);
    if (h) return h;
    const bq = renderBlockquote(t);
    if (bq) return bq;
    return <p key={t} style={inlineStyles.paragraph}>{renderInline(t)}</p>;
  };

  // 主处理流程：先拆分代码块，再处理普通行
  const lines = content.split('\n');
  const elements = [];
  let i = 0;
  let listBuffer = [];
  let inCodeBlock = false;
  let codeLines = [];
  let codeLang = '';
  let key = 0;

  const flushList = () => {
    if (listBuffer.length > 0) {
      elements.push(
        <ul key={key++} style={inlineStyles.list}>
          {listBuffer}
        </ul>
      );
      listBuffer = [];
    }
  };

  const isListItem = (line) => /^[-*]\s+/.test(line);

  while (i < lines.length) {
    const line = lines[i];

    // 代码块
    if (line.startsWith('```')) {
      flushList();
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeLang = line.slice(3).trim();
        codeLines = [];
      } else {
        inCodeBlock = false;
        elements.push(
          <pre key={key++} style={inlineStyles.codeBlock}>
            <code style={inlineStyles.codeBlockText}>
              {codeLines.map((l, idx) => (
                <span key={idx} dangerouslySetInnerHTML={{ __html: renderCodeLine(l) + (idx < codeLines.length - 1 ? '\n' : '') }} />
              ))}
            </code>
          </pre>
        );
      }
      i++;
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      i++;
      continue;
    }

    // 空行
    if (line.trim() === '') {
      flushList();
      i++;
      continue;
    }

    // 列表项
    if (isListItem(line)) {
      const li = renderListItem(line);
      if (li) listBuffer.push(li);
    } else {
      flushList();
      elements.push(renderParagraph(line));
    }
    i++;
  }

  flushList();
  return <div style={inlineStyles.container}>{elements}</div>;
}

export default MarkdownRenderer;
