import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  discordId: string;
  username: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading: userLoading, error } = useQuery({
    queryKey: ['/api/auth/user'],
    retry: false,
    enabled: true,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/auth/logout', {});
      return response.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.clear();
      window.location.href = '/';
    },
    onError: () => {
      // Force logout even if request fails
      queryClient.setQueryData(['/api/auth/user'], null);
      queryClient.clear();
      window.location.href = '/';
    },
  });

  useEffect(() => {
    setIsLoading(userLoading);
  }, [userLoading]);

  const login = async () => {
    try {
      // Redirect to Discord OAuth
      window.location.href = '/api/auth/discord';
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'Unable to connect to Discord. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Logout Error',
        description: 'There was an issue logging out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated: !!user && !error,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
