import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNotification } from '../contexts/NotificationContext';
import { getUserBudgets } from '../services/budgetService';
import { getBudgetTransactions } from '../services/transactionService';
import styled from 'styled-components';
import { FaUserFriends, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import Modal from '../components/common/Modal';
import TransactionForm from '../components/dashboard/TransactionForm';
import TransactionList from '../components/dashboard/TransactionList';
import LoadingSpinner from '../components/common/LoadingSpinner';

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

const BudgetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-bottom: 32px;
`;

const BudgetCard = styled.div`
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const SharedBadge = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.75rem;
  color: white;
  display: flex;
  align-items: center;
  gap: 4px;
  backdrop-filter: blur(4px);
`;

const BudgetHeader = styled.div`
  background: ${props => props.gradient || 'linear-gradient(135deg, #9b59b6, #8e44ad)'};
  padding: 20px 24px;
  color: white;
`;

const BudgetName = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
  padding-right: 60px; /* Espacio para el badge */
`;

const BudgetDesc = styled.p`
  margin: 8px 0 0;
  opacity: 0.8;
  font-size: 0.9rem;
`;

const BudgetContent = styled.div`
  padding: 20px 24px;
`;

const BudgetStats = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
`;

const BudgetStat = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StatLabel = styled.div`
  color: #64748b;
  font-size: 0.9rem;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${props => props.color || '#1e293b'};
  text-align: right;
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 15px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background-color: ${props => props.bg || '#f1f5f9'};
  color: ${props => props.color || '#64748b'};
  font-size: 0.9rem;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
  flex: 1;
  justify-content: center;
  white-space: nowrap;
  
  &:hover {
    background-color: ${props => props.bgHover || '#e2e8f0'};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  background-color: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const EmptyStateTitle = styled.h3`
  font-size: 1.5rem;
  color: #1e293b;
  margin-bottom: 16px;
`;

const EmptyStateMessage = styled.p`
  color: #64748b;
  margin-bottom: 24px;
`;

// Constantes para meses
const MONTHS = [
  { value: 0, label: 'Enero' },
  { value: 1, label: 'Febrero' },
  { value: 2, label: 'Marzo' },
  { value: 3, label: 'Abril' },
  { value: 4, label: 'Mayo' },
  { value: 5, label: 'Junio' },
  { value: 6, label: 'Julio' },
  { value: 7, label: 'Agosto' },
  { value: 8, label: 'Septiembre' },
  { value: 9, label: 'Octubre' },
  { value: 10, label: 'Noviembre' },
  { value: 11, label: 'Diciembre' }
];

export default function SharedBudgets() {
  const { currentUser } = useAuth();
  const { formatCurrency } = useCurrency();
  const { showAlert } = useNotification();
  const [sharedBudgets, setSharedBudgets] = useState([]);
  const [transactions, setTransactions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);

  useEffect(() => {
    const fetchSharedBudgets = async () => {
      if (currentUser) {
        try {
          setIsLoading(true);
          // Obtener todos los presupuestos
          const allBudgets = await getUserBudgets(currentUser.uid);
          
          // Filtrar solo los compartidos (donde el ownerId no es el usuario actual)
          const filteredSharedBudgets = allBudgets.filter(budget => 
            budget.ownerId !== currentUser.uid
          );
          
          setSharedBudgets(filteredSharedBudgets);
          
          // Obtener transacciones para cada presupuesto compartido
          const transactionsData = {};
          
          for (const budget of filteredSharedBudgets) {
            const budgetTransactions = await getBudgetTransactions(budget.id);
            // Inyectar budgetId y budgetName en cada transacción
            transactionsData[budget.id] = budgetTransactions.map(t => ({ 
              ...t, 
              budgetId: budget.id,
              budgetName: budget.name 
            }));
          }
          setTransactions(transactionsData);
        } catch (error) {
          console.error('Error al obtener presupuestos compartidos', error);
        } finally {
          setTimeout(() => {
            setIsLoading(false);
          }, 300);
        }
      }
    };
    
    fetchSharedBudgets();
  }, [currentUser]);

  const handleOpenModal = (type, budget = null) => {
    setModalType(type);
    setSelectedBudget(budget);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleTransactionCreated = async (budgetId) => {
    try {
      const updatedTransactions = await getBudgetTransactions(budgetId);
      // Obtener nombre del presupuesto
      const budget = sharedBudgets.find(b => b.id === budgetId);
      const budgetName = budget ? budget.name : '';
      
      // Inyectar budgetId y budgetName
      const transactionsWithId = updatedTransactions.map(t => ({ 
        ...t, 
        budgetId,
        budgetName
      }));
      
      setTransactions({
        ...transactions,
        [budgetId]: transactionsWithId
      });
      
      showAlert('Éxito', 'Transacción registrada correctamente');
    } catch (error) {
      console.error('Error al actualizar transacciones', error);
    }
  };

  const handleTransactionUpdated = async (budgetId) => {
    try {
      const updatedTransactions = await getBudgetTransactions(budgetId);
      const budget = sharedBudgets.find(b => b.id === budgetId);
      const budgetName = budget ? budget.name : '';
      
      const transactionsWithId = updatedTransactions.map(t => ({ 
        ...t, 
        budgetId,
        budgetName
      }));
      
      setTransactions({
        ...transactions,
        [budgetId]: transactionsWithId
      });
      
      showAlert('Éxito', 'Transacción actualizada correctamente');
    } catch (error) {
      console.error('Error al actualizar transacciones', error);
    }
  };

  const calculateBudgetStats = (budgetId) => {
    const budgetTransactions = transactions[budgetId] || [];
    const income = budgetTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const expenses = budgetTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    const balance = income - expenses;
    
    return { income, expenses, balance };
  };

  const handleEditTransaction = (transaction) => {
    if (!transaction || !transaction.id) {
      showAlert('Error', 'No se puede editar esta transacción');
      return;
    }
    
    if (!transaction.budgetId) {
      const budgetIds = Object.keys(transactions);
      let updatedTransaction = {...transaction};
      
      for (const bid of budgetIds) {
        const transactionsInBudget = transactions[bid] || [];
        const found = transactionsInBudget.find(t => t.id === transaction.id);
        if (found) {
          updatedTransaction.budgetId = bid;
          break;
        }
      }
      
      setSelectedTransaction(updatedTransaction);
    } else {
      setSelectedTransaction(transaction);
    }
    
    setModalType('editTransaction');
    setShowModal(true);
  };

  // En presupuestos compartidos, normalmente no permitimos borrar transacciones de otros
  // a menos que seamos administradores o el creador. Por simplicidad, aquí solo permitimos editar.
  const handleDeleteTransaction = (transactionId, budgetId) => {
    showAlert('Info', 'Contacta al propietario del presupuesto para eliminar transacciones.');
  };

  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingSpinner message="Cargando presupuestos compartidos..." />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <div>
          <Title><FaUserFriends /> Presupuestos Compartidos</Title>
          <WelcomeMessage>
            Gestiona los presupuestos que otros usuarios han compartido contigo.
          </WelcomeMessage>
        </div>
      </Header>
      
      {sharedBudgets.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No tienes presupuestos compartidos</EmptyStateTitle>
          <EmptyStateMessage>
            Cuando alguien comparta un presupuesto contigo, aparecerá aquí.
          </EmptyStateMessage>
          <div style={{ color: '#95a5a6', fontSize: '4rem' }}>
            <FaUserFriends />
          </div>
        </EmptyState>
      ) : (
        <>
          <BudgetGrid>
            {sharedBudgets.map(budget => {
              const { income, expenses, balance } = calculateBudgetStats(budget.id);
              
              return (
                <BudgetCard key={budget.id}>
                  <BudgetHeader gradient={balance >= 0 ? 
                    'linear-gradient(135deg, #9b59b6, #8e44ad)' : 
                    'linear-gradient(135deg, #e74c3c, #c0392b)'
                  }>
                    <SharedBadge>
                      <FaUserFriends /> Compartido
                    </SharedBadge>
                    <BudgetName>{budget.name}</BudgetName>
                    <BudgetDesc>
                      {MONTHS[budget.month].label} {budget.year}
                      {budget.description && ` - ${budget.description}`}
                    </BudgetDesc>
                  </BudgetHeader>
                  
                  <BudgetContent>
                    <BudgetStats>
                      <BudgetStat>
                        <StatLabel>Balance</StatLabel>
                        <StatValue color={balance >= 0 ? '#2ecc71' : '#e74c3c'}>
                          {formatCurrency(Math.abs(balance))}
                        </StatValue>
                      </BudgetStat>
                      <BudgetStat>
                        <StatLabel>Ingresos</StatLabel>
                        <StatValue color="#2ecc71">{formatCurrency(income)}</StatValue>
                      </BudgetStat>
                      <BudgetStat>
                        <StatLabel>Gastos</StatLabel>
                        <StatValue color="#e74c3c">{formatCurrency(expenses)}</StatValue>
                      </BudgetStat>
                    </BudgetStats>
                    
                    <ButtonRow>
                      <Button 
                        bg="#2ecc71" 
                        color="white" 
                        bgHover="#27ae60"
                        onClick={() => handleOpenModal('newIncome', budget)}
                      >
                        <FaArrowUp /> Ingreso
                      </Button>
                      <Button 
                        bg="#e74c3c" 
                        color="white" 
                        bgHover="#c0392b"
                        onClick={() => handleOpenModal('newExpense', budget)}
                      >
                        <FaArrowDown /> Gasto
                      </Button>
                    </ButtonRow>
                  </BudgetContent>
                </BudgetCard>
              );
            })}
          </BudgetGrid>
          
          {/* Mostrar lista de transacciones recientes de presupuestos compartidos */}
          {Object.keys(transactions).length > 0 && (
            <div>
              <h2 style={{ margin: '24px 0 16px', color: '#1e293b' }}>Actividad Reciente</h2>
              <TransactionList 
                transactions={Object.values(transactions)
                  .flat()
                  .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
                }
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
              />
            </div>
          )}
        </>
      )}
      
      {/* Modales */}
      <Modal 
        isOpen={showModal} 
        onClose={handleCloseModal}
        title={
          modalType === 'newIncome' ? 'Registrar Ingreso (Compartido)' : 
          modalType === 'newExpense' ? 'Registrar Gasto (Compartido)' :
          modalType === 'editTransaction' ? 'Editar Transacción' : ''
        }
      >
        {(modalType === 'newIncome' || modalType === 'newExpense') && selectedBudget && (
          <TransactionForm 
            budgetId={selectedBudget.id}
            initialType={modalType === 'newIncome' ? 'income' : 'expense'}
            onClose={handleCloseModal}
            onTransactionCreated={() => handleTransactionCreated(selectedBudget.id)}
          />
        )}
        {modalType === 'editTransaction' && selectedTransaction && (
          <TransactionForm 
            budgetId={selectedTransaction.budgetId}
            transactionId={selectedTransaction.id}
            initialType={selectedTransaction.type}
            onClose={handleCloseModal}
            onTransactionUpdated={handleTransactionUpdated}
          />
        )}
      </Modal>
    </DashboardContainer>
  );
}
