import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserPlus } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({
    nombreCompleto: '',
    correoElectronico: '',
    contrasena: '',
    numero: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const validateForm = () => {
    let errors = {};
    if (formData.nombreCompleto.length < 1) {
      errors.nombreCompleto = 'El nombre completo es requerido';
    }
    if (!formData.correoElectronico.includes('@eia.edu.co')) {
      errors.correoElectronico = 'El correo debe ser de dominio @eia.edu.co';
    }
    if (formData.contrasena.length < 12 || formData.contrasena.length > 50) {
      errors.contrasena = 'La contraseña debe tener entre 12 y 50 caracteres';
    }
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*])/.test(formData.contrasena)) {
      errors.contrasena = 'La contraseña debe incluir mayúsculas, minúsculas, números y caracteres especiales';
    }
    if (isNaN(formData.numero) || formData.numero === '') {
      errors.numero = 'El número debe ser un valor numérico';
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    try {
      const response = await fetch('http://localhost:3000/usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          nombreCompleto: formData.nombreCompleto,
          correoElectronico: formData.correoElectronico,
          contrasena: formData.contrasena,
          numero: parseInt(formData.numero, 10)
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Usuario registrado:', data);
      // If your backend returns a token, you might want to store it
      localStorage.setItem('token', data.token);
      navigate('/login');
    } catch (error) {
      console.error('Error en el registro:', error);
      let errorMessage = 'Error al registrar. Por favor, intente de nuevo.';
      if (error instanceof Error) {
        errorMessage = `Error: ${error.message}`;
      }
      setErrors({ submit: errorMessage });
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center flex items-center justify-center">
          <UserPlus className="mr-2" /> Registro de Usuario
        </h3>
        <form onSubmit={handleSubmit}>
          <div className="mt-4">
            <div>
              <label className="block" htmlFor="nombreCompleto">Nombre Completo</label>
              <input
                type="text"
                placeholder="Nombre Completo"
                name="nombreCompleto"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={formData.nombreCompleto}
                onChange={handleChange}
                required
              />
              {errors.nombreCompleto && <p className="text-red-500 text-xs italic">{errors.nombreCompleto}</p>}
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="correoElectronico">Correo Electrónico</label>
              <input
                type="email"
                placeholder="correo@eia.edu.co"
                name="correoElectronico"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={formData.correoElectronico}
                onChange={handleChange}
                required
              />
              {errors.correoElectronico && <p className="text-red-500 text-xs italic">{errors.correoElectronico}</p>}
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="contrasena">Contraseña</label>
              <input
                type="password"
                placeholder="Contraseña"
                name="contrasena"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={formData.contrasena}
                onChange={handleChange}
                required
              />
              {errors.contrasena && <p className="text-red-500 text-xs italic">{errors.contrasena}</p>}
            </div>
            <div className="mt-4">
              <label className="block" htmlFor="numero">Número</label>
              <input
                type="number"
                placeholder="Número"
                name="numero"
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600"
                value={formData.numero}
                onChange={handleChange}
                required
              />
              {errors.numero && <p className="text-red-500 text-xs italic">{errors.numero}</p>}
            </div>
          </div>
          <div className="flex items-baseline justify-between mt-4">
            <button className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900" type="submit">Registrarse</button>
            <a href="/login" className="text-sm text-blue-600 hover:underline">¿Ya tienes cuenta? Inicia sesión</a>
          </div>
          {errors.submit && (
            <p className="text-red-500 text-xs italic mt-2 whitespace-pre-wrap">{errors.submit}</p>
          )}
        </form>
      </div>
    </div>
  );
};

export default Register;