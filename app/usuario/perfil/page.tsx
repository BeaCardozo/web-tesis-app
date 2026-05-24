'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  LogOut,
  Edit3,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { authApi } from '../../lib/api';

export default function PerfilPage() {
  const { user, logout, refreshProfile } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setSaveError('');
    setIsSaving(true);
    try {
      await authApi.updateProfile({
        name: editName.trim(),
        email: editEmail.trim(),
      });
      await refreshProfile();
      setSaved(true);
      setIsEditing(false);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  useEffect(() => {
    if (user) {
      setEditName(user.name || '');
      setEditEmail(user.email || '');
    }
  }, [user]);

  const firstName = user?.name?.split(' ')[0] || 'Usuario';
  const userInitial = firstName.charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Hero / Banner de perfil */}
      <div className="relative bg-white rounded-2xl border border-gray-100 p-8 md:p-10 shadow-sm">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-button-green to-accent-green-dark flex items-center justify-center shadow-md shadow-button-green/20">
            <span className="text-3xl font-bold text-white">{userInitial}</span>
          </div>
          {/* Info del usuario */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 tracking-tight truncate">{user?.name}</h1>
            <p className="text-gray-500 text-sm mt-1 truncate">{user?.email}</p>
          </div>
          {/* Estado */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-100 bg-gray-50/60">
            <span className={`w-1.5 h-1.5 rounded-full ${
              user?.status === 'activo' ? 'bg-button-green' : 'bg-red-400'
            }`} />
            <span className="text-xs font-medium text-gray-600">
              {user?.status === 'activo' ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Informacion de la cuenta */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-button-green/10 rounded-lg flex items-center justify-center">
              <User size={16} className="text-button-green" />
            </div>
            <h3 className="font-semibold text-gray-800">Informacion de la cuenta</h3>
          </div>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-button-green bg-button-green/10 hover:bg-button-green/20 rounded-xl transition-colors font-medium"
            >
              <Edit3 size={16} />
              Editar
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(user?.name || '');
                  setEditEmail(user?.email || '');
                }}
                className="flex items-center gap-1 px-3 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <X size={16} />
                Cancelar
              </button>
              <button
                onClick={() => void handleSave()}
                disabled={isSaving}
                className="flex items-center gap-1 px-4 py-2 text-sm text-white bg-button-green hover:bg-accent-green-dark rounded-xl transition-colors font-medium shadow-md shadow-button-green/25 disabled:opacity-60"
              >
                <Check size={16} />
                {isSaving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          )}
        </div>

        {saveError && (
          <div className="mx-5 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">
            {saveError}
          </div>
        )}

        {saved && (
          <div className="mx-5 mt-4 p-3 bg-primary-lightest/50 border border-primary/30 rounded-xl text-sm text-accent-green-dark flex items-center gap-2">
            <div className="w-5 h-5 bg-button-green rounded-full flex items-center justify-center flex-shrink-0">
              <Check size={12} className="text-white" />
            </div>
            Cambios guardados exitosamente
          </div>
        )}

        <div className="p-5 space-y-1">
          {/* Nombre */}
          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
            <div className="w-10 h-10 bg-primary-lightest rounded-xl flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-button-green" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Nombre completo</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:ring-2 focus:ring-button-green/30 focus:border-button-green text-sm transition-all"
                />
              ) : (
                <p className="text-gray-800 font-medium">{user?.name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
            <div className="w-10 h-10 bg-primary-lightest rounded-xl flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-button-green" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Correo electronico</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:ring-2 focus:ring-button-green/30 focus:border-button-green text-sm transition-all"
                />
              ) : (
                <p className="text-gray-800 font-medium">{user?.email}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Cerrar sesion */}
      <div className="flex justify-center">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="inline-flex items-center justify-center gap-2 px-5 py-2 bg-red-500 text-white text-sm rounded-xl hover:bg-red-600 transition-colors font-medium shadow-sm"
        >
          <LogOut size={16} />
          Cerrar sesion
        </button>
      </div>

      <p className="text-center text-xs text-gray-400 pb-4">
        CaracasAhorra v1.0.0 - Universidad Metropolitana
      </p>

      {/* Modal confirmar logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center mx-auto mb-4">
              <LogOut size={22} className="text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2 text-center">Cerrar sesion</h3>
            <p className="text-gray-500 text-sm mb-5 text-center">
              Estas seguro de que deseas cerrar tu sesion?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors text-sm font-medium"
              >
                Cerrar sesion
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal acerca de */}
      {showAbout && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 overflow-hidden relative">
            <div className="flex items-center justify-between mb-4 mt-1">
              <h3 className="text-lg font-bold text-gray-800">Acerca de CaracasAhorra</h3>
              <button
                onClick={() => setShowAbout(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-center py-4">
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Aplicacion de comparación de precios de supermercados en Caracas.
              </p>
              <div className="text-xs text-gray-400 space-y-1 bg-gray-50 rounded-xl p-4">
                <p>Desarrollado por:</p>
                <p className="font-medium text-gray-600">Beatriz Cardozo y David Dávila</p>
                <p>Universidad Metropolitana - 2026</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
