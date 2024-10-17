import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

const Login = () => {
  const [correoElectronico, setCorreoElectronico] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://localhost:3000/usuario/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correoElectronico, contrasena }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Inicio de sesión fallido');
      }
  
      const data = await response.json();
      
      // Guarda el token y los datos del usuario
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('usuario', JSON.stringify(data.usuario)); // Guarda el usuario en localStorage
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Inicio de sesión fallido:', error);
      setError(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
    }
  };
  
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center flex items-center justify-center">
          <LogIn className="mr-2" /> Iniciar Sesión
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="correoElectronico">Correo Electrónico</label>
              <input
                type="email"
                placeholder="Correo Electrónico"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={correoElectronico}
                onChange={(e) => setCorreoElectronico(e.target.value)}
                required
              />
            </div>
            <div className="mt-4">
              <label className="block">Contraseña</label>
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
            <div className="flex items-baseline justify-between">
              <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900" type="submit">Ingresar</button>
              <a href="/register" className="text-sm text-blue-600 hover:underline">Registrarse</a>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;