'use client';

import { useState, useEffect } from 'react';
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
  ShoppingCart,
  Sparkles,
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
      <div className="relative overflow-hidden bg-gradient-to-br from-button-green via-accent-green to-accent-green-dark rounded-3xl p-8 md:p-10 text-white shadow-xl shadow-button-green/15">
        {/* Elementos decorativos */}
        <div className="absolute top-0 right-0 w-56 h-56 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 right-1/4 w-40 h-40 bg-white/5 rounded-full translate-y-1/2" />
        <div className="absolute top-1/2 right-10 w-20 h-20 bg-white/8 rounded-full -translate-y-1/2" />
        <div className="absolute bottom-3 left-6 w-14 h-14 bg-white/5 rounded-full" />

        <div className="relative z-10 flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg shadow-black/10">
            <span className="text-3xl font-bold text-white">{userInitial}</span>
          </div>
          {/* Info del usuario */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-sm rounded-full text-xs font-medium text-white/90 mb-2 border border-white/10">
              <Sparkles size={12} />
              {user?.role || 'Usuario'}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{user?.name}</h1>
            <p className="text-white/60 text-sm mt-1">{user?.email}</p>
          </div>
          {/* Estado */}
          <div className="hidden sm:flex flex-col items-center gap-1">
            <div className={`w-3 h-3 rounded-full ${
              user?.status === 'activo' ? 'bg-primary animate-pulse' : 'bg-red-400'
            }`} />
            <span className="text-xs text-white/60">
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

          {/* Fecha de registro */}
          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
            <div className="w-10 h-10 bg-primary-lightest rounded-xl flex items-center justify-center flex-shrink-0">
              <Calendar size={18} className="text-button-green" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Miembro desde</label>
              <p className="text-gray-800 font-medium">{user?.createdAt || 'N/A'}</p>
            </div>
          </div>

          {/* Estado */}
          <div className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50/50 transition-colors">
            <div className="w-10 h-10 bg-primary-lightest rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield size={18} className="text-button-green" />
            </div>
            <div>
              <label className="text-xs text-gray-400 block mb-1">Estado de la cuenta</label>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                user?.status === 'activo'
                  ? 'bg-primary-lightest text-accent-green-dark'
                  : 'bg-red-100 text-red-700'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  user?.status === 'activo' ? 'bg-button-green' : 'bg-red-500'
                }`} />
                {user?.status === 'activo' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Soporte - grid visual */}
      <div>
        <h3 className="font-semibold text-gray-800 mb-3 px-1">Soporte</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 hover:border-button-green hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-primary-lightest rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <HelpCircle size={22} className="text-button-green" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-800 text-sm">Centro de ayuda</p>
              <p className="text-xs text-gray-400 mt-0.5">Preguntas frecuentes</p>
            </div>
          </button>

          <button
            onClick={() => setShowAbout(true)}
            className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 hover:border-button-green hover:shadow-md transition-all group"
          >
            <div className="w-12 h-12 bg-primary-lightest rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <Info size={22} className="text-button-green" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-800 text-sm">Acerca de</p>
              <p className="text-xs text-gray-400 mt-0.5">Sobre CaracasAhorra</p>
            </div>
          </button>

          <button className="flex flex-col items-center gap-3 p-6 bg-white rounded-2xl border border-gray-100 hover:border-button-green hover:shadow-md transition-all group">
            <div className="w-12 h-12 bg-primary-lightest rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
              <FileText size={22} className="text-button-green" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-800 text-sm">Privacidad</p>
              <p className="text-xs text-gray-400 mt-0.5">Terminos y politicas</p>
            </div>
          </button>
        </div>
      </div>

      {/* Cerrar sesion */}
      <button
        onClick={() => setShowLogoutConfirm(true)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3.5 bg-white border border-red-200 text-red-600 rounded-2xl hover:bg-red-50 transition-colors font-medium"
      >
        <LogOut size={18} />
        Cerrar sesion
      </button>

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
            {/* Decorative gradient top */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-button-green via-accent-green to-accent-teal" />

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
              <div className="w-16 h-16 bg-gradient-to-br from-button-green to-accent-green-dark rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-button-green/25">
                <ShoppingCart size={28} className="text-white" />
              </div>
              <h4 className="font-bold text-gray-800 mb-1">CaracasAhorra</h4>
              <p className="text-sm text-gray-500 mb-4">Version 1.0.0</p>
              <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                Aplicacion de comparacion de precios de supermercados en Caracas.
                Proyecto de tesis de la Universidad Metropolitana.
              </p>
              <div className="text-xs text-gray-400 space-y-1 bg-gray-50 rounded-xl p-4">
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
