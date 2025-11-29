import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, database } from '../firebase/config';
import { ref, set, get } from 'firebase/database';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [lastActivity, setLastActivity] = useState(Date.now());
  const [tokenRefreshInterval, setTokenRefreshInterval] = useState(null);
  
  // Autenticar usuario
  async function signup(email, password, displayName) {
    try {
      setAuthError(null);
      
      // Validar datos
      if (!email || !email.includes('@') || !password || password.length < 6) {
        throw new Error('Credenciales inválidas');
      }
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Actualizar perfil con displayName
      if (displayName) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      // Guardar información adicional del usuario
      await set(ref(database, `users/${userCredential.user.uid}`), {
        email: userCredential.user.email,
        displayName: displayName || '',
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });
      
      return userCredential.user;
    } catch (error) {
      console.error("Error en signup:", error);
      setAuthError(error.message);
      throw error;
    }
  }
  
  // Iniciar sesión
  async function login(email, password) {
    try {
      setAuthError(null);
      
      // Validar datos
      if (!email || !email.includes('@') || !password) {
        throw new Error('Credenciales inválidas');
      }
      
      // Implementar protección contra fuerza bruta
      const ipAddress = "client-ip"; // En producción, obtendrías la IP real
      const attemptKey = `loginAttempts/${btoa(email)}/${ipAddress.replace(/\./g, '-')}`;
      
      try {
        const attemptsSnapshot = await get(ref(database, attemptKey));
        const attempts = attemptsSnapshot.exists() ? attemptsSnapshot.val() : { count: 0, lastAttempt: 0 };
        
        // Si hay más de 5 intentos en 15 minutos, bloquear
        if (attempts.count >= 5 && Date.now() - attempts.lastAttempt < 15 * 60 * 1000) {
          throw new Error('Demasiados intentos fallidos. Intente nuevamente más tarde.');
        }
        
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        
        // Éxito: reiniciar contador
        await set(ref(database, attemptKey), { count: 0, lastAttempt: Date.now() });
        
        // Actualizar último login
        await set(ref(database, `users/${userCredential.user.uid}/lastLogin`), new Date().toISOString());
        
        return userCredential.user;
      } catch (error) {
        // Si es error de autenticación, incrementar contador
        if (error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
          const attemptsSnapshot = await get(ref(database, attemptKey));
          const attempts = attemptsSnapshot.exists() ? attemptsSnapshot.val() : { count: 0, lastAttempt: 0 };
          
          await set(ref(database, attemptKey), { 
            count: attempts.count + 1, 
            lastAttempt: Date.now() 
          });
        }
        throw error;
      }
    } catch (error) {
      console.error("Error en login:", error);
      setAuthError(error.message);
      throw error;
    }
  }
  
  // Cerrar sesión
  const logout = useCallback(async () => {
    try {
      setAuthError(null);
      await signOut(auth);
      
      // Limpiar cualquier dato de sesión
      if (tokenRefreshInterval) {
        clearInterval(tokenRefreshInterval);
        setTokenRefreshInterval(null);
      }
    } catch (error) {
      console.error("Error en logout:", error);
      setAuthError(error.message);
      throw error;
    }
  }, [tokenRefreshInterval]);
  
  // Recuperar contraseña
  async function resetPassword(email) {
    try {
      setAuthError(null);
      
      // Validar datos
      if (!email || !email.includes('@')) {
        throw new Error('Email inválido');
      }
      
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error en resetPassword:", error);
      setAuthError(error.message);
      throw error;
    }
  }
  
  // Actualizar datos de usuario
  async function updateUserProfile(displayName) {
    try {
      setAuthError(null);
      
      if (!currentUser) {
        throw new Error('No hay usuario autenticado');
      }
      
      await updateProfile(currentUser, { displayName });
      
      // Actualizar base de datos
      await set(ref(database, `users/${currentUser.uid}/displayName`), displayName);
      
      // Actualizar estado local
      setCurrentUser(prev => ({
        ...prev,
        displayName
      }));
      
    } catch (error) {
      console.error("Error en updateUserProfile:", error);
      setAuthError(error.message);
      throw error;
    }
  }
  
  // Configurar temporizador de inactividad (15 minutos)
  useEffect(() => {
    const inactivityTimeout = 15 * 60 * 1000; // 15 minutos
    
    const activityHandler = () => {
      setLastActivity(Date.now());
    };
    
    // Monitorear actividad del usuario
    window.addEventListener('mousemove', activityHandler);
    window.addEventListener('keydown', activityHandler);
    window.addEventListener('click', activityHandler);
    window.addEventListener('scroll', activityHandler);
    
    const checkInactivity = setInterval(() => {
      if (currentUser && Date.now() - lastActivity > inactivityTimeout) {
        console.log('Sesión cerrada por inactividad');
        logout();
      }
    }, 60000); // Verificar cada minuto
    
    return () => {
      window.removeEventListener('mousemove', activityHandler);
      window.removeEventListener('keydown', activityHandler);
      window.removeEventListener('click', activityHandler);
      window.removeEventListener('scroll', activityHandler);
      clearInterval(checkInactivity);
    };
  }, [currentUser, lastActivity, logout]); // Añadir logout como dependencia
  
  // Monitorear cambios en la autenticación
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      setLoading(false);
      
      // Configurar refresco periódico de token (cada 55 minutos)
      if (user) {
        const interval = setInterval(async () => {
          try {
            await user.getIdToken(true);
            console.log('Token de autenticación actualizado');
          } catch (error) {
            console.error('Error al actualizar token:', error);
          }
        }, 55 * 60 * 1000); // 55 minutos
        
        setTokenRefreshInterval(interval);
      }
    });
    
    return unsubscribe;
  }, []);
  
  const value = {
    currentUser,
    signup,
    login,
    logout,
    resetPassword,
    updateUserProfile,
    authError,
    loading
  };
  
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
