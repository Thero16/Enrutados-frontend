import React, { useState } from 'react';
import { Pencil, X } from 'lucide-react';

interface EditarPublicacionProps {
  publicacion: {
    id: string;
    numeroTotalPuestos: number;
    zona: string;
    descripcion: string;
  };
  onActualizar: (publicacionActualizada: any) => void;
}

const EditarPublicacion = ({ publicacion, onActualizar }: EditarPublicacionProps) => {
  const [editando, setEditando] = useState(false);
  const [datosPublicacion, setDatosPublicacion] = useState({
    numeroTotalPuestos: publicacion.numeroTotalPuestos,
    zona: publicacion.zona,
    descripcion: publicacion.descripcion
  });
  const [error, setError] = useState('');

  const manejarCambio = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDatosPublicacion(prevData => ({
      ...prevData,
      [name]: name === 'numeroTotalPuestos' ? parseInt(value, 10) : value
    }));
  };

  const manejarActualizacion = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('No estás autenticado');
      return;
    }

    try {
      const respuesta = await fetch(`http://localhost:3000/publicacion/${publicacion.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosPublicacion)
      });

      if (!respuesta.ok) {
        throw new Error('Error al actualizar la publicación');
      }

      const publicacionActualizada = await respuesta.json();
      onActualizar(publicacionActualizada);
      setEditando(false);
      setError('');
    } catch (error) {
      console.error('Error al actualizar:', error);
      setError('Error al actualizar la publicación, no se puede actualizar publicaciones de otros usuarios');
    }
  };

  if (!editando) {
    return (
      <button
        onClick={() => setEditando(true)}
        className="p-2 text-blue-500 hover:text-blue-700"
      >
        <Pencil size={20} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Editar Publicación</h3>
          <button
            onClick={() => setEditando(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Número Total de Puestos
            </label>
            <input
              type="number"
              name="numeroTotalPuestos"
              value={datosPublicacion.numeroTotalPuestos}
              onChange={manejarCambio}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Zona
            </label>
            <input
              type="text"
              name="zona"
              value={datosPublicacion.zona}
              onChange={manejarCambio}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <textarea
              name="descripcion"
              value={datosPublicacion.descripcion}
              onChange={manejarCambio}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
              rows={3}
            />
          </div>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <button
              onClick={() => setEditando(false)}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={manejarActualizacion}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditarPublicacion;