import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useCurrency, CURRENCIES } from '../contexts/CurrencyContext';
import styled from 'styled-components';
import { FaUser, FaGlobeAmericas, FaCog } from 'react-icons/fa';

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

const SettingsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
`;

const Card = styled.div`
  background-color: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #3498db, #2980b9);
  padding: 20px 24px;
  color: white;
  display: flex;
  align-items: center;
  gap: 10px;
  
  h2 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 600;
  }
  
  svg {
    font-size: 1.2rem;
  }
`;

const CardContent = styled.div`
  padding: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  color: #1e293b;
  font-weight: 500;
  font-size: 0.95rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  color: #64748b;
  
  &:focus {
    border-color: #3498db;
    background-color: white;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
    outline: none;
  }
  
  &:read-only {
    background-color: #f1f5f9;
    cursor: default;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 14px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  background-color: #f8fafc;
  cursor: pointer;
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
    <DashboardContainer>
      <Header>
        <div>
          <Title><FaCog /> Configuración</Title>
          <WelcomeMessage>
            Personaliza tu experiencia y gestiona tu cuenta.
          </WelcomeMessage>
        </div>
      </Header>
      
      <SettingsGrid>
        <Card>
          <CardHeader>
            <FaUser />
            <h2>Información Personal</h2>
          </CardHeader>
          
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <FaGlobeAmericas />
            <h2>Preferencias Regionales</h2>
          </CardHeader>
          
          <CardContent>
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
          </CardContent>
        </Card>
      </SettingsGrid>
    </DashboardContainer>
  );
}
