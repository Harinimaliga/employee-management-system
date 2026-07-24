import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ThemeModeProvider } from './context/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ThemeModeProvider>
      <App />
    </ThemeModeProvider>
  </React.StrictMode>
);
