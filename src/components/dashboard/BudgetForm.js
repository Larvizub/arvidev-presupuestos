import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { createBudget } from '../../services/budgetService';
import styled from 'styled-components';
import { FaSave, FaTimes, FaMoneyBillWave, FaCalendarAlt } from 'react-icons/fa';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.3px;
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
    border-color: #3498db;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    outline: none;
  }
  
  &::placeholder {
    color: #a0aec0;
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
  background-color: #3498db;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #2980b9;
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

const BudgetIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #3498db, #2980b9);
  border-radius: 50%;
  margin: 0 auto 20px;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 10px rgba(52, 152, 219, 0.3);
`;

// Generar opciones de meses
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

// Generar años (desde el actual hasta 5 años en el futuro)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 6 }, (_, i) => currentYear + i);

export default function BudgetForm({ onClose, onBudgetCreated }) {
  const { currentUser } = useAuth();
  const currentDate = new Date();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    initialAmount: '',
    month: currentDate.getMonth(),
    year: currentDate.getFullYear(),
    isMonthly: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      return setError('El nombre del presupuesto es obligatorio');
    }
    
    try {
      setError('');
      setLoading(true);
      
      const budgetData = {
        name: formData.name,
        description: formData.description,
        initialAmount: formData.initialAmount ? parseFloat(formData.initialAmount) : 0,
        month: parseInt(formData.month),
        year: parseInt(formData.year),
        isMonthly: formData.isMonthly,
        createdBy: currentUser.uid
      };
      
      const budgetId = await createBudget(currentUser.uid, budgetData);
      
      if (onBudgetCreated) {
        onBudgetCreated(budgetId);
      }
      
      onClose();
    } catch (error) {
      setError('Error al crear el presupuesto: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <BudgetIcon>
        <FaMoneyBillWave />
      </BudgetIcon>
      
      <FormGroup>
        <Label>Nombre del Presupuesto</Label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej: Presupuesto Mensual, Vacaciones, etc."
          required
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Descripción (opcional)</Label>
        <Input
          type="text"
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Describe para qué usarás este presupuesto"
        />
      </FormGroup>
      
      <FormGroup>
        <Label>Cantidad Inicial (opcional)</Label>
        <Input
          type="number"
          name="initialAmount"
          value={formData.initialAmount}
          onChange={handleChange}
          placeholder="0.00"
          min="0"
          step="0.01"
        />
      </FormGroup>
      
      <FormGroup>
        <Label><FaCalendarAlt /> Período mensual</Label>
        <MonthYearContainer>
          <Select
            name="month"
            value={formData.month}
            onChange={handleChange}
            style={{ flex: 2 }}
          >
            {MONTHS.map(month => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </Select>
          <Select
            name="year"
            value={formData.year}
            onChange={handleChange}
            style={{ flex: 1 }}
          >
            {YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </Select>
        </MonthYearContainer>
      </FormGroup>
      
      <FormGroup>
        <CheckboxContainer>
          <Checkbox
            type="checkbox"
            id="isMonthly"
            name="isMonthly"
            checked={formData.isMonthly}
            onChange={handleChange}
          />
          <CheckboxLabel htmlFor="isMonthly">
            Presupuesto mensual recurrente
          </CheckboxLabel>
        </CheckboxContainer>
      </FormGroup>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <ButtonGroup>
        <CancelButton type="button" onClick={onClose}>
          <FaTimes /> Cancelar
        </CancelButton>
        <SaveButton type="submit" disabled={loading}>
          <FaSave /> {loading ? 'Guardando...' : 'Guardar'}
        </SaveButton>
      </ButtonGroup>
    </Form>
  );
}

const MonthYearContainer = styled.div`
  display: flex;
  gap: 10px;
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
    border-color: #3498db;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    outline: none;
  }
`;

const CheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
`;

const Checkbox = styled.input`
  width: 18px;
  height: 18px;
  accent-color: #3498db;
`;

const CheckboxLabel = styled.label`
  font-size: 16px;
  color: #2c3e50;
`;
