import React from 'react';
import styled from 'styled-components';
import { FaPlus, FaMinus, FaWallet, FaShareAlt } from 'react-icons/fa';

const ButtonsContainer = styled.div`
  display: flex;
  gap: 12px;
  margin: 20px 0;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    gap: 8px;
  }
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 14px 20px;
  border-radius: 12px;
  border: none;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
  background-color: ${props => props.bgColor || '#3498db'};
  color: white;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.1);
    background-color: ${props => props.hoverColor || '#2980b9'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
    flex: 1 1 45%; /* Grow to fill space, but allow 2 per row */
  }
`;

const IncomeButton = styled(ActionButton)`
  background-color: #2ecc71;
  
  &:hover {
    background-color: #27ae60;
  }
`;

const ExpenseButton = styled(ActionButton)`
  background-color: #e74c3c;
  
  &:hover {
    background-color: #c0392b;
  }
`;

const BudgetButton = styled(ActionButton)`
  background-color: #3498db;
  
  &:hover {
    background-color: #2980b9;
  }
`;

const ShareButton = styled(ActionButton)`
  background-color: #9b59b6;
  
  &:hover {
    background-color: #8e44ad;
  }
`;

const ActionButtons = ({ 
  onAddIncome, 
  onAddExpense, 
  onAddBudget,
  onShareBudget,
  showShareOption = false
}) => {
  return (
    <ButtonsContainer>
      <BudgetButton onClick={onAddBudget}>
        <FaWallet /> Nuevo Presupuesto
      </BudgetButton>
      <IncomeButton onClick={onAddIncome}>
        <FaPlus /> Añadir Ingreso
      </IncomeButton>
      <ExpenseButton onClick={onAddExpense}>
        <FaMinus /> Añadir Gasto
      </ExpenseButton>
      {showShareOption && (
        <ShareButton onClick={onShareBudget}>
          <FaShareAlt /> Compartir
        </ShareButton>
      )}
    </ButtonsContainer>
  );
};

export default React.memo(ActionButtons);
