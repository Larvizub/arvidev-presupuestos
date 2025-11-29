import React from 'react';
import styled from 'styled-components';
import { FaUserShield, FaUser, FaCheckCircle } from 'react-icons/fa';

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

const RolesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const RoleCard = styled.div`
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }
`;

const RoleHeader = styled.div`
  background: ${props => props.gradient || 'linear-gradient(135deg, #3498db, #2980b9)'};
  padding: 24px;
  color: white;
  display: flex;
  align-items: center;
  gap: 12px;
  
  h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
  }
  
  svg {
    font-size: 1.5rem;
  }
`;

const RoleContent = styled.div`
  padding: 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const RoleDescription = styled.p`
  color: #64748b;
  margin: 0 0 20px;
  line-height: 1.6;
  font-size: 1rem;
`;

const PermissionList = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const PermissionItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  color: #334155;
  font-size: 0.95rem;
  
  svg {
    color: #2ecc71;
    margin-top: 3px;
    flex-shrink: 0;
  }
`;

export default function Roles() {
  return (
    <DashboardContainer>
      <Header>
        <div>
          <Title><FaUserShield /> Roles y Permisos</Title>
          <WelcomeMessage>
            Consulta los diferentes niveles de acceso disponibles en la plataforma.
          </WelcomeMessage>
        </div>
      </Header>
      
      <RolesGrid>
        <RoleCard>
          <RoleHeader gradient="linear-gradient(135deg, #e74c3c, #c0392b)">
            <FaUserShield />
            <h2>Administrador</h2>
          </RoleHeader>
          <RoleContent>
            <RoleDescription>
              Tiene acceso completo a todas las funcionalidades del sistema, incluyendo la gestión de usuarios y roles.
            </RoleDescription>
            <PermissionList>
              <PermissionItem><FaCheckCircle /> Acceso al Dashboard</PermissionItem>
              <PermissionItem><FaCheckCircle /> Gestión de Presupuestos Compartidos</PermissionItem>
              <PermissionItem><FaCheckCircle /> Configuración del Perfil</PermissionItem>
              <PermissionItem><FaCheckCircle /> Ver lista de Usuarios</PermissionItem>
              <PermissionItem><FaCheckCircle /> Asignar Roles a Usuarios</PermissionItem>
              <PermissionItem><FaCheckCircle /> Ver definición de Roles</PermissionItem>
            </PermissionList>
          </RoleContent>
        </RoleCard>

        <RoleCard>
          <RoleHeader gradient="linear-gradient(135deg, #3498db, #2980b9)">
            <FaUser />
            <h2>Usuario Convencional</h2>
          </RoleHeader>
          <RoleContent>
            <RoleDescription>
              Tiene acceso a las funcionalidades básicas para gestionar sus presupuestos personales y compartidos.
            </RoleDescription>
            <PermissionList>
              <PermissionItem><FaCheckCircle /> Acceso al Dashboard</PermissionItem>
              <PermissionItem><FaCheckCircle /> Gestión de Presupuestos Compartidos</PermissionItem>
              <PermissionItem><FaCheckCircle /> Configuración del Perfil</PermissionItem>
            </PermissionList>
          </RoleContent>
        </RoleCard>
      </RolesGrid>
    </DashboardContainer>
  );
}
