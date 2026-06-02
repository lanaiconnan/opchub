import { useState, useRef } from 'react';

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
    // 重置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 自动调整高度
  const handleChange = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  return (
    <div style={styles.container}>
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="描述你的技能或合作意向，Enter 发送，Shift+Enter 换行..."
        disabled={disabled}
        rows={1}
        style={{
          ...styles.textarea,
          opacity: disabled ? 0.6 : 1,
        }}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !input.trim()}
        style={{
          ...styles.btn,
          opacity: disabled || !input.trim() ? 0.5 : 1,
          cursor: disabled || !input.trim() ? 'not-allowed' : 'pointer',
        }}
      >
        {disabled ? '...' : '发送'}
      </button>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: '8px',
    maxWidth: '700px',
    margin: '0 auto',
    padding: '12px 16px',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    border: '1px solid #d0d7de',
  },
  textarea: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#1F2328',
    backgroundColor: 'transparent',
    resize: 'none',
    overflowY: 'auto',
    maxHeight: '120px',
    fontFamily: 'inherit',
  },
  btn: {
    backgroundColor: '#2ea44f',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};
