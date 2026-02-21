'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Trash2, UserPlus, Shield } from 'lucide-react';

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ email: '', password: '', name: '', role: 'user' });
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    // Get user role from token
    const token = localStorage.getItem('authToken');
    if (token) {
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(
            Buffer.from(parts[1], 'base64').toString()
          );
          setUserRole(payload.role);
        }
      } catch (e) {
        console.error('Error decoding token:', e);
        setUserRole(null);
      }
    }

    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.users);
      }
      setIsLoading(false);
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
      setIsLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Utilisateur créé avec succès!');
        setNewUser({ email: '', password: '', name: '', role: 'user' });
        await fetchUsers();
      } else {
        toast.error(data.error || 'Erreur lors de la création');
      }
    } catch (error) {
      toast.error('Erreur lors de la création');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      return;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Utilisateur supprimé avec succès');
        await fetchUsers();
      } else {
        toast.error(data.error || 'Erreur lors de la suppression');
      }
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  // Check if user is admin
  if (userRole !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Accès refusé</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-8">
            <Shield className="h-16 w-16 mx-auto mb-4 text-red-600" />
            <p className="text-lg mb-4">Vous devez être administrateur pour accéder à cette page.</p>
            <Button onClick={() => router.push('/')}>Retour</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-amber-900">Administration</h1>
          <Button variant="outline" onClick={() => router.push('/')}>
            Retour
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Users List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="bg-amber-100 border-b-2 border-amber-200">
                <CardTitle className="text-xl text-amber-900">Utilisateurs</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                {isLoading ? (
                  <p className="text-center py-8">Chargement...</p>
                ) : (
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {users.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-white border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-3">
                          <div className="bg-amber-100 p-2 rounded-full">
                            <UserPlus className="h-4 w-4 text-amber-700" />
                          </div>
                          <div>
                            <p className="font-semibold text-amber-900">{user.name || user.email}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            <p className="text-xs text-gray-500">Rôle: {user.role}</p>
                            <p className="text-xs text-gray-400">Créé: {new Date(user.createdAt).toLocaleDateString('fr-FR')}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {users.length === 0 && (
                      <p className="text-center text-gray-500 py-8">Aucun utilisateur</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Create User Form */}
          <div>
            <Card>
              <CardHeader className="bg-amber-100 border-b-2 border-amber-200">
                <CardTitle className="text-xl text-amber-900">Nouvel utilisateur</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <form onSubmit={handleCreateUser} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Nom complet"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="email@exemple.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mot de passe</label>
                    <Input
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Mot de passe"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rôle</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="user">Utilisateur</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    disabled={isCreating}
                  >
                    {isCreating ? 'Création...' : 'Créer l\'utilisateur'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
