import React from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaArrowUp, FaArrowDown, FaShoppingCart, FaCheckCircle } from 'react-icons/fa';
import { useCurrency } from '../../contexts/CurrencyContext';

const TransactionsContainer = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 30px;
`;

const TransactionHeader = styled.div`
  background-color: #f8f9fa;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e9ecef;
`;

const TransactionTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
`;

const EmptyMessage = styled.div`
  padding: 30px;
  text-align: center;
  color: #7f8c8d;
`;

const TransactionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHead = styled.thead`
  background-color: #f8f9fa;
  
  th {
    text-align: left;
    padding: 12px 15px;
    color: #2c3e50;
    font-weight: 500;
    border-bottom: 1px solid #e9ecef;
  }
`;

const TableBody = styled.tbody`
  tr {
    border-bottom: 1px solid #e9ecef;
    transition: background-color 0.3s;
    
    &:hover {
      background-color: #f8f9fa;
    }
    
    &:last-child {
      border-bottom: none;
    }
  }
  
  td {
    padding: 12px 15px;
    color: #2c3e50;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  background-color: transparent;
  border: none;
  border-radius: 4px;
  padding: 5px;
  cursor: pointer;
  color: ${props => props.color || '#3498db'};
  transition: background-color 0.3s;
  
  &:hover {
    background-color: #f1f1f1;
  }
`;

const TransactionAmount = styled.span`
  font-weight: 500;
  color: ${props => props.type === 'income' ? '#2ecc71' : '#e74c3c'};
  display: flex;
  align-items: center;
  gap: 5px;
`;

const TransactionDate = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const TransactionCategory = styled.span`
  background-color: #f1f1f1;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  color: #2c3e50;
`;

function TransactionList({ transactions, onEdit, onDelete }) {
  const { formatCurrency } = useCurrency();
  
  // Ordenar transacciones por fecha más reciente
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt)
  );
  
  if (transactions.length === 0) {
    return (
      <TransactionsContainer>
        <TransactionHeader>
          <TransactionTitle>Transacciones</TransactionTitle>
        </TransactionHeader>
        <EmptyMessage>
          No hay transacciones para mostrar
        </EmptyMessage>
      </TransactionsContainer>
    );
  }
  
  return (
    <TransactionsContainer>
      <TransactionHeader>
        <TransactionTitle>Últimas Transacciones</TransactionTitle>
      </TransactionHeader>
      
      <TransactionTable>
        <TableHead>
          <tr>
            <th>Nombre</th>
            <th>Categoría</th>
            <th>Fecha</th>
            <th>Monto</th>
            <th>Acciones</th>
          </tr>
        </TableHead>
        <TableBody>
          {sortedTransactions.map(transaction => {
            // Calcular porcentaje de items pagados para la categoría Alimentación
            let paidPercentage = 0;
            if (transaction.category === 'Alimentación' && 
                transaction.foodItems && 
                transaction.foodItems.length > 0) {
              const totalItems = transaction.foodItems.length;
              const paidItems = transaction.foodItems.filter(item => item.isPaid).length;
              paidPercentage = Math.round((paidItems / totalItems) * 100);
            }
            
            return (
              <tr key={transaction.id}>
                <td>
                  {transaction.name}
                  {transaction.category === 'Alimentación' && transaction.foodItems && transaction.foodItems.length > 0 && (
                    <FoodItemsIndicator>
                      <FaShoppingCart /> {transaction.foodItems.length} artículos
                      {paidPercentage > 0 && (
                        <span style={{ 
                          marginLeft: '8px', 
                          color: paidPercentage === 100 ? '#2ecc71' : '#f39c12' 
                        }}>
                          <FaCheckCircle /> {paidPercentage}% pagado
                        </span>
                      )}
                    </FoodItemsIndicator>
                  )}
                </td>
                <td>
                  <TransactionCategory>
                    {transaction.category}
                  </TransactionCategory>
                </td>
                <td>
                  <TransactionDate>
                    {new Date(transaction.date || transaction.createdAt).toLocaleDateString()}
                  </TransactionDate>
                </td>
                <td>
                  <TransactionAmount type={transaction.type}>
                    {transaction.type === 'income' ? <FaArrowUp /> : <FaArrowDown />}
                    {formatCurrency(transaction.amount)}
                  </TransactionAmount>
                </td>
                <td>
                  <ActionButtons>
                    <ActionButton 
                      onClick={() => onEdit(transaction)} 
                      title="Editar"
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton 
                      color="#e74c3c" 
                      onClick={() => onDelete(transaction.id, transaction.budgetId)} 
                      title="Eliminar"
                    >
                      <FaTrash />
                    </ActionButton>
                  </ActionButtons>
                </td>
              </tr>
            );
          })}
        </TableBody>
      </TransactionTable>
    </TransactionsContainer>
  );
}

const FoodItemsIndicator = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-left: 8px;
  font-size: 0.8rem;
  color: #64748b;
  background-color: #f1f5f9;
  padding: 3px 8px;
  border-radius: 12px;
`;

export default React.memo(TransactionList);
