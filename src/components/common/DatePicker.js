import React from 'react';
import styled from 'styled-components';
import { FaCalendarAlt } from 'react-icons/fa';

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Icon = styled.div`
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  font-size: 16px;
  background-color: #f8fafc;
  color: #1e293b;
  transition: all 0.2s ease;

  &:focus {
    border-color: ${props => props.isIncome ? '#2ecc71' : '#e74c3c'};
    background-color: white;
    box-shadow: 0 0 0 3px ${props => props.isIncome ? 'rgba(46, 204, 113, 0.1)' : 'rgba(231, 76, 60, 0.1)'};
    outline: none;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 15px;
  }
`;

function formatDateToYYYYMM(date) {
  if (!date) return '';
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d)) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function formatDateToYYYYMMDD(date) {
  if (!date) return '';
  const d = (date instanceof Date) ? date : new Date(date);
  if (isNaN(d)) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function DatePicker({
  name,
  value,
  onChange,
  min,
  max,
  required = false,
  disabled = false,
  isIncome = false,
  mode = 'date', // 'date' | 'month-year'
  yearRange = null,
  placeholder = ''
}) {
  if (mode === 'month-year') {
    // value may be Date or string
    const inputValue = value instanceof Date ? formatDateToYYYYMM(value) : (typeof value === 'string' ? (value.length >= 7 ? value.slice(0,7) : value) : '');

    // compute min/max from yearRange if provided
    let minAttr = min || '';
    let maxAttr = max || '';
    if (yearRange && typeof yearRange === 'object') {
      const now = new Date();
      const currentYear = now.getFullYear();
      if (yearRange.past !== undefined) {
        minAttr = `${currentYear - Number(yearRange.past)}-01`;
      }
      if (yearRange.future !== undefined) {
        maxAttr = `${currentYear + Number(yearRange.future)}-12`;
      }
    }

    const handleChange = (e) => {
      const val = e.target.value; // 'YYYY-MM'
      if (!val) {
        if (onChange) onChange(null);
        return;
      }
      const [y, m] = val.split('-').map(Number);
      const dateObj = new Date(y, m - 1, 1);
      if (onChange) onChange(dateObj);
    };

    return (
      <Wrapper>
        <Icon aria-hidden><FaCalendarAlt /></Icon>
        <Input
          type="month"
          name={name}
          value={inputValue}
          onChange={handleChange}
          min={minAttr}
          max={maxAttr}
          required={required}
          disabled={disabled}
          isIncome={isIncome}
          aria-label={name}
          placeholder={placeholder}
        />
      </Wrapper>
    );
  }

  // default: date mode (YYYY-MM-DD), keep onChange as event-like to preserve existing handlers
  const inputValue = value instanceof Date ? formatDateToYYYYMMDD(value) : (typeof value === 'string' ? value : '');

  const handleDateChange = (e) => {
    const val = e.target.value; // 'YYYY-MM-DD'
    if (!onChange) return;
    // preserve compatibility: if parent expects event-like (has target.name), forward event-like
    onChange({ target: { name, value: val } });
  };

  return (
    <Wrapper>
      <Icon aria-hidden><FaCalendarAlt /></Icon>
      <Input
        type="date"
        name={name}
        value={inputValue}
        onChange={handleDateChange}
        min={min}
        max={max}
        required={required}
        disabled={disabled}
        isIncome={isIncome}
        aria-label={name}
        placeholder={placeholder}
      />
    </Wrapper>
  );
}
