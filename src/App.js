import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import PrivateRoute from './components/layout/PrivateRoute';
import AdminRoute from './components/layout/AdminRoute';
import Navigation from './components/layout/Navigation';
import styled, { createGlobalStyle } from 'styled-components';

// lazy load pages y auth
const Login = lazy(() => import('./components/auth/Login'));
const Signup = lazy(() => import('./components/auth/Signup'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const SharedBudgets = lazy(() => import('./pages/SharedBudgets'));
const Settings = lazy(() => import('./pages/Settings'));
const Users = lazy(() => import('./pages/Users'));
const Roles = lazy(() => import('./pages/Roles'));

const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
    font-family: 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
  }
  
  body {
    background-color: #f5f7fa;
    color: #2c3e50;
    line-height: 1.6;
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.main`
  flex: 1;
  padding-bottom: 40px;
  
  @media (max-width: 768px) {
    padding-bottom: 100px;
  }
`;

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <CurrencyProvider>
            <GlobalStyle />
            <AppContainer>
              <Navigation />
              <MainContent>
                <Suspense fallback={<div>Cargando...</div>}>
                  <Routes>
                    <Route 
                      path="/" 
                      element={<Navigate to="/login" replace />} 
                    />
                    <Route 
                      path="/login" 
                      element={<Login />} 
                    />
                    <Route 
                      path="/signup" 
                      element={<Signup />} 
                    />
                    <Route 
                      path="/dashboard" 
                      element={
                        <PrivateRoute>
                          <Dashboard />
                        </PrivateRoute>
                      }
                    />
                    <Route 
                      path="/shared" 
                      element={
                        <PrivateRoute>
                          <SharedBudgets />
                        </PrivateRoute>
                      } 
                    />
                    <Route 
                      path="/users" 
                      element={
                        <AdminRoute>
                          <Users />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/roles" 
                      element={
                        <AdminRoute>
                          <Roles />
                        </AdminRoute>
                      } 
                    />
                    <Route 
                      path="/settings" 
                      element={
                        <PrivateRoute>
                          <Settings />
                        </PrivateRoute>
                      } 
                    />
                  </Routes>
                </Suspense>
              </MainContent>
            </AppContainer>
          </CurrencyProvider>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
