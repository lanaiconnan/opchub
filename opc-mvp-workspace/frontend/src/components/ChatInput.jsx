import { useState, useRef } from 'react';
import { useColors } from '../styles/tokens';

export default function ChatInput({ onSend, disabled }) {
  const [input, setInput] = useState('');
  const textareaRef = useRef(null);
  const color = useColors();

  const handleSubmit = () => {
    if (!input.trim() || disabled) return;
    onSend(input.trim());
    setInput('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleChange = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  };

  const styles = {
    container: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: '8px',
      maxWidth: '700px',
      margin: '0 auto',
      padding: '12px 16px',
      backgroundColor: color.surface,
      borderRadius: '12px',
      boxShadow: `0 2px 12px ${color.gray6}10`,
      border: `1px solid ${color.border}`,
    },
    textarea: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontSize: '14px',
      lineHeight: '1.5',
      color: color.textPrimary,
      backgroundColor: 'transparent',
      resize: 'none',
      overflowY: 'auto',
      maxHeight: '120px',
      fontFamily: 'inherit',
    },
    btn: {
      backgroundColor: color.primary,
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 20px',
      fontSize: '14px',
      fontWeight: '600',
      whiteSpace: 'nowrap',
      flexShrink: 0,
    },
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
        style={styles.textarea}
      />
      <button
        onClick={handleSubmit}
        disabled={disabled || !input.trim()}
        style={styles.btn}
      >
        {disabled ? '...' : '发送'}
      </button>
    </div>
  );
}
