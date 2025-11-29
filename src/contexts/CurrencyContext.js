import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { ref, update, get } from 'firebase/database';
import { database } from '../firebase/config';

const CurrencyContext = createContext();

export function useCurrency() {
  return useContext(CurrencyContext);
}

export const CURRENCIES = [
  { code: 'USD', symbol: '$', locale: 'en-US', name: 'Dólar Estadounidense (USD)' },
  { code: 'EUR', symbol: '€', locale: 'es-ES', name: 'Euro (EUR)' },
  { code: 'MXN', symbol: '$', locale: 'es-MX', name: 'Peso Mexicano (MXN)' },
  { code: 'COP', symbol: '$', locale: 'es-CO', name: 'Peso Colombiano (COP)' },
  { code: 'ARS', symbol: '$', locale: 'es-AR', name: 'Peso Argentino (ARS)' },
  { code: 'CLP', symbol: '$', locale: 'es-CL', name: 'Peso Chileno (CLP)' },
  { code: 'PEN', symbol: 'S/', locale: 'es-PE', name: 'Sol Peruano (PEN)' },
  { code: 'CRC', symbol: '₡', locale: 'es-CR', name: 'Colón Costarricense (CRC)' },
  { code: 'GTQ', symbol: 'Q', locale: 'es-GT', name: 'Quetzal Guatemalteco (GTQ)' },
  { code: 'HNL', symbol: 'L', locale: 'es-HN', name: 'Lempira Hondureño (HNL)' },
  { code: 'NIO', symbol: 'C$', locale: 'es-NI', name: 'Córdoba Nicaragüense (NIO)' },
  { code: 'DOP', symbol: 'RD$', locale: 'es-DO', name: 'Peso Dominicano (DOP)' },
  { code: 'PYG', symbol: '₲', locale: 'es-PY', name: 'Guaraní Paraguayo (PYG)' },
  { code: 'UYU', symbol: '$', locale: 'es-UY', name: 'Peso Uruguayo (UYU)' },
  { code: 'BOB', symbol: 'Bs.', locale: 'es-BO', name: 'Boliviano (BOB)' },
  { code: 'VES', symbol: 'Bs.', locale: 'es-VE', name: 'Bolívar Venezolano (VES)' },
];

export function CurrencyProvider({ children }) {
  const { currentUser } = useAuth();
  const [currency, setCurrencyState] = useState(CURRENCIES[0]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserCurrency() {
      if (currentUser) {
        try {
          const snapshot = await get(ref(database, `users/${currentUser.uid}/currency`));
          if (snapshot.exists()) {
            const savedCode = snapshot.val();
            const found = CURRENCIES.find(c => c.code === savedCode);
            if (found) setCurrencyState(found);
          }
        } catch (error) {
          console.error("Error loading currency:", error);
        }
      }
      setLoading(false);
    }
    
    loadUserCurrency();
  }, [currentUser]);

  const setCurrency = async (code) => {
    const newCurrency = CURRENCIES.find(c => c.code === code);
    if (newCurrency) {
      setCurrencyState(newCurrency);
      if (currentUser) {
        try {
          await update(ref(database, `users/${currentUser.uid}`), { currency: code });
        } catch (error) {
          console.error("Error saving currency:", error);
        }
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const value = {
    currency,
    setCurrency,
    formatCurrency,
    loading
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}
