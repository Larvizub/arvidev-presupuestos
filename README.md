# Aplicación de Presupuestos

Una aplicación web moderna para gestionar presupuestos personales y compartidos utilizando React y Firebase.

## Características

- Gestión de presupuestos personales
- Presupuestos compartidos con otros usuarios
- Registro de ingresos y gastos por categorías
- Visualización de estadísticas y balance
- Autenticación de usuarios con Firebase
- Almacenamiento en tiempo real con Firebase Realtime Database
- Diseño responsive adaptable a todos los dispositivos

## Tecnologías utilizadas

- React
- Firebase (Authentication, Realtime Database)
- React Router
- Styled Components
- Chart.js
- React Icons
- Formik y Yup

## Requisitos previos

- Node.js (versión 14 o superior)
- NPM o Yarn
- Una cuenta en Firebase

## Configuración del proyecto

1. Clona este repositorio:
```bash
git clone <url-del-repositorio>
cd app-de-presupuesto
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura Firebase:
   - Crea un proyecto en [Firebase Console](https://console.firebase.google.com/)
   - Habilita Authentication con email/password
   - Habilita Realtime Database
   - Copia las credenciales del proyecto

4. Configura el archivo de variables de entorno:
   - Crea un archivo `.env.local` en la raíz del proyecto
   - Añade las credenciales de Firebase:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_DATABASE_URL=your_database_url
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

5. Inicia la aplicación en modo desarrollo:
```bash
npm start
```

## Estructura del proyecto

```
src/
  ├── components/     # Componentes reutilizables
  │   ├── auth/       # Componentes de autenticación
  │   ├── common/     # Componentes comunes (Modal, Button, etc.)
  │   ├── dashboard/  # Componentes para el dashboard
  │   ├── layout/     # Componentes de estructura (Navigation, etc.)
  │   └── shared/     # Componentes para presupuestos compartidos
  ├── contexts/       # Contextos de React
  ├── firebase/       # Configuración de Firebase
  ├── pages/          # Páginas principales
  ├── services/       # Servicios para interactuar con Firebase
  ├── App.js          # Componente principal
  └── index.js        # Punto de entrada
```

## Despliegue

Para construir la aplicación para producción:

```bash
npm run build
```

Luego puedes desplegar la carpeta `build` en cualquier servicio de hosting como Firebase Hosting, Netlify, Vercel, etc.

## Seguridad

Asegúrate de configurar las reglas de seguridad de Firebase Realtime Database para proteger tus datos. Aquí hay un ejemplo básico:

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "budgets": {
      "$budgetId": {
        ".read": "data.child('ownerId').val() === auth.uid || data.child('sharedWith').child(auth.uid).exists()",
        ".write": "data.child('ownerId').val() === auth.uid || data.child('sharedWith').child(auth.uid).exists()"
      }
    },
    "transactions": {
      "$budgetId": {
        ".read": "root.child('budgets').child($budgetId).child('ownerId').val() === auth.uid || root.child('budgets').child($budgetId).child('sharedWith').child(auth.uid).exists()",
        ".write": "root.child('budgets').child($budgetId).child('ownerId').val() === auth.uid || root.child('budgets').child($budgetId).child('sharedWith').child(auth.uid).exists()"
      }
    },
    "userBudgets": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```
