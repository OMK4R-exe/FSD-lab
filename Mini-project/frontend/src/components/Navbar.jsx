import { useAuth } from '../context/AuthContext';
import { HiOutlineUser } from 'react-icons/hi';
import './Navbar.css';

function Navbar() {
  const { user } = useAuth();

  return (
    <header className="navbar">
      <div className="navbar-spacer"></div>
      <div className="navbar-user">
        <HiOutlineUser size={18} />
        <span>{user?.name || 'User'}</span>
      </div>
    </header>
  );
}

export default Navbar;
