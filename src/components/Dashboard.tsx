import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import EliminarPublicacion from './EliminarPublicacion';
import EditarPublicacion from './EditarPublicacion';

interface Usuario {
  id: string;
  nombreCompleto: string;
  correoElectronico: string;
}

interface DatosPublicacion {
  numeroTotalPuestos: number;
  zona: string;
  descripcion: string;
}

interface Publicacion {
  id: string;
  numeroTotalPuestos: number;
  zona: string;
  descripcion: string;
  usuario?: Usuario;
}

const Dashboard = () => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [datosPublicacion, setDatosPublicacion] = useState<DatosPublicacion>({
    numeroTotalPuestos: 0,
    zona: '',
    descripcion: ''
  });
  const [publicaciones, setPublicaciones] = useState<Publicacion[]>([]);
  const navigate = useNavigate();

  // Efecto para manejar el token
  useEffect(() => {
    const tokenAlmacenado = localStorage.getItem('token');
    if (!tokenAlmacenado) {
      navigate('/login');
      return;
    }
    setToken(tokenAlmacenado);
  }, [navigate]);

  // Efecto para obtener el usuario
  useEffect(() => {
    const obtenerUsuario = async () => {
      if (!token) return;
      
      try {
        const usuarioAlmacenado = localStorage.getItem('usuario');
        if (usuarioAlmacenado) {
          setUsuario(JSON.parse(usuarioAlmacenado));
        } else {
          const respuesta = await fetch('http://localhost:3000/usuario', {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (!respuesta.ok) {
            throw new Error('Fallo al obtener los datos del usuario');
          }
          const datosUsuario = await respuesta.json();
          setUsuario(datosUsuario);
          localStorage.setItem('usuario', JSON.stringify(datosUsuario));
        }
      } catch (error) {
        console.error('Fallo al obtener los datos del usuario:', error);
        setError('Fallo al cargar los datos del usuario. Por favor, inicia sesión de nuevo.');
        cerrarSesion();
      } finally {
        setCargando(false);
      }
    };

    obtenerUsuario();
  }, [token, navigate]);

  // Efecto para obtener las publicaciones
  useEffect(() => {
    const obtenerPublicaciones = async () => {
      if (!token) return;

      try {
        const respuesta = await fetch('http://localhost:3000/publicacion', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!respuesta.ok) {
          throw new Error('Fallo al obtener las publicaciones');
        }
        const datosPublicaciones = await respuesta.json();
        setPublicaciones(datosPublicaciones);
      } catch (error) {
        console.error('Fallo al obtener las publicaciones:', error);
        setError('Fallo al cargar las publicaciones. Inténtalo de nuevo más tarde.');
      }
    };

    obtenerPublicaciones();
  }, [token]);

  const cerrarSesion = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    setToken(null);
    setUsuario(null);
    navigate('/login');
  };

  const manejarCambioEntrada = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDatosPublicacion(prevData => ({
      ...prevData,
      [name]: name === 'numeroTotalPuestos' ? parseInt(value, 10) || 0 : value
    }));
  };

  const manejarEnvio = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!token || !usuario) {
      setError('No estás autenticado. Por favor, inicia sesión.');
      return;
    }

    try {
      const respuesta = await fetch('http://localhost:3000/publicacion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ...datosPublicacion, usuarioId: usuario.id })
      });

      if (!respuesta.ok) {
        throw new Error('Fallo al crear la publicación');
      }

      const resultado = await respuesta.json();
      setDatosPublicacion({ numeroTotalPuestos: 0, zona: '', descripcion: '' });
      
      setPublicaciones(prevPublicaciones => [
        ...prevPublicaciones,
        { ...resultado, usuario }
      ]);
    } catch (error) {
      console.error('Error al crear la publicación:', error);
      setError('Error al crear la publicación. Inténtalo de nuevo.');
    }
  };

  const actualizarPublicacionEnLista = (publicacionActualizada: Publicacion) => {
    setPublicaciones(prevPublicaciones =>
      prevPublicaciones.map(pub =>
        pub.id === publicacionActualizada.id
          ? { ...publicacionActualizada, usuario: pub.usuario }
          : pub
      )
    );
  };

  if (cargando) {
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

  if (!usuario) {
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
          <h1 className="text-2xl font-bold mb-4">Bienvenido, {usuario.nombreCompleto}!</h1>
          <p className="mb-4">Correo Electrónico: {usuario.correoElectronico}</p>
          
          <form onSubmit={manejarEnvio} className="mb-6">
            <h2 className="text-xl font-semibold mb-3">Crear Publicación</h2>
            <div className="mb-4">
              <label htmlFor="numeroTotalPuestos" className="block text-sm font-medium text-gray-700">
                Número Total de Puestos
              </label>
              <input
                type="number"
                id="numeroTotalPuestos"
                name="numeroTotalPuestos"
                value={datosPublicacion.numeroTotalPuestos}
                onChange={manejarCambioEntrada}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="zona" className="block text-sm font-medium text-gray-700">
                Zona
              </label>
              <input
                type="text"
                id="zona"
                name="zona"
                value={datosPublicacion.zona}
                onChange={manejarCambioEntrada}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                value={datosPublicacion.descripcion}
                onChange={manejarCambioEntrada}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                required
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Crear Publicación
            </button>
          </form>

          <button
            onClick={cerrarSesion}
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
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="mb-1">
                        <strong>Usuario:</strong> {publicacion.usuario?.nombreCompleto || 'Usuario Desconocido'}
                      </p>
                      <p className="mb-1">
                        <strong>Número Total de Puestos:</strong> {publicacion.numeroTotalPuestos}
                      </p>
                      <p className="mb-1">
                        <strong>Zona:</strong> {publicacion.zona}
                      </p>
                      <p className="mb-1">
                        <strong>Descripción:</strong> {publicacion.descripcion}
                      </p>
                    </div>
                    <div className="flex space-x-2 ml-4">
                      <EditarPublicacion
                        publicacion={publicacion}
                        onActualizar={actualizarPublicacionEnLista}
                        token={token}
                      />
                      <EliminarPublicacion
                        idPublicacion={publicacion.id}
                        onEliminar={() => {
                          setPublicaciones(prevPublicaciones =>
                            prevPublicaciones.filter(p => p.id !== publicacion.id)
                          );
                        }}
                        token={token}
                      />
                    </div>
                  </div>
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