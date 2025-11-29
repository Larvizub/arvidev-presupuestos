import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-bottom: 20px;
`;

const RoleCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  border-left: 5px solid ${props => props.color};
`;

const RoleTitle = styled.h3`
  color: #2c3e50;
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RoleDescription = styled.p`
  color: #7f8c8d;
  margin-bottom: 15px;
`;

const PermissionList = styled.ul`
  list-style-type: none;
  padding: 0;
`;

const PermissionItem = styled.li`
  padding: 5px 0;
  display: flex;
  align-items: center;
  
  &:before {
    content: "✓";
    color: #27ae60;
    margin-right: 10px;
    font-weight: bold;
  }
`;

export default function Roles() {
  return (
    <Container>
      <Title>Roles y Permisos</Title>
      
      <RoleCard color="#e74c3c">
        <RoleTitle>Administrador</RoleTitle>
        <RoleDescription>
          Tiene acceso completo a todas las funcionalidades del sistema, incluyendo la gestión de usuarios y roles.
        </RoleDescription>
        <PermissionList>
          <PermissionItem>Acceso al Dashboard</PermissionItem>
          <PermissionItem>Gestión de Presupuestos Compartidos</PermissionItem>
          <PermissionItem>Configuración del Perfil</PermissionItem>
          <PermissionItem>Ver lista de Usuarios</PermissionItem>
          <PermissionItem>Asignar Roles a Usuarios</PermissionItem>
          <PermissionItem>Ver definición de Roles</PermissionItem>
        </PermissionList>
      </RoleCard>

      <RoleCard color="#3498db">
        <RoleTitle>Usuario Convencional</RoleTitle>
        <RoleDescription>
          Tiene acceso a las funcionalidades básicas para gestionar sus presupuestos personales y compartidos.
        </RoleDescription>
        <PermissionList>
          <PermissionItem>Acceso al Dashboard</PermissionItem>
          <PermissionItem>Gestión de Presupuestos Compartidos</PermissionItem>
          <PermissionItem>Configuración del Perfil</PermissionItem>
        </PermissionList>
      </RoleCard>
    </Container>
  );
}
