import { ref, set, get, push, remove, update, query, orderByChild, equalTo, onValue } from 'firebase/database';
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
  try {
    const resultsMap = {};

    // 1) Intentar usar el índice userBudgets
    try {
      const userBudgetsRef = ref(database, `userBudgets/${userId}`);
      const snapshot = await get(userBudgetsRef);
      if (snapshot.exists()) {
        const budgetIds = Object.keys(snapshot.val());
        await Promise.all(budgetIds.map(async id => {
          try {
            const snap = await get(ref(database, `budgets/${id}`));
            if (snap.exists()) resultsMap[id] = snap.val();
          } catch (err) {
            console.warn(`Error fetching budget ${id} from budgets/:`, err && err.code, err && err.message);
          }
        }));
      }
    } catch (err) {
      console.warn('No se pudo leer userBudgets (posible regla), intentar fallback:', err && err.code, err && err.message);
    }

    // 2) Fallback: presupuestos donde el usuario es owner
    try {
      const ownerQuery = query(ref(database, 'budgets'), orderByChild('ownerId'), equalTo(userId));
      const ownerSnap = await get(ownerQuery);
      if (ownerSnap.exists()) {
        Object.entries(ownerSnap.val()).forEach(([id, val]) => { resultsMap[id] = val; });
      }
    } catch (err) {
      console.warn('Error querying budgets by ownerId:', err && err.code, err && err.message);
    }

    // 3) Fallback: presupuestos compartidos con el usuario (sharedWith/<uid> == true)
    try {
      const sharedQuery = query(ref(database, 'budgets'), orderByChild(`sharedWith/${userId}`), equalTo(true));
      const sharedSnap = await get(sharedQuery);
      if (sharedSnap.exists()) {
        Object.entries(sharedSnap.val()).forEach(([id, val]) => { resultsMap[id] = val; });
      }
    } catch (err) {
      console.warn('Error querying budgets by sharedWith:', err && err.code, err && err.message);
    }

    // Devolver array único de presupuestos
    return Object.values(resultsMap);
  } catch (error) {
    console.error('Error in getUserBudgets:', error && error.code, error && error.message, error);
    throw error;
  }
};

// Suscribirse a los presupuestos del usuario (Tiempo Real)
export const subscribeToUserBudgets = (userId, callback) => {
  const userBudgetsRef = ref(database, `userBudgets/${userId}`);
  
  return onValue(userBudgetsRef, async (snapshot) => {
    try {
      if (snapshot.exists()) {
        const budgetIds = Object.keys(snapshot.val());
        const budgets = await Promise.all(budgetIds.map(async id => {
          const snap = await get(ref(database, `budgets/${id}`));
          return snap.exists() ? snap.val() : null;
        }));
        callback(budgets.filter(b => b !== null));
      } else {
        // Fallback si no hay nada en userBudgets, intentar buscar por ownerId
        const ownerQuery = query(ref(database, 'budgets'), orderByChild('ownerId'), equalTo(userId));
        const ownerSnap = await get(ownerQuery);
        if (ownerSnap.exists()) {
          callback(Object.values(ownerSnap.val()));
        } else {
          callback([]);
        }
      }
    } catch (error) {
      console.error("Error in subscribeToUserBudgets:", error);
      callback([]);
    }
  });
};

// Obtener presupuestos del usuario para un mes específico
export const getUserBudgetsByMonth = async (userId, month, year) => {
  try {
    const allBudgets = await getUserBudgets(userId);

    if (month !== undefined && year !== undefined) {
      return allBudgets.filter(budget => budget.month === month && budget.year === year);
    }

    return allBudgets;
  } catch (error) {
    console.error('Error in getUserBudgetsByMonth:', error && error.code, error && error.message, error);
    throw error;
  }
};

// Actualizar presupuesto
export const updateBudget = async (budgetId, budgetData) => {
  return update(ref(database, `budgets/${budgetId}`), budgetData);
};

// Compartir presupuesto con otro usuario
export const shareBudgetWithUser = async (budgetId, userEmail, currentUserId) => {
  if (!currentUserId) {
    throw new Error('Usuario no autenticado');
  }

  // Verificar que el usuario actual tenga permiso (dueño o ya compartido con él)
  const budgetSnapshot = await get(ref(database, `budgets/${budgetId}`));
  if (!budgetSnapshot.exists()) {
    throw new Error('Presupuesto no encontrado');
  }
  
  const budget = budgetSnapshot.val();
  const isOwner = budget.ownerId === currentUserId;
  const isSharedWithMe = budget.sharedWith && budget.sharedWith[currentUserId];

  if (!isOwner && !isSharedWithMe) {
    throw new Error('No tienes permiso para compartir este presupuesto');
  }
  
  // Primero buscar usuario por email
  const normalizedEmail = userEmail.toLowerCase().trim();
  const usersRef = query(ref(database, 'users'), orderByChild('email'), equalTo(normalizedEmail));
  let snapshot;
  try {
    snapshot = await get(usersRef);
  } catch (err) {
    console.error('Error querying users by email:', err && err.code, err && err.message, err);
    throw err;
  }
  
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
    // Si ya existe en sharedWith, asegurarse de que la referencia en userBudgets también exista.
    try {
      const userBudgetRef = ref(database, `userBudgets/${userId}/${budgetId}`);
      const existingRef = await get(userBudgetRef);
      if (!existingRef.exists()) {
        await set(userBudgetRef, true);
      }
      // Devolver true; la operación es idempotente.
      return true;
    } catch (err) {
      console.warn('SharedWith existe pero fallo al asegurar userBudgets ref:', err && err.code, err && err.message);
      throw new Error('El presupuesto ya está compartido con este usuario');
    }
  }
  
  // Intentar escribir ambas rutas en una sola operación atómica (mejor diagnóstico de permisos)
  const updates = {};
  updates[`/budgets/${budgetId}/sharedWith/${userId}`] = true;
  updates[`/userBudgets/${userId}/${budgetId}`] = true;
  try {
    await update(ref(database), updates);
  } catch (err) {
    console.error('Error writing sharedWith/userBudgets atomically:', err && err.code, err && err.message, err);
    // Intentar escritura individual para dar mensajes más claros
    try {
      await set(ref(database, `budgets/${budgetId}/sharedWith/${userId}`), true);
    } catch (e1) {
      console.error('Failed to write budgets/sharedWith:', e1 && e1.code, e1 && e1.message, e1);
      throw new Error('No se pudo compartir (escritura a budgets/sharedWith falló)');
    }

    try {
      await set(ref(database, `userBudgets/${userId}/${budgetId}`), true);
    } catch (e2) {
      console.error('Failed to write userBudgets ref:', e2 && e2.code, e2 && e2.message, e2);
      throw new Error('No se pudo compartir (escritura a userBudgets falló)');
    }
  }
  
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
