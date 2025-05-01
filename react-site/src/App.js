import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './AuthContext';
import AppRouter from './Router'; // Импортируйте AppRouter

function App() {
  return (
    <AuthProvider>
      <BrowserRouter> {/* Не забудьте обернуть AppRouter в BrowserRouter */}
        <AppRouter />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
