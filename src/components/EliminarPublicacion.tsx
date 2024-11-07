// EliminarPublicacion.tsx
import React, { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';

interface EliminarPublicacionProps {
  idPublicacion: string;
  onEliminar: (id: string) => void;
  token: string | null; // Recibimos el token como prop
}

const EliminarPublicacion: React.FC<EliminarPublicacionProps> = ({ 
  idPublicacion, 
  onEliminar,
  token 
}) => {
  const [eliminando, setEliminando] = useState(false);

  const manejarEliminacion = async () => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar esta publicación?')) {
      return;
    }

    if (!token) {
      console.error('No se encontró token de autenticación');
      alert('No hay sesión activa. Por favor, inicia sesión nuevamente.');
      return;
    }

    setEliminando(true);
    try {
      const respuesta = await fetch(`http://localhost:3000/publicacion/${idPublicacion}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!respuesta.ok) {
        throw new Error('Error al eliminar la publicación');
      }

      onEliminar(idPublicacion);
    } catch (error) {
      console.error('Error al eliminar la publicación:', error);
      alert('No se pudo eliminar la publicacion No se puede eliminar publicaciones de otros usuarios.');
    } finally {
      setEliminando(false);
    }
  };

  return (
    <button
      onClick={manejarEliminacion}
      disabled={eliminando || !token}
      className="inline-flex items-center gap-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {eliminando ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      Eliminar
    </button>
  );
};

export default EliminarPublicacion;