import React, { useState } from 'react';
import { shareBudgetWithUser } from '../../services/budgetService';
import { useNotification } from '../../contexts/NotificationContext';
import styled from 'styled-components';
import { FaShare, FaTimes, FaEnvelope } from 'react-icons/fa';

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  margin-bottom: 10px;
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
    border-color: #9b59b6;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(155, 89, 182, 0.2);
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

const ShareButton = styled(Button)`
  background-color: #9b59b6;
  color: white;
  
  &:hover:not(:disabled) {
    background-color: #8e44ad;
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

const SuccessMessage = styled.div`
  color: #2ecc71;
  margin-top: 10px;
  padding: 12px 16px;
  background-color: #f0fdf4;
  border-radius: 8px;
  font-size: 0.95rem;
  display: flex;
  align-items: center;
  
  &:before {
    content: "✅";
    margin-right: 8px;
  }
`;

const ShareIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, #9b59b6, #8e44ad);
  border-radius: 50%;
  margin: 0 auto 20px;
  color: white;
  font-size: 24px;
  box-shadow: 0 4px 10px rgba(155, 89, 182, 0.3);
`;

export default function ShareBudgetForm({ budgetId, budgetName, onClose }) {
  const { showAlert } = useNotification();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim()) {
      return setError('El correo electrónico es obligatorio');
    }
    
    try {
      setError('');
      setSuccess('');
      setLoading(true);
      
      await shareBudgetWithUser(budgetId, email);
      
      setSuccess(`Presupuesto compartido exitosamente con ${email}`);
      setEmail('');
      
      // Mostrar alerta después de compartir exitosamente
      showAlert('Compartir presupuesto', `Presupuesto "${budgetName}" compartido exitosamente con ${email}`);
    } catch (error) {
      setError('Error al compartir el presupuesto: ' + error.message);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Form onSubmit={handleSubmit}>
      <ShareIcon>
        <FaShare />
      </ShareIcon>
      
      <p>Comparte el presupuesto <strong>"{budgetName}"</strong> con otro usuario.</p>
      
      <FormGroup>
        <Label><FaEnvelope /> Correo electrónico del usuario</Label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ejemplo@correo.com"
          required
        />
        <small style={{ color: '#64748b', marginTop: '5px', display: 'block' }}>
          El usuario debe estar registrado en la aplicación con este correo electrónico.
        </small>
      </FormGroup>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <ButtonGroup>
        <CancelButton type="button" onClick={onClose}>
          <FaTimes /> Cancelar
        </CancelButton>
        <ShareButton type="submit" disabled={loading}>
          <FaShare /> {loading ? 'Compartiendo...' : 'Compartir'}
        </ShareButton>
      </ButtonGroup>
    </Form>
  );
}
