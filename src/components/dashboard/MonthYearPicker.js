import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaSpinner } from 'react-icons/fa';

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

const Container = styled.div`
  display: flex;
  align-items: center;
  background-color: white;
  border-radius: 12px;
  padding: 10px 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
`;

const MonthYearText = styled.div`
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  svg {
    color: #3498db;
  }
`;

const Button = styled.button`
  background-color: #f8fafc;
  border: none;
  border-radius: 8px;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #64748b;
  
  &:hover {
    background-color: #e2e8f0;
    color: #0f172a;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &.loading svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const MonthYearPicker = ({ month, year, onChange, isLoading = false }) => {
  const [localLoading, setLocalLoading] = useState(false);
  const currentMonth = useMemo(() => MONTHS.find(m => m.value === month), [month]);

  const handlePrevMonth = () => {
    if (isLoading || localLoading) return;
    
    setLocalLoading(true);
    let newMonth = month - 1;
    let newYear = year;
    
    if (newMonth < 0) {
      newMonth = 11;
      newYear = year - 1;
    }
    
    onChange(newMonth, newYear);
    setTimeout(() => setLocalLoading(false), 500);
  };
  
  const handleNextMonth = () => {
    if (isLoading || localLoading) return;
    
    setLocalLoading(true);
    let newMonth = month + 1;
    let newYear = year;
    
    if (newMonth > 11) {
      newMonth = 0;
      newYear = year + 1;
    }
    
    onChange(newMonth, newYear);
    setTimeout(() => setLocalLoading(false), 500);
  };
  
  return (
    <Container>
      <Button 
        onClick={handlePrevMonth} 
        disabled={isLoading || localLoading}
        className={localLoading ? 'loading' : ''}
      >
        {localLoading ? <FaSpinner /> : <FaChevronLeft />}
      </Button>
      <MonthYearText>
        <FaCalendarAlt />
        {currentMonth.label} {year}
      </MonthYearText>
      <Button 
        onClick={handleNextMonth} 
        disabled={isLoading || localLoading}
        className={localLoading ? 'loading' : ''}
      >
        {localLoading ? <FaSpinner /> : <FaChevronRight />}
      </Button>
    </Container>
  );
};

export default React.memo(MonthYearPicker);
