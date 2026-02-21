'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isRegister) {
        // Registration
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await response.json();

        if (data.success) {
          toast.success('Compte créé avec succès! Vous pouvez maintenant vous connecter.');
          setIsRegister(false);
        } else {
          toast.error(data.error || 'Erreur lors de la création du compte');
        }
      } else {
        // Login using custom API
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (data.success) {
          // Store token and user role in localStorage
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userRole', data.user.role);
          localStorage.setItem('userId', data.user.id);
          toast.success('Connexion réussie!');
          router.push('/');
        } else {
          toast.error(data.error || 'Email ou mot de passe incorrect');
        }
      }
    } catch (error) {
      toast.error('Erreur lors de la connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4 py-12">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1 bg-amber-100 border-b-2 border-amber-200">
            <CardTitle className="text-2xl font-bold text-center text-amber-900">
              {isRegister ? 'Créer un compte' : 'Connexion'}
            </CardTitle>
            <p className="text-center text-sm text-amber-700">
              {isRegister ? 'Inscrivez-vous pour accéder au système' : 'Accès au système de dons'}
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nom</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Votre nom"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required={isRegister}
                    disabled={isLoading}
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="•••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={isLoading}
              >
                {isLoading ? 'Traitement...' : (isRegister ? "S'inscrire" : 'Se connecter')}
              </Button>
              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-sm text-amber-700 hover:text-amber-900 underline"
                >
                  {isRegister 
                    ? 'Déjà un compte? Se connecter' 
                    : 'Pas encore de compte? Créer un compte'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
