import { ref, set, get, push, remove, update, query, orderByChild, equalTo } from 'firebase/database';
import { database } from '../firebase/config';
import { validateBudget, sanitizeData } from './validationService';

// Crear nuevo presupuesto
export const createBudget = async (userId, budgetData) => {
  // Validar datos
  const { isValid, errors } = validateBudget(budgetData);
  if (!isValid) {
    throw new Error(`Datos inválidos: ${JSON.stringify(errors)}`);
  }
  
  // Sanitizar datos
  const sanitizedData = sanitizeData(budgetData);
  
  const budgetRef = push(ref(database, `budgets`));
  const budgetId = budgetRef.key;
  
  // Obtener el mes y año actual si no se especifica
  const currentDate = new Date();
  const defaultMonth = currentDate.getMonth(); // 0-11
  const defaultYear = currentDate.getFullYear();
  
  await set(budgetRef, {
    ...sanitizedData,
    id: budgetId,
    ownerId: userId,
    month: sanitizedData.month || defaultMonth,
    year: sanitizedData.year || defaultYear,
    isMonthly: sanitizedData.isMonthly || true,
    sharedWith: sanitizedData.sharedWith || {},
    createdAt: new Date().toISOString()
  });
  
  // Añadir referencia al usuario
  await set(ref(database, `userBudgets/${userId}/${budgetId}`), true);
  
  // Si es compartido, añadir referencia a usuarios compartidos
  if (sanitizedData.sharedWith) {
    Object.keys(sanitizedData.sharedWith).forEach(async (uid) => {
      await set(ref(database, `userBudgets/${uid}/${budgetId}`), true);
    });
  }
  
  return budgetId;
};

// Obtener presupuestos del usuario
export const getUserBudgets = async (userId) => {
  const userBudgetsRef = ref(database, `userBudgets/${userId}`);
  const snapshot = await get(userBudgetsRef);
  
  if (!snapshot.exists()) return [];
  
  const budgetIds = Object.keys(snapshot.val());
  const budgetsPromises = budgetIds.map(id => 
    get(ref(database, `budgets/${id}`)).then(snap => snap.val())
  );
  
  return Promise.all(budgetsPromises);
};

// Obtener presupuestos del usuario para un mes específico
export const getUserBudgetsByMonth = async (userId, month, year) => {
  const userBudgetsRef = ref(database, `userBudgets/${userId}`);
  const snapshot = await get(userBudgetsRef);
  
  if (!snapshot.exists()) return [];
  
  const budgetIds = Object.keys(snapshot.val());
  const budgetsPromises = budgetIds.map(id => 
    get(ref(database, `budgets/${id}`)).then(snap => snap.val())
  );
  
  const allBudgets = await Promise.all(budgetsPromises);
  
  // Filtrar por mes y año si se especifican
  if (month !== undefined && year !== undefined) {
    return allBudgets.filter(budget => 
      budget.month === month && budget.year === year
    );
  }
  
  return allBudgets;
};

// Actualizar presupuesto
export const updateBudget = async (budgetId, budgetData) => {
  return update(ref(database, `budgets/${budgetId}`), budgetData);
};

// Compartir presupuesto con otro usuario
export const shareBudgetWithUser = async (budgetId, userEmail, currentUserId) => {
  // Verificar que el usuario actual sea el propietario
  const budgetSnapshot = await get(ref(database, `budgets/${budgetId}`));
  if (!budgetSnapshot.exists()) {
    throw new Error('Presupuesto no encontrado');
  }
  
  const budget = budgetSnapshot.val();
  if (budget.ownerId !== currentUserId) {
    throw new Error('No tienes permiso para compartir este presupuesto');
  }
  
  // Primero buscar usuario por email
  const usersRef = query(ref(database, 'users'), orderByChild('email'), equalTo(userEmail));
  const snapshot = await get(usersRef);
  
  if (!snapshot.exists()) {
    throw new Error('Usuario no encontrado');
  }
  
  const userId = Object.keys(snapshot.val())[0];
  
  // No permitir compartir con uno mismo
  if (userId === currentUserId) {
    throw new Error('No puedes compartir un presupuesto contigo mismo');
  }
  
  // Verificar si ya está compartido
  if (budget.sharedWith && budget.sharedWith[userId]) {
    throw new Error('El presupuesto ya está compartido con este usuario');
  }
  
  // Añadir usuario a sharedWith
  await set(ref(database, `budgets/${budgetId}/sharedWith/${userId}`), true);
  
  // Añadir referencia al usuario
  await set(ref(database, `userBudgets/${userId}/${budgetId}`), true);
  
  // Registrar la acción para auditoría
  await push(ref(database, `userActivity/${currentUserId}`), {
    action: 'sharebudget',
    budgetId,
    sharedWith: userId,
    timestamp: new Date().toISOString()
  });
  
  return true;
};

// Eliminar presupuesto
export const deleteBudget = async (budgetId, userId) => {
  const budgetRef = ref(database, `budgets/${budgetId}`);
  const snapshot = await get(budgetRef);
  
  if (!snapshot.exists()) {
    throw new Error('Presupuesto no encontrado');
  }
  
  const budget = snapshot.val();
  
  // Verificar que el usuario sea el propietario
  if (budget.ownerId !== userId && budget.createdBy !== userId) {
    throw new Error('No tienes permiso para eliminar este presupuesto');
  }
  
  // Eliminar referencias de usuarios
  await remove(ref(database, `userBudgets/${userId}/${budgetId}`));
  
  // Eliminar referencias de usuarios compartidos
  if (budget.sharedWith) {
    await Promise.all(Object.keys(budget.sharedWith).map(async (uid) => {
      await remove(ref(database, `userBudgets/${uid}/${budgetId}`));
    }));
  }
  
  // Eliminar transacciones
  await remove(ref(database, `transactions/${budgetId}`));
  
  // Eliminar presupuesto
  await remove(budgetRef);
  
  return true;
};
