'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError('Email ou senha inválidos');
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zamp-bg">
      <div className="w-full max-w-md p-8 rounded-xl border border-zamp-border bg-zamp-bg2">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 bg-zamp-accent rounded-lg flex items-center justify-center font-mono font-bold text-white">
            BK
          </div>
          <div>
            <h1 className="text-lg font-semibold text-zamp-text">Painel de Inadimplência ZAMP</h1>
            <p className="text-xs text-zamp-text3 font-mono">Corretivas + Preventivas · Gestão Completa</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-zamp-text3 uppercase tracking-wider mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-2 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono"
              placeholder="admin@zamp.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-mono text-zamp-text3 uppercase tracking-wider mb-1">Senha</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-zamp-bg3 border border-zamp-border2 rounded px-3 py-2 text-sm text-zamp-text outline-none focus:border-zamp-accent font-mono"
              placeholder="••••••"
              required
            />
          </div>

          {error && (
            <div className="bg-zamp-red-bg border border-zamp-red-border text-zamp-red text-xs p-3 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-zamp-accent hover:bg-orange-700 text-white font-medium py-2.5 rounded transition-colors disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <div className="mt-6 text-xs text-zamp-text3 space-y-1">
          <p>Perfis de teste:</p>
          <p className="font-mono">admin@zamp.com / admin123</p>
          <p className="font-mono">coord@zamp.com / admin123</p>
          <p className="font-mono">super@zamp.com / admin123</p>
          <p className="font-mono">leitor@zamp.com / admin123</p>
        </div>
      </div>
    </div>
  );
}
