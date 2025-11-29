import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createTransaction, updateTransaction, getTransaction } from '../../services/transactionService';
import { getUserBudgets } from '../../services/budgetService';
import styled from 'styled-components';
import { FaSave, FaTimes, FaArrowUp, FaArrowDown, FaCalendarAlt, FaTag, FaAlignLeft, FaWallet, FaShoppingCart } from 'react-icons/fa';
import FoodItemsList from './FoodItemsList';
import { useNotification } from '../../contexts/NotificationContext';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
  
  svg {
    color: #64748b;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  
  &:focus {
    border-color: ${props => props.isIncome ? '#2ecc71' : '#e74c3c'};
    background-color: white;
    box-shadow: 0 0 0 3px ${props => props.isIncome 
      ? 'rgba(46, 204, 113, 0.2)' 
      : 'rgba(231, 76, 60, 0.2)'};
    outline: none;
  }
  
  &::placeholder {
    color: #a0aec0;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 16px center;
  background-size: 16px;
  
  &:focus {
    border-color: ${props => props.isIncome ? '#2ecc71' : '#e74c3c'};
    background-color: white;
    box-shadow: 0 0 0 3px ${props => props.isIncome 
      ? 'rgba(46, 204, 113, 0.2)' 
      : 'rgba(231, 76, 60, 0.2)'};
    outline: none;
  }
`;

const TypeSelector = styled.div`
  display: flex;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  margin-bottom: 10px;
`;

const TypeButton = styled.button`
  flex: 1;
  padding: 16px;
  border: none;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  background-color: ${props => props.active 
    ? (props.isIncome ? '#2ecc71' : '#e74c3c') 
    : '#f8fafc'};
  color: ${props => props.active ? 'white' : '#64748b'};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => props.isIncome 
      ? (props.active ? '#27ae60' : '#e8f8f0')
      : (props.active ? '#c0392b' : '#fef1f0')};
    color: ${props => props.active ? 'white' : (props.isIncome ? '#27ae60' : '#c0392b')};
  }
  
  &:first-child {
    border-right: 1px solid #e2e8f0;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 15px;
`;

const Button = styled.button`
  padding: 12px 18px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
`;

const SaveButton = styled(Button)`
  background-color: ${props => props.isIncome ? '#2ecc71' : '#e74c3c'};
  color: white;
  
  &:hover:not(:disabled) {
    background-color: ${props => props.isIncome ? '#27ae60' : '#c0392b'};
  }
`;

const CancelButton = styled(Button)`
  background-color: #f1f5f9;
  color: #64748b;
  
  &:hover {
    background-color: #e2e8f0;
    color: #475569;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  margin-top: 10px;
  padding: 12px 16px;
  background-color: #fef2f2;
  border-radius: 8px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  
  &:before {
    content: "⚠️";
    margin-right: 8px;
  }
`;

const TransactionIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: ${props => props.isIncome 
    ? 'linear-gradient(135deg, #2ecc71, #27ae60)'
    : 'linear-gradient(135deg, #e74c3c, #c0392b)'};
  border-radius: 50%;
  margin: 0 auto 20px;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 10px ${props => props.isIncome 
    ? 'rgba(46, 204, 113, 0.3)'
    : 'rgba(231, 76, 60, 0.3)'};
`;

// Categorías predefinidas
const EXPENSE_CATEGORIES = [
  'Alimentación',
  'Transporte',
  'Vivienda',
  'Servicios',
  'Salud',
  'Educación',
  'Entretenimiento',
  'Ropa',
  'Seguros',
  'Otros'
];

const INCOME_CATEGORIES = [
  'Salario',
  'Freelance',
  'Inversiones',
  'Regalos',
  'Reembolsos',
  'Otros'
];

// Constantes para meses (igual que en otros componentes)
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

export default function TransactionForm({ 
  budgetId, 
  transactionId, 
  onClose, 
  onTransactionCreated, 
  onTransactionUpdated,
  initialType = 'expense'
}) {
  const { currentUser } = useAuth();
  // Corregir la forma de usar el hook para evitar llamada condicional
  const notification = useNotification();
  const showAlert = notification?.showAlert || (() => {});

  const [userBudgets, setUserBudgets] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: initialType,
    category: initialType === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0],
    description: '',
    date: new Date().toISOString().split('T')[0],
    budgetId: budgetId || '',
    foodItems: []
  });
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [initialLoad, setInitialLoad] = useState(true);

  // Obtener los presupuestos del usuario y la transacción si se está editando
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        // Cargar presupuestos
        const budgets = await getUserBudgets(currentUser.uid);
        setUserBudgets(budgets);
        
        // Si no se proporcionó un presupuesto y hay presupuestos disponibles, seleccionar el primero
        if (!budgetId && budgets.length > 0 && !formData.budgetId) {
          setFormData(prev => ({
            ...prev,
            budgetId: budgets[0].id
          }));
        }
        
        // Si se está editando una transacción existente
        if (transactionId && budgetId) {
          setIsEditing(true);
          setLoading(true);
          
          try {
            const transaction = await getTransaction(budgetId, transactionId);
            
            // Actualizar todo el estado del formulario con los datos de la transacción
            setFormData({
              name: transaction.name || '',
              amount: transaction.amount?.toString() || '',
              type: transaction.type || initialType,
              category: transaction.category || (transaction.type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]),
              description: transaction.description || '',
              date: transaction.date || new Date().toISOString().split('T')[0],
              budgetId: budgetId,
              foodItems: transaction.foodItems || []
            });
          } catch (error) {
            console.error('Error al cargar la transacción', error);
            setError('No se pudo cargar la transacción: ' + error.message);
          }
          
          setLoading(false);
        }
        
        setInitialLoad(false);
      } catch (error) {
        console.error('Error al cargar datos', error);
        setError('Error al cargar datos: ' + error.message);
        setLoading(false);
        setInitialLoad(false);
      }
    };
    
    fetchData();
  }, [currentUser, budgetId, transactionId, initialType, formData.budgetId]); // Añadir formData.budgetId como dependencia

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (type) => {
    setFormData(prev => ({
      ...prev,
      type,
      category: type === 'expense' ? EXPENSE_CATEGORIES[0] : INCOME_CATEGORIES[0]
    }));
  };
  
  // Mejorar el manejo de cambios en los items de alimentación
  const handleFoodItemsChange = (foodItems) => {
    try {
      // Calcular el monto total solo de los artículos NO PAGADOS
      const totalAmount = (Array.isArray(foodItems) ? foodItems : []).reduce((sum, item) => {
        // Solo sumar los que no están pagados
        if (!item.isPaid) {
          return sum + (Number(item.quantity || 0) * Number(item.price || 0));
        }
        return sum;
      }, 0);
      
      // Actualizar formData sin reemplazar todo el objeto
      setFormData(prev => ({
        ...prev,
        foodItems: foodItems || [],
        amount: totalAmount.toFixed(2) // Formatear a 2 decimales
      }));
    } catch (error) {
      console.error("Error actualizando items de alimentación:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.budgetId) {
      return setError('El nombre y el presupuesto son obligatorios');
    }
    
    // Modificar la validación para la categoría de Alimentación
    if (formData.type === 'expense' && formData.category === 'Alimentación') {
      // Si hay items en la lista, usar su total como monto
      if (formData.foodItems && formData.foodItems.length > 0) {
        // El monto ya debería estar calculado correctamente, continuamos
      } else if (!formData.amount || Number(formData.amount) <= 0) {
        // Si no hay items, debe haber un monto válido
        return setError('Debes agregar artículos o especificar un monto total');
      }
    } else if (!formData.amount || Number(formData.amount) <= 0) {
      // Para otras categorías, el monto es obligatorio
      return setError('El monto es obligatorio');
    }
    
    try {
      setError('');
      setLoading(true);
      
      const transactionData = {
        name: formData.name,
        amount: parseFloat(formData.amount || '0'),
        type: formData.type,
        category: formData.category,
        description: formData.description,
        date: formData.date,
        userId: currentUser.uid,
        userName: currentUser.displayName || currentUser.email
      };
      
      // Añadir foodItems solo si la categoría es Alimentación
      if (formData.category === 'Alimentación') {
        transactionData.foodItems = formData.foodItems || [];
      }
      
      // Usar el budgetId del formulario
      const targetBudgetId = formData.budgetId;
      
      if (isEditing && transactionId) {
        // Actualizar transacción existente
        await updateTransaction(targetBudgetId, transactionId, transactionData);
        
        if (onTransactionUpdated) {
          onTransactionUpdated(targetBudgetId);
        }
        
        if (showAlert) {
          showAlert('Éxito', 'Transacción actualizada correctamente');
        }
      } else {
        // Crear nueva transacción
        await createTransaction(targetBudgetId, transactionData);
        
        if (onTransactionCreated) {
          onTransactionCreated(targetBudgetId);
        }
      }
      
      onClose();
    } catch (error) {
      setError('Error al procesar la transacción: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  // Encontrar el presupuesto seleccionado
  const selectedBudget = userBudgets.find(b => b.id === formData.budgetId);
  
  if (loading && initialLoad) {
    return (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <p>Cargando datos...</p>
      </div>
    );
  }
  
  return (
    <Form onSubmit={handleSubmit}>
      <TransactionIcon isIncome={formData.type === 'income'}>
        {formData.type === 'income' ? <FaArrowUp /> : <FaArrowDown />}
      </TransactionIcon>
      
      <TypeSelector>
        <TypeButton 
          type="button"
          isIncome={false}
          active={formData.type === 'expense'}
          onClick={() => handleTypeChange('expense')}
        >
          <FaArrowDown /> Gasto
        </TypeButton>
        <TypeButton 
          type="button"
          isIncome={true}
          active={formData.type === 'income'}
          onClick={() => handleTypeChange('income')}
        >
          <FaArrowUp /> Ingreso
        </TypeButton>
      </TypeSelector>
      
      {/* Selector de presupuesto */}
      <FormGroup>
        <Label><FaWallet /> Presupuesto</Label>
        <Select
          name="budgetId"
          value={formData.budgetId}
          onChange={handleChange}
          required
          isIncome={formData.type === 'income'}
          disabled={isEditing} // Deshabilitar cambio de presupuesto en modo edición
        >
          <option value="">Selecciona un presupuesto</option>
          {userBudgets.map(budget => (
            <option key={budget.id} value={budget.id}>
              {budget.name} ({MONTHS[budget.month].label} {budget.year})
            </option>
          ))}
        </Select>
      </FormGroup>
      
      {selectedBudget && (
        <BudgetInfo isIncome={formData.type === 'income'}>
          Presupuesto seleccionado: <strong>{selectedBudget.name}</strong>
          <span>Período: {MONTHS[selectedBudget.month].label} {selectedBudget.year}</span>
        </BudgetInfo>
      )}
      
      <FormGroup>
        <Label><FaTag /> Nombre</Label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder={formData.type === 'expense' ? 'Ej: Compra supermercado' : 'Ej: Sueldo mensual'}
          required
          isIncome={formData.type === 'income'}
        />
      </FormGroup>
      
      <FormGroup>
        <Label><FaTag /> Categoría</Label>
        <Select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          isIncome={formData.type === 'income'}
        >
          {(formData.type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES).map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
      </FormGroup>
      
      {/* Mejorar el contenedor para el componente de lista de alimentos */}
      {formData.type === 'expense' && formData.category === 'Alimentación' && (
        <div style={{ marginBottom: '15px' }}>
          <Label><FaShoppingCart /> Lista de Compra</Label>
          <div 
            className="food-items-container" 
            onClick={e => e.stopPropagation()}
            onSubmit={e => {
              e.preventDefault();
              e.stopPropagation();
              return false;
            }}
          >
            <FoodItemsList 
              items={formData.foodItems} 
              onChange={handleFoodItemsChange} 
            />
          </div>
          <small style={{ 
            display: 'block', 
            marginTop: '8px', 
            color: '#64748b',
            fontSize: '0.9rem',
            fontStyle: 'italic'
          }}>
            * Marca los artículos como pagados para llevar un control de tu compra.
            El total de la transacción solo refleja los artículos no pagados.
          </small>
        </div>
      )}
      
      <FormGroup>
        <Label><FaTag /> Monto</Label>
        <Input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleChange}
          placeholder="0.00"
          min="0"
          step="0.01"
          required={formData.type !== 'expense' || formData.category !== 'Alimentación' || formData.foodItems.length === 0}
          isIncome={formData.type === 'income'}
          disabled={formData.type === 'expense' && formData.category === 'Alimentación' && formData.foodItems.length > 0}
        />
        {formData.type === 'expense' && formData.category === 'Alimentación' && formData.foodItems.length > 0 && (
          <small style={{ display: 'block', marginTop: '5px', color: '#64748b' }}>
            El monto se calcula automáticamente de los artículos no pagados.
          </small>
        )}
      </FormGroup>
      
      <FormGroup>
        <Label><FaCalendarAlt /> Fecha</Label>
        <Input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleChange}
          required
          isIncome={formData.type === 'income'}
        />
      </FormGroup>
      
      <FormGroup>
        <Label><FaAlignLeft /> Descripción (opcional)</Label>
        <Input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Detalles adicionales..."
          isIncome={formData.type === 'income'}
        />
      </FormGroup>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <ButtonGroup>
        <CancelButton type="button" onClick={onClose}>
          <FaTimes /> Cancelar
        </CancelButton>
        <SaveButton type="submit" disabled={loading} isIncome={formData.type === 'income'}>
          <FaSave /> {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Guardar')}
        </SaveButton>
      </ButtonGroup>
    </Form>
  );
}

const BudgetInfo = styled.div`
  background-color: ${props => props.isIncome ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
  border-left: 3px solid ${props => props.isIncome ? '#2ecc71' : '#e74c3c'};
  padding: 12px 16px;
  border-radius: 6px;
  font-size: 0.9rem;
  color: #1e293b;
  display: flex;
  flex-direction: column;
  
  span {
    margin-top: 4px;
    font-size: 0.8rem;
    color: #64748b;
  }
`;
