import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { database } from '../firebase/config';
import { ref, get, update } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertModal from '../components/common/AlertModal';
import { FaUsers, FaUserShield, FaUser } from 'react-icons/fa';

const DashboardContainer = styled.div`
  padding: 24px;
  max-width: 1280px;
  margin: 0 auto;
  background-color: #f8fafc;
  min-height: calc(100vh - 60px);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e2e8f0;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const Title = styled.h1`
  color: #1e293b;
  margin: 0;
  font-size: 2.2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #3498db;
  }
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const WelcomeMessage = styled.p`
  color: #64748b;
  font-size: 1.1rem;
  margin: 8px 0 24px;
`;

const TableContainer = styled.div`
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #f8fafc;
  color: #64748b;
  font-weight: 600;
  padding: 16px 24px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Td = styled.td`
  padding: 16px 24px;
  border-bottom: 1px solid #f1f5f9;
  color: #1e293b;
  font-size: 1rem;
  
  &:last-child {
    text-align: right;
  }
`;

const Tr = styled.tr`
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f8fafc;
  }
  
  &:last-child td {
    border-bottom: none;
  }
`;

const MobileUserList = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const UserCard = styled.div`
  background-color: white;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const UserCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 12px;
  margin-bottom: 4px;
`;

const UserCardName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #1e293b;
  font-weight: 600;
`;

const UserCardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.95rem;
`;

const Label = styled.span`
  color: #64748b;
  font-weight: 500;
`;

const Value = styled.span`
  color: #1e293b;
  font-weight: 500;
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  background-color: #f8fafc;
  cursor: pointer;
  font-size: 0.9rem;
  color: #1e293b;
  transition: all 0.2s;
  
  &:focus {
    border-color: #3498db;
    outline: none;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
  }
  
  &:disabled {
    background-color: #f1f5f9;
    color: #94a3b8;
    cursor: not-allowed;
  }
`;

const Badge = styled.span`
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${props => props.role === 'admin' ? '#fee2e2' : '#e0f2fe'};
  color: ${props => props.role === 'admin' ? '#ef4444' : '#0ea5e9'};
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

export default function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const [alert, setAlert] = useState({ show: false, title: '', message: '' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersRef = ref(database, 'users');
      const snapshot = await get(usersRef);
      
      if (snapshot.exists()) {
        const usersData = snapshot.val();
        const usersList = Object.keys(usersData).map(key => ({
          id: key,
          ...usersData[key]
        }));
        setUsers(usersList);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError('Error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await update(ref(database, `users/${userId}`), {
        role: newRole
      });
      
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      setAlert({
        show: true,
        title: 'Éxito',
        message: 'Rol actualizado correctamente'
      });
    } catch (err) {
      console.error("Error updating role:", err);
      setAlert({
        show: true,
        title: 'Error',
        message: 'No se pudo actualizar el rol'
      });
    }
  };

  const getDisplayName = (user) => {
    if (user.displayName) return user.displayName;
    if (user.id === currentUser.uid && currentUser.displayName) return currentUser.displayName;
    return 'Sin nombre';
  };

  if (loading) return <LoadingSpinner message="Cargando usuarios..." />;

  return (
    <DashboardContainer>
      <Header>
        <div>
          <Title><FaUsers /> Gestión de Usuarios</Title>
          <WelcomeMessage>
            Administra los usuarios registrados y sus permisos en la plataforma.
          </WelcomeMessage>
        </div>
      </Header>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee2e2', 
          color: '#ef4444', 
          padding: '16px', 
          borderRadius: '8px', 
          marginBottom: '24px',
          border: '1px solid #fecaca'
        }}>
          {error}
        </div>
      )}
      
      <TableContainer>
        <UserTable>
          <thead>
            <tr>
              <Th>Usuario</Th>
              <Th>Email</Th>
              <Th>Rol Actual</Th>
              <Th style={{ textAlign: 'right' }}>Acciones</Th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <Tr key={user.id}>
                <Td>
                  <div style={{ fontWeight: 500 }}>{getDisplayName(user)}</div>
                </Td>
                <Td>{user.email}</Td>
                <Td>
                  <Badge role={user.role || 'user'}>
                    {user.role === 'admin' ? <FaUserShield size={12} /> : <FaUser size={12} />}
                    {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                  </Badge>
                </Td>
                <Td>
                  <Select 
                    value={user.role || 'user'} 
                    onChange={(e) => handleRoleChange(user.id, e.target.value)}
                    disabled={user.id === currentUser.uid} // Prevent changing own role
                  >
                    <option value="user">Usuario</option>
                    <option value="admin">Administrador</option>
                  </Select>
                </Td>
              </Tr>
            ))}
          </tbody>
        </UserTable>
      </TableContainer>

      <MobileUserList>
        {users.map(user => (
          <UserCard key={user.id}>
            <UserCardHeader>
              <UserCardName>{getDisplayName(user)}</UserCardName>
              <Badge role={user.role || 'user'}>
                {user.role === 'admin' ? <FaUserShield size={12} /> : <FaUser size={12} />}
                {user.role === 'admin' ? 'Admin' : 'User'}
              </Badge>
            </UserCardHeader>
            
            <UserCardRow>
              <Label>Email:</Label>
              <Value>{user.email}</Value>
            </UserCardRow>
            
            <UserCardRow>
              <Label>Rol:</Label>
              <Select 
                value={user.role || 'user'} 
                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                disabled={user.id === currentUser.uid}
                style={{ padding: '6px', fontSize: '0.9rem' }}
              >
                <option value="user">Usuario</option>
                <option value="admin">Administrador</option>
              </Select>
            </UserCardRow>
          </UserCard>
        ))}
      </MobileUserList>

      <AlertModal 
        show={alert.show}
        title={alert.title}
        message={alert.message}
        onClose={() => setAlert({ ...alert, show: false })}
      />
    </DashboardContainer>
  );
}
