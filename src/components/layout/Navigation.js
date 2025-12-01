import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import { FaHome, FaUserFriends, FaCog, FaSignOutAlt, FaUsers, FaUserShield } from 'react-icons/fa';

const NavContainer = styled.nav`
  background: linear-gradient(90deg, #0f172a 0%, #1e3a8a 50%, #0f172a 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 28px;
  height: 72px;
  border-bottom: 1px solid rgba(255,255,255,0.04);
  box-shadow: 0 6px 18px rgba(2,6,23,0.25);
  backdrop-filter: blur(4px);
  position: relative;

  @media (max-width: 1024px) {
    padding: 0 20px;
    height: 64px;
  }

  @media (max-width: 768px) {
    position: fixed;
    bottom: 0;
    left: 0;
    width: 100%;
    z-index: 1000;
    padding: 0;
    justify-content: center;
    box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
    padding-bottom: env(safe-area-inset-bottom);
    background-color: #2c3e50; /* Ensure background is set for mobile */
    height: 60px;
  }
`;

const Logo = styled.div`
  font-size: 1.25rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;

  a {
    color: white;
    text-decoration: none;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .brand-accent {
    background: rgba(255,255,255,0.08);
    padding: 6px 10px;
    border-radius: 8px;
    font-weight: 800;
    color: #fff;
  }

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 18px;
  align-items: center;
  flex: 1;
  justify-content: center;

  @media (max-width: 768px) {
    width: 100%;
    justify-content: space-around;
    gap: 0;
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.active ? '#fff' : 'rgba(255,255,255,0.9)'};
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 8px 14px;
  border-radius: 10px;
  transition: all 0.18s ease;
  font-weight: 600;
  backdrop-filter: blur(2px);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 18px rgba(2,6,23,0.18);
    background: linear-gradient(90deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02));
  }

  svg {
    margin-right: 8px;
    font-size: 1.05rem;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 12px 0;
    font-size: 0.7rem;
    flex: 1;
    justify-content: center;

    span {
      display: none;
    }

    svg {
      margin-right: 0;
      font-size: 1.8rem;
      margin-bottom: 0;
    }
  }
`;

const LogoutButton = styled.button`
  background: rgba(255,255,255,0.05);
  border: 1px solid rgba(255,255,255,0.06);
  color: white;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.18s ease;
  font-weight: 600;

  &:hover {
    background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03));
    transform: translateY(-2px);
  }

  svg {
    margin-right: 4px;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    padding: 12px 0;
    font-size: 0.7rem;
    flex: 1;
    justify-content: center;

    span { display: none; }

    svg { margin-right: 0; font-size: 1.8rem; margin-bottom: 0; }
  }
`;

const UserArea = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-left: 16px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const Avatar = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #60a5fa, #1e40af);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  box-shadow: 0 4px 10px rgba(2,6,23,0.25);
`;

const UserName = styled.div`
  color: rgba(255,255,255,0.95);
  font-weight: 600;
  font-size: 0.95rem;
`;

export default function Navigation() {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };
  
  if (!currentUser) return null;
  
  return (
    <NavContainer>
      <Logo>
        <Link to="/dashboard"><div className="brand-accent">PresupuestoApp</div></Link>
      </Logo>

      <NavLinks>
        <NavLink to="/dashboard" active={location.pathname === '/dashboard' ? 1 : 0}>
          <FaHome />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/shared" active={location.pathname === '/shared' ? 1 : 0}>
          <FaUserFriends />
          <span>Compartidos</span>
        </NavLink>

        {currentUser.role === 'admin' && (
          <>
            <NavLink to="/users" active={location.pathname === '/users' ? 1 : 0}>
              <FaUsers />
              <span>Usuarios</span>
            </NavLink>
            <NavLink to="/roles" active={location.pathname === '/roles' ? 1 : 0}>
              <FaUserShield />
              <span>Roles</span>
            </NavLink>
          </>
        )}

        <NavLink to="/settings" active={location.pathname === '/settings' ? 1 : 0}>
          <FaCog />
          <span>Configuración</span>
        </NavLink>
      </NavLinks>

      <UserArea>
        <Avatar aria-hidden>
          {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : (currentUser.email ? currentUser.email.charAt(0).toUpperCase() : '?')}
        </Avatar>
        <UserName>{currentUser.displayName || currentUser.email}</UserName>
        <LogoutButton onClick={handleLogout} title="Cerrar sesión">
          <FaSignOutAlt />
          <span>Cerrar</span>
        </LogoutButton>
      </UserArea>
    </NavContainer>
  );
}
