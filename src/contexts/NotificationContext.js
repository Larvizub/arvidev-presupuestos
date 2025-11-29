import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';
import AlertModal from '../components/common/AlertModal';
import ConfirmModal from '../components/common/ConfirmModal';

const NotificationContext = createContext();

export function useNotification() {
  return useContext(NotificationContext);
}

export function NotificationProvider({ children }) {
  const [alert, setAlert] = useState({
    show: false,
    title: '',
    message: '',
    onClose: () => {}
  });
  
  const [confirm, setConfirm] = useState({
    show: false,
    title: '',
    message: '',
    onConfirm: () => {},
    onCancel: () => {}
  });
  
  const showAlert = useCallback((title, message, onClose = () => {}) => {
    setAlert({
      show: true,
      title,
      message,
      onClose
    });
  }, []);
  
  const hideAlert = useCallback(() => {
    setAlert(prev => ({
      ...prev,
      show: false
    }));
  }, []);
  
  const showConfirm = useCallback((title, message, onConfirm = () => {}, onCancel = () => {}) => {
    setConfirm({
      show: true,
      title,
      message,
      onConfirm,
      onCancel
    });
  }, []);
  
  const hideConfirm = useCallback(() => {
    setConfirm(prev => ({
      ...prev,
      show: false
    }));
  }, []);
  
  const value = useMemo(() => ({
    showAlert,
    hideAlert,
    showConfirm,
    hideConfirm
  }), [showAlert, hideAlert, showConfirm, hideConfirm]);
  
  return (
    <NotificationContext.Provider value={value}>
      {children}
      <AlertModal 
        isOpen={alert.show}
        title={alert.title}
        message={alert.message}
        onClose={() => {
          hideAlert();
          alert.onClose();
        }}
      />
      <ConfirmModal
        isOpen={confirm.show}
        title={confirm.title}
        message={confirm.message}
        onConfirm={() => {
          hideConfirm();
          confirm.onConfirm();
        }}
        onCancel={() => {
          hideConfirm();
          confirm.onCancel();
        }}
      />
    </NotificationContext.Provider>
  );
}
