import React from 'react';
import styled, { keyframes } from 'styled-components';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const SpinnerContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 40px;
  flex-direction: column;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid rgba(52, 152, 219, 0.1);
  border-radius: 50%;
  border-top-color: #3498db;
  animation: ${spin} 1s ease-in-out infinite;
  margin-bottom: 16px;
`;

const Message = styled.div`
  color: #64748b;
  font-size: 16px;
  font-weight: 500;
`;

const LoadingSpinner = ({ message = 'Cargando...' }) => {
  return (
    <SpinnerContainer>
      <Spinner />
      {message && <Message>{message}</Message>}
    </SpinnerContainer>
  );
};

export default React.memo(LoadingSpinner);
