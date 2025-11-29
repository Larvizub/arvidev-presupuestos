import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { database } from '../firebase/config';
import { ref, get, update } from 'firebase/database';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from '../components/common/LoadingSpinner';
import AlertModal from '../components/common/AlertModal';

const Container = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-bottom: 20px;
`;

const UserTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileUserList = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 15px;
  }
`;

const UserCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const UserCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 10px;
  margin-bottom: 5px;
`;

const UserCardName = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  color: #2c3e50;
`;

const UserCardRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
`;

const Label = styled.span`
  color: #64748b;
  font-weight: 500;
`;

const Value = styled.span`
  color: #2c3e50;
  font-weight: 500;
`;

const Th = styled.th`
  background-color: #f8f9fa;
  color: #2c3e50;
  padding: 15px;
  text-align: left;
  border-bottom: 2px solid #e9ecef;
`;

const Td = styled.td`
  padding: 15px;
  border-bottom: 1px solid #e9ecef;
  color: #2c3e50;
`;

const Select = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ced4da;
  background-color: white;
  cursor: pointer;
  
  &:disabled {
    background-color: #e9ecef;
    cursor: not-allowed;
  }
`;

const Badge = styled.span`
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: bold;
  background-color: ${props => props.role === 'admin' ? '#e74c3c' : '#3498db'};
  color: white;
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

  if (loading) return <LoadingSpinner />;

  return (
    <Container>
      <Title>Gestión de Usuarios</Title>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
      
      <UserTable>
        <thead>
          <tr>
            <Th>Usuario</Th>
            <Th>Email</Th>
            <Th>Rol Actual</Th>
            <Th>Acciones</Th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <Td>{getDisplayName(user)}</Td>
              <Td>{user.email}</Td>
              <Td>
                <Badge role={user.role || 'user'}>
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
            </tr>
          ))}
        </tbody>
      </UserTable>

      <MobileUserList>
        {users.map(user => (
          <UserCard key={user.id}>
            <UserCardHeader>
              <UserCardName>{getDisplayName(user)}</UserCardName>
              <Badge role={user.role || 'user'}>
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
    </Container>
  );
}
