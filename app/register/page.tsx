'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    if (!formData.acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    console.log('Register attempt:', formData);
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
          <p className="text-gray-600 text-lg">Crear cuenta nueva</p>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-3xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nombre completo */}
            <Input
              type="text"
              placeholder="Nombre completo"
              icon={<User size={20} />}
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              required
            />

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
              <label htmlFor="terms" className="ml-3 text-gray-700">
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
            <Button type="submit">Registrarse</Button>
          </form>

          {/* Enlace a login */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
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
  );
}
