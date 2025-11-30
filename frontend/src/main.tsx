
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css';
import App from './App'
import { AuthProvider } from './context/AuthProvider';
import {  QueryProvider } from './lib/react-query/QueryProvider';
createRoot(document.getElementById('root')!).render(

    <BrowserRouter>
      <AuthProvider>
        <QueryProvider>
          <App />
        </QueryProvider>
      </AuthProvider>
    </BrowserRouter>

)
