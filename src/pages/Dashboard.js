import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency } from '../contexts/CurrencyContext';
import { useNotification } from '../contexts/NotificationContext';
import { subscribeToUserBudgets, deleteBudget } from '../services/budgetService';
import { subscribeToBudgetTransactions, deleteTransaction } from '../services/transactionService';
import styled from 'styled-components';
import { FaChartPie, FaWallet, FaArrowUp, FaArrowDown, FaTrash, FaShare, FaEdit } from 'react-icons/fa';
import ActionButtons from '../components/dashboard/ActionButtons';
import Modal from '../components/common/Modal';
import BudgetForm from '../components/dashboard/BudgetForm';
import TransactionForm from '../components/dashboard/TransactionForm';
import TransactionList from '../components/dashboard/TransactionList';
import MonthYearPicker from '../components/dashboard/MonthYearPicker';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ShareBudgetForm from '../components/shared/ShareBudgetForm';

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

const SummaryCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const SummaryCard = styled.div`
  background: ${props => props.gradient || 'linear-gradient(135deg, #3498db, #2980b9)'};
  border-radius: 16px;
  padding: 24px;
  color: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  margin: 0 0 12px;
  font-size: 1.1rem;
  font-weight: 500;
  opacity: 0.9;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  word-break: break-word;
  line-height: 1.2;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
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
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const BudgetHeader = styled.div`
  background: ${props => props.gradient || 'linear-gradient(135deg, #3498db, #2980b9)'};
  padding: 20px 24px;
  color: white;
