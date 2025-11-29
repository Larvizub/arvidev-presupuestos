import React from 'react';
import styled from 'styled-components';
import { FaCalendarAlt } from 'react-icons/fa';

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 16px;
  padding-left: 44px; /* Espacio para el icono */
  border: 1px solid #e1e5eb;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  color: #2c3e50;
  font-family: inherit;
  appearance: none;
  
  /* Estilos para el placeholder/texto cuando está vacío o lleno */
  &::-webkit-datetime-edit {
    padding: 0;
  }
  
  &:focus {
    border-color: ${props => props.focusColor || '#3498db'};
    background-color: white;
    box-shadow: 0 0 0 3px ${props => props.focusShadow || 'rgba(52, 152, 219, 0.2)'};
    outline: none;
  }

  /* Hacer que el calendario nativo ocupe todo el input para mejor experiencia táctil */
  &::-webkit-calendar-picker-indicator {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #64748b;
  pointer-events: none;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DatePicker = ({ 
  value, 
  onChange, 
  name, 
  required, 
  focusColor, 
  focusShadow, 
  placeholder,
  min,
  max,
  disabled,
  ...props 
}) => {
  return (
    <Container className={props.className}>
      <IconWrapper>
        <FaCalendarAlt />
      </IconWrapper>
      <StyledInput
        type="date"
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        focusColor={focusColor}
        focusShadow={focusShadow}
        placeholder={placeholder}
        min={min}
        max={max}
        disabled={disabled}
        {...props}
      />
    </Container>
  );
};

export default DatePicker;
