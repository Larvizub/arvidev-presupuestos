import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency, CURRENCIES } from '../contexts/CurrencyContext';
import styled from 'styled-components';
import { FaUser, FaGlobeAmericas } from 'react-icons/fa';

const SettingsContainer = styled.div`
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  color: #2c3e50;
  margin-bottom: 30px;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  padding: 20px;
`;

const CardTitle = styled.h2`
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 0;
  padding-bottom: 15px;
  border-bottom: 1px solid #ecf0f1;
  font-size: 1.3rem;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #2c3e50;
  font-weight: 500;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  background-color: white;
  cursor: pointer;
  
  &:focus {
    border-color: #3498db;
    outline: none;
  }
`;

export default function Settings() {
  const { currentUser } = useAuth();
  const { currency, setCurrency } = useCurrency();
  const [profileData, setProfileData] = useState({
    name: '',
    email: ''
  });
  const [selectedCurrency, setSelectedCurrency] = useState(currency.code);
  
  // Cargar datos del usuario actual
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        name: currentUser.displayName || '',
        email: currentUser.email || ''
      });
    }
  }, [currentUser]);

  useEffect(() => {
    setSelectedCurrency(currency.code);
  }, [currency]);

  const handleCurrencyChange = (e) => {
    const newCode = e.target.value;
    setSelectedCurrency(newCode);
    setCurrency(newCode);
  };
  
  return (
    <SettingsContainer>
      <Title>Configuración</Title>
      
      <Card>
        <CardTitle>
          <FaUser /> Información Personal
        </CardTitle>
        
        <form>
          <FormGroup>
            <Label>Nombre Completo</Label>
            <Input
              type="text"
              value={profileData.name}
              placeholder="Tu nombre completo"
              readOnly
            />
          </FormGroup>
          
          <FormGroup>
            <Label>Correo Electrónico</Label>
            <Input
              type="email"
              value={profileData.email}
              placeholder="tu@correo.com"
              readOnly
            />
          </FormGroup>
        </form>
      </Card>

      <Card>
        <CardTitle>
          <FaGlobeAmericas /> Preferencias Regionales
        </CardTitle>
        
        <FormGroup>
          <Label>Moneda / País</Label>
          <Select value={selectedCurrency} onChange={handleCurrencyChange}>
            {CURRENCIES.map(c => (
              <option key={c.code} value={c.code}>
                {c.name} ({c.symbol})
              </option>
            ))}
          </Select>
        </FormGroup>
      </Card>
    </SettingsContainer>
  );
}
