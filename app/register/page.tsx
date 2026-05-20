'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, User, Check, Circle } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { authApi } from '../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const passwordChecks = [
    { label: 'Al menos 8 caracteres', valid: formData.password.length >= 8 },
    { label: 'Una letra mayúscula', valid: /[A-Z]/.test(formData.password) },
    { label: 'Una letra minúscula', valid: /[a-z]/.test(formData.password) },
    { label: 'Un número', valid: /[0-9]/.test(formData.password) },
    { label: 'Un símbolo (!@#$...)', valid: /[^A-Za-z0-9]/.test(formData.password) },
  ];
  const isPasswordStrong = passwordChecks.every((c) => c.valid);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!isPasswordStrong) {
      setError('La contraseña no cumple con los requisitos de seguridad.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones');
      return;
    }

    setIsLoading(true);

    try {
      await authApi.register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      });

      // Registro exitoso, redirigir al login
      router.push('/login?registered=true');
    } catch (err) {
      const raw = err instanceof Error ? err.message : 'Error al registrar usuario';
      const message = /password is not strong enough/i.test(raw)
        ? 'La contraseña no cumple con los requisitos de seguridad.'
        : raw;
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-primary-lighter via-primary-lightest to-accent-pastel-light">
      <div className="flex-1 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo y título */}
        <div className="text-center mb-8">
          <h1 className="text-4xl mb-2">
            <span className="font-bold text-button-green">Caracas</span>
            <span className="font-bold text-accent-green-dark">Ahorra</span>
          </h1>
          <p className="text-gray-600 text-lg">Crear cuenta nueva</p>
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

            {/* Nombre + Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="text"
                placeholder="Nombre"
                icon={<User size={20} />}
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                type="text"
                placeholder="Apellido"
                icon={<User size={20} />}
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>

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
            <div className="space-y-2">
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
              {formData.password.length > 0 && (
                <ul className="px-2 pt-1 grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
                  {passwordChecks.map((c) => (
                    <li
                      key={c.label}
                      className={`flex items-center gap-2 transition-colors ${
                        c.valid ? 'text-accent-green-dark' : 'text-gray-400'
                      }`}
                    >
                      {c.valid ? <Check size={14} /> : <Circle size={14} />}
                      <span>{c.label}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Confirm Password */}
            <Input
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="Confirmar contraseña"
              icon={<Lock size={20} />}
              rightIcon={showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            {/* Términos y condiciones */}
            <div className="flex items-start">
              <input
                type="checkbox"
                id="terms"
                checked={formData.acceptTerms}
                onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                className="w-5 h-5 rounded border-2 border-gray-300 text-accent-green focus:ring-accent-green mt-0.5"
                required
              />
              <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                Acepto los{' '}
                <Link
                  href="/terms"
                  className="text-accent-olive font-medium hover:text-accent-green-dark transition-colors"
                >
                  términos y condiciones
                </Link>
              </label>
            </div>

            {/* Botón de registro */}
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </Button>
          </form>

          {/* Enlace a login */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link
                href="/login"
                className="text-accent-olive font-medium hover:text-accent-green-dark transition-colors"
              >
                Inicia sesión
              </Link>
            </p>
          </div>
        </div>
      </div>
      </div>
      <Footer />
    </div>
  );
}
