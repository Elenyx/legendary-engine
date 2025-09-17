import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Redirect } from 'wouter';
import { Rocket, Star, Globe, Zap } from 'lucide-react';

export default function Login() {
  const { isAuthenticated, isLoading, login } = useAuth();
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  const handleDiscordLogin = async () => {
    setIsLoginLoading(true);
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoginLoading(false);
    }
  };

  useEffect(() => {
    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      console.error('OAuth error:', error);
      // Clear the error from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (code) {
      // OAuth callback received, the backend should handle this
      console.log('OAuth callback received');
      // Clear the code from URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Connecting to the mothership...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <div className="min-h-screen relative overflow-hidden" data-testid="login-page">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="floating-stars"></div>
        <div className="absolute top-10 left-10 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
        <div className="absolute top-20 right-20 w-1 h-1 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
        <div className="absolute top-40 left-1/4 w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
        <div className="absolute bottom-32 right-1/3 w-1 h-1 bg-accent rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mx-auto glow-effect">
              <Rocket className="w-10 h-10 text-background" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent" data-testid="login-title">
                Join the Fleet
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Begin your journey across the infinite universe
              </p>
            </div>
          </div>

          {/* Login Card */}
          <Card className="glass-effect glow-effect border-primary/20">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Authentication Required</CardTitle>
              <p className="text-muted-foreground">
                Connect your Discord account to access your space commander profile
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Benefits */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Globe className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-sm">Explore infinite procedurally generated galaxies</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-4 h-4 text-accent" />
                  </div>
                  <span className="text-sm">Trade Nexium Crystals in the galactic marketplace</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-destructive/20 rounded-lg flex items-center justify-center">
                    <Star className="w-4 h-4 text-destructive" />
                  </div>
                  <span className="text-sm">Engage in epic fleet battles and form alliances</span>
                </div>
              </div>

              {/* Login Button */}
              <Button 
                className="w-full btn-primary py-6 text-lg font-semibold rounded-xl hover:scale-105 transition-transform"
                onClick={handleDiscordLogin}
                disabled={isLoginLoading}
                data-testid="discord-login-button"
              >
                {isLoginLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                    <span>Connecting...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
                    </svg>
                    <span>Continue with Discord</span>
                  </div>
                )}
              </Button>

              {/* Security Notice */}
              <div className="text-center space-y-2">
                <p className="text-xs text-muted-foreground">
                  By continuing, you agree to our Terms of Service and Privacy Policy
                </p>
                <p className="text-xs text-muted-foreground">
                  We only access your Discord username and avatar
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              New to Nexium RPG? Your adventure starts the moment you connect!
            </p>
            <p className="text-xs text-muted-foreground">
              Questions? Join our{' '}
              <a href="https://discord.gg/nexium" className="text-primary hover:underline">
                Discord community
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
