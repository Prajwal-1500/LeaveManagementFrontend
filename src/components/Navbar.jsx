import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'HRAdmin') return '/admin';
    if (user.role === 'Manager') return '/manager';
    return '/employee';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <Link className="navbar-brand fw-bold" to={getDashboardLink()}>
          Leave Management
        </Link>
        {user && (
          <div className="d-flex align-items-center gap-3">
            <span className="text-white">
              {user.firstName} &nbsp;
              <span className="badge bg-light text-primary">{user.role}</span>
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
