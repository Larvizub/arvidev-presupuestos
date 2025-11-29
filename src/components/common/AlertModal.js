import React from 'react';
import styled from 'styled-components';
import Modal from './Modal';
import { FaExclamationCircle } from 'react-icons/fa';

const Content = styled.div`
  text-align: center;
  padding: 20px 0;
`;

const IconWrapper = styled.div`
  font-size: 48px;
  color: #f39c12;
  margin-bottom: 20px;
`;

const Message = styled.p`
  color: #2c3e50;
  margin-bottom: 30px;
  font-size: 16px;
  line-height: 1.5;
`;

const Button = styled.button`
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const AlertModal = ({ isOpen, title, message, onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} width="400px">
      <Content>
        <IconWrapper>
          <FaExclamationCircle />
        </IconWrapper>
        <Message>{message}</Message>
        <Button onClick={onClose}>Aceptar</Button>
      </Content>
    </Modal>
  );
};

export default AlertModal;
