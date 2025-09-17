import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { 
  Rocket, 
  Coins, 
  Sword, 
  Settings, 
  Star, 
  Users, 
  Globe, 
  Zap, 
  Play,
  Plus
} from 'lucide-react';

export default function Home() {
  const { data: globalStats } = useQuery({
    queryKey: ['/api/stats/global'],
  });

  const features = [
    {
      icon: Globe,
      title: 'Space Exploration',
      description: 'Discover procedurally generated galaxies with unique planets, resources, and alien encounters. Every exploration brings new possibilities.',
      highlights: ['Infinite procedural universe', 'Risk/reward mechanics', 'Rare artifact discoveries']
    },
    {
      icon: Coins,
      title: 'Dynamic Economy',
      description: 'Trade Nexium Crystals, rare materials, and ship upgrades in a player-driven marketplace with real supply and demand.',
      highlights: ['Player-driven market prices', 'Auction house system', 'Cross-server trading']
    },
    {
      icon: Sword,
      title: 'Epic Fleet Battles',
      description: 'Engage in strategic PvP combat, form alliances, and participate in massive fleet battles across Discord servers.',
      highlights: ['Strategic ship-to-ship combat', 'Alliance warfare system', 'Territory control mechanics']
    },
    {
      icon: Settings,
      title: 'Ship Customization',
      description: 'Upgrade and customize your starship with advanced modules, weapons, and cosmetic enhancements to match your playstyle.',
      highlights: ['Modular upgrade system', 'Cosmetic ship skins', 'AI companion personalities']
    },
    {
      icon: Star,
      title: 'Seasonal Events',
      description: 'Participate in limited-time galactic seasons with exclusive rewards, special challenges, and universe-changing events.',
      highlights: ['Quarterly galactic seasons', 'Exclusive seasonal rewards', 'Community-wide objectives']
    },
    {
      icon: Users,
      title: 'Community Features',
      description: 'Form space corporations, build alliances across Discord servers, and participate in cross-server diplomacy and warfare.',
      highlights: ['Cross-server alliances', 'Corporate management', 'Diplomacy systems']
    }
  ];

  return (
    <div className="relative overflow-hidden" data-testid="home-page">
      {/* Hero Section */}
      <div className="relative">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="floating-stars"></div>
          <div className="absolute top-10 left-10 w-1 h-1 bg-primary rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-1 h-1 bg-accent rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
          <div className="absolute top-40 left-1/4 w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
          <div className="absolute bottom-32 right-1/3 w-1 h-1 bg-accent rounded-full animate-pulse" style={{animationDelay: '1.5s'}}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight" data-testid="hero-title">
                  Explore the
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    {" "}Infinite Universe
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed" data-testid="hero-description">
                  Command your starship, discover new galaxies, and build a space empire in Discord's most advanced RPG bot. Trade Nexium Crystals, battle other players, and become a legendary explorer.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-transform" data-testid="add-to-discord-button">
                  <Plus className="w-5 h-5 mr-2" />
                  Add to Discord
                </Button>
                <Button variant="outline" className="glass-effect px-8 py-4 rounded-xl font-semibold text-lg border hover:border-primary transition-colors" data-testid="watch-demo-button">
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
              
              {/* Stats */}
              {globalStats && (
                <div className="grid grid-cols-3 gap-8 pt-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold stat-number" data-testid="stat-players">
                      {globalStats.totalPlayers.toLocaleString()}+
                    </div>
                    <div className="text-muted-foreground">Active Players</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold stat-number" data-testid="stat-sectors">
                      {globalStats.totalSectorsExplored.toLocaleString()}+
                    </div>
                    <div className="text-muted-foreground">Sectors Explored</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold stat-number" data-testid="stat-battles">
                      {globalStats.totalBattles.toLocaleString()}+
                    </div>
                    <div className="text-muted-foreground">Epic Battles</div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative">
              {/* Spaceship interface mockup */}
              <div className="relative glass-effect rounded-3xl p-8 glow-effect">
                <div className="aspect-square bg-gradient-to-br from-background to-muted rounded-2xl border border-border p-6">
                  <div className="h-full flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">Ship Status</div>
                        <div className="text-lg font-semibold text-primary">USS Explorer</div>
                      </div>
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                        <Rocket className="w-6 h-6 text-background" />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Energy</span>
                          <span className="text-primary">85/100</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{width: '85%'}}></div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Nexium Crystals</span>
                          <span className="text-accent">12,450</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Sectors Discovered</span>
                          <span className="text-foreground">847</span>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full btn-primary py-3 rounded-xl font-medium">
                      <Globe className="w-4 h-4 mr-2" />
                      Explore New Sector
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="features-title">
            Powerful Features for
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}Space Explorers
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Dive into a rich universe with advanced RPG mechanics, real-time economy, and social features that bring Discord communities together.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="feature-card glass-effect hover:border-primary transition-all" data-testid={`feature-card-${index}`}>
              <CardContent className="p-8">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-background" />
                </div>
                <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                <p className="text-muted-foreground mb-6">
                  {feature.description}
                </p>
                <div className="space-y-2">
                  {feature.highlights.map((highlight, i) => (
                    <div key={i} className="flex items-center text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mr-2"></div>
                      {highlight}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Dashboard Preview Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="dashboard-preview-title">
            Command Center
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}Dashboard
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Manage your space empire with our comprehensive web dashboard. Track your progress, manage your fleet, and monitor the galactic economy.
          </p>
        </div>
        
        {/* Dashboard Mockup */}
        <div className="glass-effect rounded-3xl p-8 glow-effect">
          <div className="grid lg:grid-cols-4 gap-6">
            {/* Quick Stats */}
            <div className="lg:col-span-1 space-y-4">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              
              <Card className="glass-effect border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Nexium Crystals</div>
                      <div className="text-2xl font-bold text-accent">45,230</div>
                    </div>
                    <Coins className="w-5 h-5 text-accent" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-effect border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Fleet Size</div>
                      <div className="text-2xl font-bold text-primary">12</div>
                    </div>
                    <Rocket className="w-5 h-5 text-primary" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="glass-effect border border-border">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm text-muted-foreground">Rank</div>
                      <div className="text-2xl font-bold text-foreground">#247</div>
                    </div>
                    <Star className="w-5 h-5 text-chart-4" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Market Overview */}
              <Card className="glass-effect border border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Market Overview</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Active Listings</div>
                      <div className="text-xl font-bold text-foreground">1,423</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Avg. Crystal Price</div>
                      <div className="text-xl font-bold text-primary">2.5M</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Trade Volume</div>
                      <div className="text-xl font-bold text-accent">89.2B</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Recent Activity */}
              <Card className="glass-effect border border-border">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Globe className="w-4 h-4 text-primary" />
                        <span>Discovered Sector Alpha-7</span>
                      </div>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Zap className="w-4 h-4 text-accent" />
                        <span>Traded 500 Crystals for Plasma Cannon</span>
                      </div>
                      <span className="text-sm text-muted-foreground">5 hours ago</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Sword className="w-4 h-4 text-destructive" />
                        <span>Won battle against StarHunter_92</span>
                      </div>
                      <span className="text-sm text-muted-foreground">1 day ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="glass-effect rounded-3xl p-12 text-center glow-effect">
          <h2 className="text-4xl lg:text-5xl font-bold mb-6" data-testid="cta-title">
            Ready to
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {" "}Explore the Stars?
            </span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of players in the ultimate space exploration RPG. Start your journey today and become a legendary space commander.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button className="btn-primary px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 transition-transform" data-testid="cta-add-discord">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419-.0190 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1568 2.4189Z"/>
              </svg>
              Add to Discord
            </Button>
            <Button variant="outline" className="glass-effect px-8 py-4 rounded-xl font-semibold text-lg border hover:border-primary transition-colors" data-testid="cta-docs">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6H20V8H4zM4 11H20V13H4zM4 16H20V18H4z"/>
              </svg>
              Read Documentation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
