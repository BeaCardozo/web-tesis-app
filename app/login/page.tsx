'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    remember: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', formData);
    // Aquí se conectará con el backend cuando esté listo
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary-light to-accent-pastel flex items-center justify-center p-4">
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
            <Button type="submit">Iniciar Sesión</Button>
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
