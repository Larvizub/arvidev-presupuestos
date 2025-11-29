import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import { FaHome, FaUserFriends, FaCog, FaSignOutAlt, FaUsers, FaUserShield } from 'react-icons/fa';

const NavContainer = styled.nav`
  background-color: #2c3e50;
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    padding: 0 10px;
  }
`;

const Logo = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  
  a {
    color: white;
    text-decoration: none;
  }
`;

const NavLinks = styled.div`
  display: flex;
  gap: 20px;
  
  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const NavLink = styled(Link)`
  color: ${props => props.active ? '#3498db' : 'white'};
  text-decoration: none;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 5px;
  transition: all 0.3s;
  
  &:hover {
    background-color: #34495e;
  }
  
  svg {
    margin-right: 5px;
  }
  
  @media (max-width: 768px) {
    padding: 5px;
    
    span {
      display: none;
    }
    
    svg {
      margin-right: 0;
      font-size: 1.2rem;
    }
  }
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: white;
  display: flex;
  align-items: center;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: #e74c3c;
  }
  
  svg {
    margin-right: 5px;
  }
  
  @media (max-width: 768px) {
    padding: 5px;
    
    span {
      display: none;
    }
    
    svg {
      margin-right: 0;
      font-size: 1.2rem;
    }
  }
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
        <Link to="/dashboard">PresupuestoApp</Link>
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
        <LogoutButton onClick={handleLogout}>
          <FaSignOutAlt />
          <span>Cerrar Sesión</span>
        </LogoutButton>
      </NavLinks>
    </NavContainer>
  );
}
