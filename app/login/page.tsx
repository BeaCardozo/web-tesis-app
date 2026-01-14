'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const result = await login(formData.email, formData.password);

    if (result.success) {
      // Obtener el usuario del localStorage para verificar el rol
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        // Redirigir según el rol
        if (user.role === 'Administrador') {
          router.push('/admin/dashboard');
        } else if (user.role === 'Analista') {
          router.push('/analista/dashboard');
        } else {
          router.push('/usuario');
        }
      }
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary-lighter via-primary-lightest to-accent-pastel-light flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">
            <span className="font-bold text-button-green">Caracas</span>
            <span className="font-bold text-accent-green-dark">Ahorra</span>
          </h1>
          <p className="text-gray-600 text-lg">Bienvenido de nuevo</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensaje de error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Email */}
            <Input
              type="email"
              placeholder="Correo electrónico"
              icon={<Mail size={20} />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            {/* Password */}
            <Input
              type={showPassword ? 'text' : 'password'}
              placeholder="Contraseña"
              icon={<Lock size={20} />}
              rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              onRightIconClick={() => setShowPassword(!showPassword)}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            {/* Recordarme */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={formData.remember}
                onChange={(e) => setFormData({ ...formData, remember: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-gray-300 text-accent-green focus:ring-accent-green"
              />
              <label htmlFor="remember" className="ml-3 text-gray-700">
                Recordarme
              </label>
            </div>

            {/* Botón de login */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          {/* Enlaces */}
          <div className="mt-6 text-center space-y-3">
            <Link
              href="/forgot-password"
              className="block text-accent-olive hover:text-accent-green-dark transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </Link>
            <p className="text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link
                href="/register"
                className="text-accent-olive font-medium hover:text-accent-green-dark transition-colors"
              >
                Regístrate aquí
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
