'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  User,
  Mail,
  Calendar,
  Shield,
  LogOut,
  Edit3,
  Check,
  X,
  HelpCircle,
  Info,
  FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function PerfilPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editEmail, setEditEmail] = useState(user?.email || '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Mock save
    setSaved(true);
    setIsEditing(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
        <p className="text-gray-500 mt-1">Gestiona tu informacion personal</p>
      </div>

      {/* Tarjeta de perfil */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {/* Banner */}
        <div className="h-28 bg-gradient-to-r from-button-green to-accent-teal relative">
          <div className="absolute -bottom-10 left-6">
            <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center border-4 border-white">
              <span className="text-2xl font-bold text-button-green">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
        <div className="pt-14 px-6 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-800">{user?.name}</h2>
              <p className="text-gray-500 text-sm">{user?.email}</p>
            </div>
            <span className="px-3 py-1 bg-primary/20 text-accent-green-dark text-sm font-medium rounded-full">
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* Informacion de la cuenta */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Informacion de la cuenta</h3>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm text-button-green hover:bg-green-50 rounded-lg transition-colors"
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
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={16} />
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1 px-3 py-1.5 text-sm text-white bg-button-green hover:bg-accent-green-dark rounded-lg transition-colors"
              >
                <Check size={16} />
                Guardar
              </button>
            </div>
          )}
        </div>

        {saved && (
          <div className="mx-5 mt-4 p-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 flex items-center gap-2">
            <Check size={16} />
            Cambios guardados exitosamente
          </div>
        )}

        <div className="p-5 space-y-4">
          {/* Nombre */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <User size={18} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Nombre completo</label>
              {isEditing ? (
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:ring-2 focus:ring-button-green/30 focus:border-button-green text-sm"
                />
              ) : (
                <p className="text-gray-800 font-medium">{user?.name}</p>
              )}
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-gray-500" />
            </div>
            <div className="flex-1">
              <label className="text-xs text-gray-400 block mb-1">Correo electronico</label>
              {isEditing ? (
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-50 border border-gray-200 text-gray-800 outline-none focus:ring-2 focus:ring-button-green/30 focus:border-button-green text-sm"
                />
              ) : (
                <p className="text-gray-800 font-medium">{user?.email}</p>
              )}
            </div>
          </div>

          {/* Fecha de registro */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-gray-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Miembro desde</label>
              <p className="text-gray-800 font-medium">{user?.createdAt || 'N/A'}</p>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-gray-500" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Estado de la cuenta</label>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                user?.status === 'activo'
                  ? 'bg-green-100 text-green-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  user?.status === 'activo' ? 'bg-green-500' : 'bg-red-500'
                }`} />
                {user?.status === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Soporte */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">Soporte</h3>
        </div>
        <div className="divide-y divide-gray-50">
          <button className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <HelpCircle size={18} className="text-blue-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">Centro de ayuda</p>
              <p className="text-xs text-gray-400">Preguntas frecuentes y soporte</p>
            </div>
          </button>
          <button
            onClick={() => setShowAbout(true)}
            className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left"
          >
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <Info size={18} className="text-green-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">Acerca de CaracasAhorra</p>
              <p className="text-xs text-gray-400">Informacion sobre la aplicacion</p>
            </div>
          </button>
          <button className="w-full flex items-center gap-4 p-5 hover:bg-gray-50 transition-colors text-left">
            <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
              <FileText size={18} className="text-purple-500" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-800 text-sm">Privacidad y terminos</p>
              <p className="text-xs text-gray-400">Politicas de uso y privacidad</p>
            </div>
          </button>
        </div>
      </div>

      {/* Cerrar sesion */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium"
      >
        <LogOut size={18} />
        Cerrar sesion
      </button>

      <p className="text-center text-xs text-gray-400 pb-4">
        CaracasAhorra v1.0.0 - Universidad Metropolitana
      </p>

      {/* Modal confirmar logout */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-2">Cerrar sesion</h3>
            <p className="text-gray-500 text-sm mb-4">
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Acerca de CaracasAhorra</h3>
              <button
                onClick={() => setShowAbout(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-accent-green-dark">CA</span>
              </div>
              <h4 className="font-bold text-gray-800 mb-1">CaracasAhorra</h4>
              <p className="text-sm text-gray-500 mb-4">Version 1.0.0</p>
              <p className="text-sm text-gray-600 mb-4">
                Aplicacion de comparacion de precios de supermercados en Caracas.
                Proyecto de tesis de la Universidad Metropolitana.
              </p>
              <div className="text-xs text-gray-400 space-y-1">
                <p>Desarrollado por:</p>
                <p className="font-medium text-gray-600">Beatriz Cardozo & David Davila</p>
                <p>Universidad Metropolitana - 2025</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
