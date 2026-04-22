import React from 'react';

/**
 * SidebarWide component provides textual navigation for the 'Capital' section.
 */
const SidebarWide: React.FC = () => {
  return (
    <nav className="sidebar-wide">
      <div className="sidebar-header">Capital</div>
      <ul className="sidebar-menu">
        <li><a className="menu-item">Overview</a></li>
        <li><a className="menu-item">Business Credit Card</a></li>
        <li><a className="menu-item active">Business Funding</a></li>
        <li><a className="menu-item">Business Funding (IVIF)</a></li>
      </ul>

      <style>{`
        .sidebar-wide {
          width: 240px;
          background-color: var(--sidebar-bg);
          border-right: 1px solid var(--border-color);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
        }

        @media (max-width: 768px) {
          .sidebar-wide {
            display: none;
          }
        }

        .sidebar-header {
          padding: 24px 24px 16px 24px;
          font-size: 15px;
          font-weight: 500;
          color: var(--text-primary);
        }

        .sidebar-menu {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .menu-item {
          padding: 10px 16px;
          margin: 0 12px;
          border-radius: 100px;
          color: var(--text-secondary);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          display: block;
          cursor: pointer;
          transition: all 0.2s;
        }

        .menu-item:hover {
          color: var(--text-primary);
        }

        .menu-item.active {
          background-color: var(--accent-color);
          color: white;
        }
      `}</style>
    </nav>
  );
};

export default SidebarWide;
