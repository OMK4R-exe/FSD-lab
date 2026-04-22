import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HiOutlineViewGrid, HiOutlinePlusCircle, HiOutlineChartBar, HiOutlineLogout } from 'react-icons/hi';
import { TbChartLine } from 'react-icons/tb';
import './Sidebar.css';

function Sidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <TbChartLine size={22} />
        </div>
        <span className="sidebar-logo-text">Expense Tracker</span>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <HiOutlineViewGrid size={20} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/add-expense" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <HiOutlinePlusCircle size={20} />
          <span>Add Expense</span>
        </NavLink>
        <NavLink to="/reports" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
          <HiOutlineChartBar size={20} />
          <span>Reports</span>
        </NavLink>
      </nav>

      <div className="sidebar-bottom">
        <button className="sidebar-link logout-btn" onClick={handleLogout}>
          <HiOutlineLogout size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
