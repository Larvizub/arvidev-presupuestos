import { ref, set, get, push, remove, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase/config';
import { validateTransaction, sanitizeData } from './validationService';

// Crear nueva transacción (ingreso o gasto)
export const createTransaction = async (budgetId, transactionData) => {
  // Validar presupuesto y permisos
  const budgetSnapshot = await get(ref(database, `budgets/${budgetId}`));
  if (!budgetSnapshot.exists()) {
    throw new Error('Presupuesto no encontrado');
  }
  
  const budget = budgetSnapshot.val();
  const userId = transactionData.userId;
  
  // Verificar que el usuario tenga permisos (propietario o compartido)
  if (budget.ownerId !== userId && (!budget.sharedWith || !budget.sharedWith[userId])) {
    throw new Error('No tienes permiso para agregar transacciones a este presupuesto');
  }
  
  // Validar datos
  const { isValid, errors } = validateTransaction(transactionData);
  if (!isValid) {
    throw new Error(`Datos inválidos: ${JSON.stringify(errors)}`);
  }
  
  // Sanitizar datos
  const sanitizedData = sanitizeData(transactionData);
  
  // Crear transacción con ID único
  const transactionRef = push(ref(database, `transactions/${budgetId}`));
  const transactionId = transactionRef.key;
  
  // Guardar con metadatos adicionales
  await set(transactionRef, {
    ...sanitizedData,
    id: transactionId,
    createdAt: new Date().toISOString(),
    createdBy: userId
  });
  
  // Registrar actividad
  await push(ref(database, `userActivity/${userId}`), {
    action: 'createtransaction',
    transactionId,
    budgetId,
    type: sanitizedData.type,
    amount: sanitizedData.amount,
    timestamp: new Date().toISOString()
  });
  
  return transactionId;
};

// Obtener todas las transacciones de un presupuesto
export const getBudgetTransactions = async (budgetId) => {
  const transactionsRef = ref(database, `transactions/${budgetId}`);
  const snapshot = await get(transactionsRef);
  
  if (!snapshot.exists()) return [];
  
  return Object.values(snapshot.val());
};

// Actualizar transacción
export const updateTransaction = async (budgetId, transactionId, transactionData) => {
  // Asegurarnos de no sobrescribir el ID ni la fecha de creación
  const { id, createdAt, ...updateData } = transactionData;
  
  // Guardar la fecha de actualización
  updateData.updatedAt = new Date().toISOString();
  
  return update(ref(database, `transactions/${budgetId}/${transactionId}`), updateData);
};

// Obtener una transacción específica
export const getTransaction = async (budgetId, transactionId) => {
  const transactionRef = ref(database, `transactions/${budgetId}/${transactionId}`);
  const snapshot = await get(transactionRef);
  
  if (!snapshot.exists()) {
    throw new Error('Transacción no encontrada');
  }
  
  return snapshot.val();
};

// Eliminar transacción
export const deleteTransaction = async (budgetId, transactionId, userId) => {
  // Verificar que exista la transacción
  const transactionRef = ref(database, `transactions/${budgetId}/${transactionId}`);
  const snapshot = await get(transactionRef);
  
  if (!snapshot.exists()) {
    throw new Error('Transacción no encontrada');
  }
  
  const transaction = snapshot.val();
  
  // Verificar permisos - solo el creador puede eliminar
  if (transaction.createdBy !== userId) {
    throw new Error('No tienes permiso para eliminar esta transacción');
  }
  
  // Verificar que la transacción no sea muy antigua (límite de 30 días)
  const createdAt = new Date(transaction.createdAt);
  const now = new Date();
  const differenceInDays = (now - createdAt) / (1000 * 60 * 60 * 24);
  
  if (differenceInDays > 30) {
    throw new Error('No se pueden eliminar transacciones con más de 30 días de antigüedad');
  }
  
  // Eliminar transacción
  await remove(transactionRef);
  
  // Registrar eliminación para auditoría
  await push(ref(database, `userActivity/${userId}`), {
    action: 'deletetransaction',
    transactionId,
    budgetId,
    timestamp: new Date().toISOString()
  });
  
  return true;
};

// Obtener transacciones por categoría
export const getTransactionsByCategory = async (budgetId, category) => {
  const transactionsRef = query(
    ref(database, `transactions/${budgetId}`),
    orderByChild('category'),
    equalTo(category)
  );
  
  const snapshot = await get(transactionsRef);
  
  if (!snapshot.exists()) return [];
  
  return Object.values(snapshot.val());
};
