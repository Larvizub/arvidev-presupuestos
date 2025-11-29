import React from 'react';
import styled from 'styled-components';

const PageContainer = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin: 0;
`;

export default function SharedBudgets() {
  return (
    <PageContainer>
      <Header>
        <Title>Presupuestos Compartidos</Title>
      </Header>
      
      <p>Aquí podrás ver y gestionar los presupuestos compartidos con otros usuarios.</p>
    </PageContainer>
  );
}