`;

const BudgetName = styled.h3`
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
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

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { formatCurrency } = useCurrency();
  const { showAlert, showConfirm } = useNotification();
  const [budgets, setBudgets] = useState([]);
  const [transactions, setTransactions] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Estado para el filtro de mes/año
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(currentDate.getMonth());
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  
  // Agregar estado para mostrar todos los presupuestos o solo los del mes actual
  const [showAllBudgets, setShowAllBudgets] = useState(false);

  // Cálculos para estadísticas globales basados en los presupuestos filtrados
  const totalBalance = budgets.reduce((total, budget) => {
    const budgetTransactions = transactions[budget.id] || [];
    const budgetTotal = budgetTransactions.reduce((sum, tx) => {
      return tx.type === 'income' ? sum + tx.amount : sum - tx.amount;
    }, 0);
    return total + budgetTotal;
  }, 0);

  const totalIncome = budgets.reduce((total, budget) => {
    const budgetTransactions = transactions[budget.id] || [];
    const incomeTotal = budgetTransactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return total + incomeTotal;
  }, 0);

  const totalExpenses = budgets.reduce((total, budget) => {
    const budgetTransactions = transactions[budget.id] || [];
    const expenseTotal = budgetTransactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + tx.amount, 0);
    return total + expenseTotal;
  }, 0);

  useEffect(() => {
    let unsubscribeBudgets = () => {};

    if (currentUser) {
      setIsLoading(true);
      unsubscribeBudgets = subscribeToUserBudgets(currentUser.uid, (userBudgets) => {
        // Filtrar por mes/año seleccionado si no se muestran todos
        const filteredBudgets = userBudgets.filter(budget => 
          budget.month === selectedMonth && budget.year === selectedYear
        );
        
        setBudgets(showAllBudgets ? userBudgets : filteredBudgets);
        setIsLoading(false);
      });
    }

    return () => unsubscribeBudgets();
  }, [currentUser, selectedMonth, selectedYear, showAllBudgets]);

  useEffect(() => {
    const unsubscribers = [];
    
    budgets.forEach(budget => {
      const unsub = subscribeToBudgetTransactions(budget.id, (budgetTransactions) => {
        setTransactions(prev => ({
          ...prev,
          [budget.id]: budgetTransactions.map(t => ({
            ...t,
            budgetId: budget.id,
            budgetName: budget.name
          }))
        }));
      });
      unsubscribers.push(unsub);
    });

    return () => {
      unsubscribers.forEach(unsub => unsub());
    };
  }, [budgets]);

  const handleMonthYearChange = (month, year) => {
    setSelectedMonth(month);
    setSelectedYear(year);
  };

  const handleShowAllBudgetsToggle = () => {
    setShowAllBudgets(!showAllBudgets);
  };

  const handleOpenModal = (type, budget = null) => {
    setModalType(type);
    setSelectedBudget(budget);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleBudgetCreated = () => {
    // El listener se encargará de actualizar la lista
    showAlert('Éxito', 'Presupuesto creado correctamente');
  };

  const handleBudgetUpdated = () => {
    // El listener se encargará de actualizar la lista
    showAlert('Éxito', 'Presupuesto actualizado correctamente');
  };

  const handleTransactionCreated = (budgetId) => {
    showAlert('Éxito', 'Transacción registrada correctamente');
  };

  const handleTransactionUpdated = (budgetId) => {
    showAlert('Éxito', 'Transacción actualizada correctamente');
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

  const handleDeleteBudget = async (budgetId) => {
    showConfirm(
      'Eliminar presupuesto',
      '¿Estás seguro de que deseas eliminar este presupuesto? Esta acción no se puede deshacer.',
      async () => {
        try {
          setIsLoading(true);
          await deleteBudget(budgetId, currentUser.uid);
          showAlert('Éxito', 'Presupuesto eliminado correctamente');
        } catch (error) {
          console.error('Error al eliminar el presupuesto', error);
          showAlert('Error', 'Error al eliminar el presupuesto: ' + error.message);
        } finally {
          setIsLoading(false);
        }
      }
    );
  };

  const handleEditTransaction = (transaction) => {
    // Asegurarse de que la transacción tiene todos los datos necesarios
    if (!transaction || !transaction.id) {
      showAlert('Error', 'No se puede editar esta transacción');
      return;
    }
    
    // Para evitar problemas, asegurarse de que la transacción tenga la propiedad budgetId
    if (!transaction.budgetId) {
      // Si no tiene budgetId, intentamos obtenerlo del contexto
      const budgetIds = Object.keys(transactions);
      let updatedTransaction = {...transaction};
      
      // Buscar en qué presupuesto está la transacción
      for (const bid of budgetIds) {
        // Usar find para buscar la transacción en cada presupuesto
        const transactionsInBudget = transactions[bid] || [];
        // eslint-disable-next-line no-loop-func
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

  const handleDeleteTransaction = (transactionId, budgetId) => {
    showConfirm(
      'Eliminar transacción',
      '¿Estás seguro de que deseas eliminar esta transacción?',
      async () => {
        try {
          await deleteTransaction(budgetId, transactionId, currentUser.uid);
          showAlert('Éxito', 'Transacción eliminada correctamente');
        } catch (error) {
          console.error('Error al eliminar la transacción', error);
          showAlert('Error', 'Error al eliminar la transacción: ' + error.message);
        }
      }
    );
  };
  
  if (isLoading) {
    return (
      <DashboardContainer>
        <LoadingSpinner message="Actualizando presupuestos..." />
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      <Header>
        <div>
          <Title><FaChartPie /> Mi Dashboard</Title>
          <WelcomeMessage>
            Hola, {currentUser?.displayName || currentUser?.email}. Aquí tienes un resumen de tus finanzas.
          </WelcomeMessage>
        </div>
      </Header>
      
      <FilterContainer>
        <MonthYearPicker 
          month={selectedMonth} 
          year={selectedYear} 
          onChange={handleMonthYearChange}
          isLoading={isLoading}
        />
        <FilterButton 
          onClick={handleShowAllBudgetsToggle} 
          disabled={isLoading}
        >
          {showAllBudgets ? 'Mostrar Mes Actual' : 'Mostrar Todos'}
        </FilterButton>
      </FilterContainer>
      
      <ActionButtons 
        onAddBudget={() => handleOpenModal('newBudget')}
        onAddIncome={() => budgets.length > 0 ? handleOpenModal('newIncome', budgets[0]) : handleOpenModal('newBudget')}
        onAddExpense={() => budgets.length > 0 ? handleOpenModal('newExpense', budgets[0]) : handleOpenModal('newBudget')}
      />
      
      <SummaryCards>
        <SummaryCard gradient="linear-gradient(135deg, #3498db, #2980b9)">
          <CardTitle><FaWallet /> Balance Total</CardTitle>
          <CardValue>{formatCurrency(totalBalance)}</CardValue>
        </SummaryCard>
        <SummaryCard gradient="linear-gradient(135deg, #2ecc71, #27ae60)">
          <CardTitle><FaArrowUp /> Ingresos Totales</CardTitle>
          <CardValue>{formatCurrency(totalIncome)}</CardValue>
        </SummaryCard>
        <SummaryCard gradient="linear-gradient(135deg, #e74c3c, #c0392b)">
          <CardTitle><FaArrowDown /> Gastos Totales</CardTitle>
          <CardValue>{formatCurrency(totalExpenses)}</CardValue>
        </SummaryCard>
      </SummaryCards>
      
      {budgets.length === 0 ? (
        <EmptyState>
          <EmptyStateTitle>No tienes presupuestos para este período</EmptyStateTitle>
          <EmptyStateMessage>
            {showAllBudgets 
              ? 'No hay presupuestos registrados'
              : `No hay presupuestos para ${MONTHS[selectedMonth].label} ${selectedYear}`
            }
          </EmptyStateMessage>
          <Button 
            onClick={() => handleOpenModal('newBudget')} 
            bg="#3498db" 
            color="white" 
            bgHover="#2980b9"
            style={{ margin: '0 auto', padding: '12px 24px', fontSize: '1rem' }}
          >
            <FaWallet /> Crear Presupuesto
          </Button>
        </EmptyState>
      ) : (
        <>
          <BudgetSectionHeader>
            <h2>Mis Presupuestos</h2>
          </BudgetSectionHeader>
          
          <BudgetGrid>
            {budgets.map(budget => {
              const { income, expenses, balance } = calculateBudgetStats(budget.id);
              
              return (
                <BudgetCard key={budget.id}>
                  <BudgetHeader gradient={balance >= 0 ? 
                    'linear-gradient(135deg, #3498db, #2980b9)' : 
                    'linear-gradient(135deg, #e74c3c, #c0392b)'
                  }>
                    <BudgetName>{budget.name}</BudgetName>
                    {budget.description && <BudgetDesc>{budget.description}</BudgetDesc>}
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
                    
                    <ButtonRow style={{ marginTop: '10px' }}>
                      <Button 
                        bg="#9b59b6" 
                        color="white" 
                        bgHover="#8e44ad"
                        onClick={() => handleOpenModal('shareBudget', budget)}
                      >
                        <FaShare /> Compartir
                      </Button>
                      <Button 
                        bg="#f39c12" 
                        color="white" 
                        bgHover="#e67e22"
                        onClick={() => handleOpenModal('editBudget', budget)}
                      >
                        <FaEdit /> Editar
                      </Button>
                      <Button 
                        bg="#e74c3c" 
                        color="white" 
                        bgHover="#c0392b"
                        onClick={() => handleDeleteBudget(budget.id)}
                      >
                        <FaTrash /> Eliminar
                      </Button>
                    </ButtonRow>
                  </BudgetContent>
                </BudgetCard>
              );
            })}
          </BudgetGrid>
          
          {/* Mostrar lista de transacciones recientes */}
          {budgets.length > 0 && (
            <div>
              <h2 style={{ margin: '24px 0 16px', color: '#1e293b' }}>Transacciones Recientes</h2>
              <TransactionList 
                transactions={budgets
                  .flatMap(budget => transactions[budget.id] || [])
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
          modalType === 'newBudget' ? 'Crear Nuevo Presupuesto' :
          modalType === 'editBudget' ? 'Editar Presupuesto' :
          modalType === 'newIncome' ? 'Registrar Ingreso' : 
          modalType === 'newExpense' ? 'Registrar Gasto' :
          modalType === 'editTransaction' ? 'Editar Transacción' :
          modalType === 'shareBudget' ? 'Compartir Presupuesto' : ''
        }
      >
        {(modalType === 'newBudget' || modalType === 'editBudget') && (
          <BudgetForm 
            onClose={handleCloseModal} 
            onBudgetCreated={handleBudgetCreated}
            onBudgetUpdated={handleBudgetUpdated}
            budgetToEdit={modalType === 'editBudget' ? selectedBudget : null}
          />
        )}
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
        {modalType === 'shareBudget' && selectedBudget && (
          <ShareBudgetForm 
            budgetId={selectedBudget.id}
            budgetName={selectedBudget.name}
            onClose={handleCloseModal}
          />
        )}
      </Modal>
    </DashboardContainer>
  );
}

// Constantes para meses (igual que en MonthYearPicker)
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

const FilterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 10px;
    align-items: flex-start;
  }
`;

const FilterButton = styled.button`
  background-color: #f8fafc;
  color: #1e293b;
  border: none;
  border-radius: 8px;
  padding: 10px 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background-color: #e2e8f0;
  }
`;

const BudgetSectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin: 24px 0 16px;
  
  h2 {
    color: #1e293b;
    margin: 0;
    margin-right: 12px;
  }
`;
