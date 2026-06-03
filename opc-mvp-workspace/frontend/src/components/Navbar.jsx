import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={styles.logo}>🤝 OPC协作网络</Link>
      </div>
      <div style={styles.right}>
        <Link to="/my-applications" style={styles.link}>我的申请</Link>
        <Link to="/publish" style={styles.btnGreen}>New OPC</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#24292f',
    padding: '0 24px',
    height: '56px',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  left: {
    display: 'flex',
    alignItems: 'center',
  },
  logo: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: '600',
    textDecoration: 'none',
    letterSpacing: '-0.5px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  link: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    textDecoration: 'none',
    padding: '5px 12px',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  btnGreen: {
    backgroundColor: '#2ea44f',
    color: '#ffffff',
    padding: '5px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    textDecoration: 'none',
    border: '1px solid rgba(27,31,36,0.15)',
    boxShadow: '0 1px 0 rgba(27,31,36,0.1)',
    transition: 'background-color 0.2s',
  },
};