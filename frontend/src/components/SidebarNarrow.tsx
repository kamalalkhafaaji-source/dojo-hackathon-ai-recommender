import React from 'react';

/**
 * Icons for the narrow sidebar.
 * Usually these would be in a separate SVG icon library or assets folder.
 */
const Icons = {
  Logo: () => <svg viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>,
  Home: () => <svg viewBox="0 0 24 24"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>,
  Cards: () => <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/></svg>,
  Funding: () => <svg viewBox="0 0 24 24"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>,
  Calendar: () => <svg viewBox="0 0 24 24"><path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11z"/></svg>,
  Tools: () => <svg viewBox="0 0 24 24"><path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"/></svg>,
  Location: () => <svg viewBox="0 0 24 24"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>,
  Profile: () => <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>,
};

/**
 * SidebarNarrow component provides the leftmost iconic navigation bar.
 */
const SidebarNarrow: React.FC = () => {
  return (
    <aside className="sidebar-narrow">
      <div className="nav-icon active-logo" style={{ color: 'var(--accent-color)', marginBottom: '24px' }}>
        <Icons.Logo />
      </div>
      <div className="nav-icon"><Icons.Home /></div>
      <div className="nav-icon"><Icons.Cards /></div>
      <div className="nav-icon active"><Icons.Funding /></div>
      <div className="nav-icon"><Icons.Calendar /></div>
      <div className="nav-icon"><Icons.Tools /></div>
      <div className="nav-icon"><Icons.Location /></div>
      
      <div className="nav-bottom">
        <div className="nav-icon"><Icons.Profile /></div>
      </div>

      <style>{`
        .sidebar-narrow {
          width: 60px;
          background-color: var(--narrow-sidebar-bg);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 20px;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .sidebar-narrow {
            display: none;
          }
        }

        .nav-icon {
          width: 36px;
          height: 36px;
          display: flex;
          justify-content: center;
          align-items: center;
          border-radius: 12px;
          margin-bottom: 12px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }

        .nav-icon:hover {
          background-color: var(--narrow-sidebar-bg);
          filter: brightness(0.9);
        }

        .nav-icon.active {
          background-color: var(--accent-color);
          color: white;
        }

        .nav-icon svg {
          width: 20px;
          height: 20px;
          fill: currentColor;
        }

        .nav-bottom {
          margin-top: auto;
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </aside>
  );
};

export default SidebarNarrow;
