import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import '/sw.js'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import MisUbicaciones from './MisUbicaciones.tsx'


const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/MisUbicaciones",
    element: <MisUbicaciones />,
  }
]);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('Service Worker registrado correctamente:', registration.scope);
      })
      .catch(error => {
        console.error('Error al registrar el Service Worker:', error);
      });
  });
} else {
  console.log('Service Workers no soportados');
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
