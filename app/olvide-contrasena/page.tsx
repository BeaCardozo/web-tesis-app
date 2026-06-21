'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, KeyRound, Check, Circle } from 'lucide-react';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { Footer } from '../components/Footer';
import { authApi } from '../lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const passwordChecks = [
    { label: 'Al menos 8 caracteres', valid: password.length >= 8 },
    { label: 'Una letra mayúscula', valid: /[A-Z]/.test(password) },
    { label: 'Una letra minúscula', valid: /[a-z]/.test(password) },
    { label: 'Un número', valid: /[0-9]/.test(password) },
    { label: 'Un símbolo (!@#$...)', valid: /[^A-Za-z0-9]/.test(password) },
  ];
  const isPasswordStrong = passwordChecks.every((c) => c.valid);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await authApi.forgotPassword(email);
      setStep(2);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al enviar el correo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!/^[0-9]{6}$/.test(code)) {
      setError('El código debe ser de 6 dígitos numéricos');
      return;
    }
    if (!isPasswordStrong) {
      setError('La contraseña no cumple con los requisitos de seguridad');
      return;
    }
    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setIsLoading(true);
    try {
      await authApi.resetPassword(email, code, password);
      setSuccess('Contraseña restablecida exitosamente. Redirigiendo...');
      setTimeout(() => router.push('/login?reset=true'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'El código es inválido o ha expirado');
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
            <p className="text-gray-600 text-lg">
              {step === 1 ? 'Recuperar contraseña' : 'Restablecer contraseña'}
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl p-8">
            {/* PASO 1 — solicitar código */}
            {step === 1 && (
              <form onSubmit={handleRequestCode} className="space-y-6">
                <p className="text-sm text-gray-500 text-center">
                  Ingresa tu correo y te enviaremos un código de 6 dígitos para restablecer tu contraseña.
                </p>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                <Input
                  type="email"
                  placeholder="Correo electrónico"
                  icon={<Mail size={20} />}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />

                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Enviando...' : 'Enviar código'}
                </Button>
              </form>
            )}

            {/* PASO 2 — ingresar código y nueva contraseña */}
            {step === 2 && (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <p className="text-sm text-gray-500 text-center">
                  Revisa tu correo <span className="font-medium text-gray-700">{email}</span> e ingresa el código de 6 dígitos junto con tu nueva contraseña.
                </p>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm">
                    {success}
                  </div>
                )}

                <Input
                  type="text"
                  placeholder="Código de 6 dígitos"
                  icon={<KeyRound size={20} />}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  required
                />

                <div className="space-y-2">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Nueva contraseña"
                    icon={<Lock size={20} />}
                    rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    onRightIconClick={() => setShowPassword(!showPassword)}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  {password.length > 0 && (
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

                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirmar nueva contraseña"
                  icon={<Lock size={20} />}
                  rightIcon={showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  onRightIconClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />

                <Button type="submit" disabled={isLoading || !!success}>
                  {isLoading ? 'Restableciendo...' : 'Restablecer contraseña'}
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); setCode(''); setPassword(''); setConfirmPassword(''); }}
                  className="w-full text-sm text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ← Volver a ingresar el correo
                </button>
              </form>
            )}

            {/* Enlace de regreso al login */}
            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-sm text-accent-olive hover:text-accent-green-dark transition-colors"
              >
                Volver al inicio de sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
