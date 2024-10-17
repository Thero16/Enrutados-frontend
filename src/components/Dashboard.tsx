import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';

interface User {
  nombreCompleto: string;
  correoElectronico: string;
}

interface PublicacionData {
  numeroTotalPuestos: number;
  zona: string;
}

interface Publicacion {
  id: string;
  numeroTotalPuestos: number;
  zona: string;
  usuario?: User;
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [publicacionData, setPublicacionData] = useState<PublicacionData>({
    numeroTotalPuestos: 0,
    zona: ''
  });
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        const storedUser = localStorage.getItem('usuario');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        } else {
          const response = await fetch('http://localhost:3000/usuario', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!response.ok) {
            throw new Error('Failed to fetch user data');
          }
          const userData = await response.json();
          setUser(userData);
          localStorage.setItem('usuario', JSON.stringify(userData));
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
        setError('Failed to load user data. Please try logging in again.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigate]);

  useEffect(() => {
    const fetchPublicaciones = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await fetch('http://localhost:3000/publicacion', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch publications');
        }
        const publicacionesData = await response.json();
        console.log('Publicaciones fetched:', publicacionesData);
        setPublicaciones(publicacionesData);
      } catch (error) {
        console.error('Failed to fetch publications:', error);
        setError('Failed to load publications. Please try again later.');
      }
    };

    fetchPublicaciones();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    navigate('/login');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPublicacionData(prevData => ({
      ...prevData,
      [name]: name === 'numeroTotalPuestos' ? parseInt(value, 10) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No estás autenticado. Por favor, inicia sesión.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/publicacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(publicacionData)
      });

      if (!response.ok) {
        throw new Error('Failed to create publication');
      }

      const result = await response.json();
      console.log('Publicación creada:', result);
      setPublicacionData({ numeroTotalPuestos: 0, zona: '' });
      
      setPublicaciones(prevPublicaciones => [
        ...prevPublicaciones,
        { ...result, usuario: user || undefined }
      ]);
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      setError('Error al crear la publicación. Por favor, intenta de nuevo.');
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-gray-100 flex items-center justify-center">Cargando...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
          <p>{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-2xl font-bold mb-4">No se pudo cargar la información del usuario</h1>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Volver al inicio de sesión
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md mb-8">
          <h1 className="text-2xl font-bold mb-4">Bienvenido, {user.nombreCompleto}!</h1>
          <p className="mb-4">Correo Electrónico: {user.correoElectronico}</p>
          
          <form onSubmit={handleSubmit} className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Crear Publicación</h2>
            <div className="mb-4">
              <label htmlFor="numeroTotalPuestos" className="block text-sm font-medium text-gray-700">Número Total de Puestos</label>
              <input
                type="number"
                id="numeroTotalPuestos"
                name="numeroTotalPuestos"
                value={publicacionData.numeroTotalPuestos}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="zona" className="block text-sm font-medium text-gray-700">Zona</label>
              <input
                type="text"
                id="zona"
                name="zona"
                value={publicacionData.zona}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <button type="submit" className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
              Crear Publicación
            </button>
          </form>

          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center justify-center"
          >
            <LogOut className="mr-2" /> Cerrar Sesión
          </button>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Publicaciones</h2>
          {publicaciones.length > 0 ? (
            <ul className="space-y-4">
              {publicaciones.map((publicacion) => (
                <li key={publicacion.id} className="border-b pb-4">
                  <p><strong>Usuario:</strong> {publicacion.usuario?.nombreCompleto || 'Usuario Desconocido'}</p>
                  <p><strong>Número Total de Puestos:</strong> {publicacion.numeroTotalPuestos}</p>
                  <p><strong>Zona:</strong> {publicacion.zona}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p>No hay publicaciones disponibles.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;