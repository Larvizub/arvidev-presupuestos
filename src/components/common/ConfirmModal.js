import React from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { FaQuestion } from 'react-icons/fa';

const Content = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const IconWrapper = styled.div`
  font-size: 48px;
  color: #3498db;
  margin-bottom: 20px;
`;

const Message = styled.p`
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.5;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 15px;
`;

const Button = styled.button`
  background-color: ${props => props.primary ? '#3498db' : '#e74c3c'};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: ${props => props.primary ? '#2980b9' : '#c0392b'};
  }
`;

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title} width="450px">
      <Content>
        <IconWrapper>
          <FaQuestion />
        </IconWrapper>
        <Message>{message}</Message>
        <ButtonContainer>
          <Button onClick={onCancel}>Cancelar</Button>
          <Button primary onClick={onConfirm}>Confirmar</Button>
        </ButtonContainer>
      </Content>
    </Modal>
  );
};

export default ConfirmModal;
