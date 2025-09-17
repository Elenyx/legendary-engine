import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { Link, Redirect } from 'wouter';
import { 
  Rocket, 
  Coins, 
  Star, 
  Zap, 
  Globe, 
  Sword, 
  Users,
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['/api/users/profile'],
    enabled: isAuthenticated,
  });

  const { data: ships, isLoading: shipsLoading } = useQuery({
    queryKey: ['/api/ships/my-ships'],
    enabled: isAuthenticated,
  });

  const { data: activeShip } = useQuery({
    queryKey: ['/api/ships/active'],
    enabled: isAuthenticated,
  });

  const { data: inventory } = useQuery({
    queryKey: ['/api/inventory'],
    enabled: isAuthenticated,
  });

  const { data: explorations } = useQuery({
    queryKey: ['/api/explorations/history'],
    enabled: isAuthenticated,
  });

  const { data: battles } = useQuery({
    queryKey: ['/api/battles/history'],
    enabled: isAuthenticated,
  });

  if (isLoading || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-effect rounded-xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your command center...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <h2 className="text-xl font-bold mb-4">Profile Not Found</h2>
            <p className="text-muted-foreground mb-4">Unable to load your profile data.</p>
            <Button asChild>
              <Link href="/login">Re-authenticate</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const winRate = battles && battles.length > 0 
    ? Math.round((battles.filter(b => b.battles.winner === profile.id).length / battles.length) * 100)
    : 0;

  return (
    <div className="min-h-screen py-8" data-testid="dashboard-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
              <Rocket className="w-8 h-8 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="dashboard-title">
                Welcome back, {user?.username}
              </h1>
              <p className="text-muted-foreground">
                Command your fleet and explore the infinite universe
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Nexium Crystals</p>
                  <p className="text-2xl font-bold text-accent" data-testid="crystals-amount">
                    {parseFloat(profile.nexiumCrystals).toLocaleString()}
                  </p>
                </div>
                <Coins className="w-8 h-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Energy</p>
                  <p className="text-2xl font-bold text-primary" data-testid="energy-amount">
                    {profile.energy}/{profile.maxEnergy}
                  </p>
                </div>
                <Zap className="w-8 h-8 text-primary" />
              </div>
              <Progress 
                value={(profile.energy / profile.maxEnergy) * 100} 
                className="mt-2" 
              />
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sectors Explored</p>
                  <p className="text-2xl font-bold text-foreground" data-testid="sectors-explored">
                    {profile.totalExplored.toLocaleString()}
                  </p>
                </div>
                <Globe className="w-8 h-8 text-chart-3" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-effect">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Battles Won</p>
                  <p className="text-2xl font-bold text-destructive" data-testid="battles-won">
                    {profile.totalBattlesWon.toLocaleString()}
                  </p>
                </div>
                <Sword className="w-8 h-8 text-destructive" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Ship */}
            {activeShip && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    Active Ship
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="active-ship-info">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold">{activeShip.name}</h3>
                      <p className="text-muted-foreground capitalize">{activeShip.shipType}</p>
                    </div>
                    <Badge variant="outline">Level {activeShip.level}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Hull</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(activeShip.hull / activeShip.maxHull) * 100} className="flex-1" />
                        <span className="text-sm">{activeShip.hull}/{activeShip.maxHull}</span>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Shields</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(activeShip.shields / activeShip.maxShields) * 100} className="flex-1" />
                        <span className="text-sm">{activeShip.shields}/{activeShip.maxShields}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Attack</p>
                      <p className="font-bold">{activeShip.attack}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Defense</p>
                      <p className="font-bold">{activeShip.defense}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Speed</p>
                      <p className="font-bold">{activeShip.speed}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Fuel</p>
                      <p className="font-bold">{activeShip.fuel}/{activeShip.maxFuel}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button className="btn-primary flex-1" asChild>
                      <Link href="/market">
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Upgrade Ship
                      </Link>
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Users className="w-4 h-4 mr-2" />
                      View Fleet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Recent Explorations */}
            {explorations && explorations.length > 0 && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Recent Explorations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4" data-testid="recent-explorations">
                    {explorations.slice(0, 5).map((exp, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                            <Globe className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium capitalize">{exp.exploration.actionType}</p>
                            <p className="text-sm text-muted-foreground">{exp.sector.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={exp.exploration.success ? "default" : "destructive"}>
                            {exp.exploration.success ? "Success" : "Failed"}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(exp.exploration.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <Button variant="outline" className="w-full mt-4" asChild>
                    <Link href="/dashboard/explorations">View All Explorations</Link>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Combat Stats */}
            {battles && battles.length > 0 && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sword className="w-5 h-5" />
                    Combat Stats
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4" data-testid="combat-stats">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-destructive">{winRate}%</p>
                    <p className="text-sm text-muted-foreground">Win Rate</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <p className="text-xl font-bold">{battles.length}</p>
                      <p className="text-xs text-muted-foreground">Total Battles</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold">{profile.totalBattlesWon}</p>
                      <p className="text-xs text-muted-foreground">Victories</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3" data-testid="quick-actions">
                <Button className="w-full btn-primary" asChild>
                  <Link href="/market">
                    <Coins className="w-4 h-4 mr-2" />
                    Visit Market
                  </Link>
                </Button>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/leaderboards">
                    <Star className="w-4 h-4 mr-2" />
                    View Rankings
                  </Link>
                </Button>
                <Button variant="outline" className="w-full">
                  <Calendar className="w-4 h-4 mr-2" />
                  Daily Missions
                </Button>
              </CardContent>
            </Card>

            {/* Inventory Summary */}
            {inventory && inventory.length > 0 && (
              <Card className="glass-effect">
                <CardHeader>
                  <CardTitle>Inventory Summary</CardTitle>
                </CardHeader>
                <CardContent data-testid="inventory-summary">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Items</span>
                      <span className="font-medium">
                        {inventory.reduce((sum, item) => sum + item.inventory.quantity, 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Unique Items</span>
                      <span className="font-medium">{inventory.length}</span>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    {inventory.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="truncate">{item.item.name}</span>
                        <span className="text-muted-foreground">×{item.inventory.quantity}</span>
                      </div>
                    ))}
                    {inventory.length > 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{inventory.length - 3} more items
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
