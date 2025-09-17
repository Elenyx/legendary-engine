import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Star, 
  Coins, 
  Rocket, 
  Sword, 
  Globe,
  Crown,
  Medal,
  Target,
  Users
} from 'lucide-react';

interface LeaderboardPlayer {
  id: string;
  username: string;
  avatar?: string;
  nexiumCrystals: string;
  rank: number;
  totalExplored: number;
  totalBattlesWon: number;
  joinedAt: string;
}

export default function Leaderboards() {
  const [selectedCategory, setSelectedCategory] = useState<'crystals' | 'exploration' | 'combat'>('crystals');

  const { data: topPlayers, isLoading } = useQuery({
    queryKey: ['/api/users/leaderboard', { limit: 50 }],
  });

  const { data: globalStats } = useQuery({
    queryKey: ['/api/stats/global'],
  });

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold">{position}</span>;
    }
  };

  const getRankBadgeColor = (position: number) => {
    if (position <= 3) return 'bg-gradient-to-r from-primary to-accent';
    if (position <= 10) return 'bg-primary';
    if (position <= 50) return 'bg-accent';
    return 'bg-muted';
  };

  const sortedPlayers = topPlayers ? [...topPlayers].sort((a: LeaderboardPlayer, b: LeaderboardPlayer) => {
    switch (selectedCategory) {
      case 'crystals':
        return parseFloat(b.nexiumCrystals) - parseFloat(a.nexiumCrystals);
      case 'exploration':
        return b.totalExplored - a.totalExplored;
      case 'combat':
        return b.totalBattlesWon - a.totalBattlesWon;
      default:
        return 0;
    }
  }) : [];

  return (
    <div className="min-h-screen py-8" data-testid="leaderboards-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
              <Trophy className="w-8 h-8 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="leaderboards-title">
                Galactic Leaderboards
              </h1>
              <p className="text-muted-foreground">
                Compete with the best explorers across the universe
              </p>
            </div>
          </div>
        </div>

        {/* Global Stats */}
        {globalStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="glass-effect">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold stat-number" data-testid="total-players">
                  {globalStats.totalPlayers?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Total Players</p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-6 text-center">
                <Globe className="w-8 h-8 text-accent mx-auto mb-2" />
                <p className="text-2xl font-bold stat-number" data-testid="total-sectors">
                  {globalStats.totalSectorsExplored?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Sectors Explored</p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-6 text-center">
                <Sword className="w-8 h-8 text-destructive mx-auto mb-2" />
                <p className="text-2xl font-bold stat-number" data-testid="total-battles">
                  {globalStats.totalBattles?.toLocaleString() || '0'}
                </p>
                <p className="text-sm text-muted-foreground">Epic Battles</p>
              </CardContent>
            </Card>

            <Card className="glass-effect">
              <CardContent className="p-6 text-center">
                <Coins className="w-8 h-8 text-chart-4 mx-auto mb-2" />
                <p className="text-2xl font-bold stat-number" data-testid="total-crystals">
                  {parseFloat(globalStats.totalCrystalsInCirculation || '0').toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Crystals in Circulation</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leaderboard Tabs */}
        <Tabs defaultValue="crystals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 glass-effect">
            <TabsTrigger 
              value="crystals" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid="crystals-tab"
            >
              <Coins className="w-4 h-4 mr-2" />
              Richest Explorers
            </TabsTrigger>
            <TabsTrigger 
              value="exploration" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid="exploration-tab"
            >
              <Globe className="w-4 h-4 mr-2" />
              Top Explorers
            </TabsTrigger>
            <TabsTrigger 
              value="combat" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              data-testid="combat-tab"
            >
              <Sword className="w-4 h-4 mr-2" />
              Combat Champions
            </TabsTrigger>
          </TabsList>

          {/* Crystals Leaderboard */}
          <TabsContent value="crystals" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="w-5 h-5 text-accent" />
                  Richest Space Explorers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-1/4"></div>
                        </div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : sortedPlayers.length === 0 ? (
                  <div className="text-center py-12">
                    <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Rankings Available</h3>
                    <p className="text-muted-foreground">
                      Be the first to start exploring and claim the top spot!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="crystals-leaderboard">
                    {sortedPlayers.map((player: LeaderboardPlayer, index: number) => (
                      <div 
                        key={player.id} 
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-muted/50 ${
                          index < 3 ? 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20' : 'bg-muted/20'
                        }`}
                        data-testid={`player-rank-${index + 1}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankBadgeColor(index + 1)}`}>
                            {getRankIcon(index + 1)}
                          </div>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={player.avatar} alt={player.username} />
                            <AvatarFallback>{player.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{player.username}</h3>
                            {index < 3 && (
                              <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                                Elite
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Member since {new Date(player.joinedAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 text-lg font-bold text-accent">
                            <Coins className="w-5 h-5" />
                            {parseFloat(player.nexiumCrystals).toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Nexium Crystals</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Exploration Leaderboard */}
          <TabsContent value="exploration" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  Master Explorers
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-1/4"></div>
                        </div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="exploration-leaderboard">
                    {sortedPlayers.slice(0, 50).map((player: LeaderboardPlayer, index: number) => (
                      <div 
                        key={player.id} 
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-muted/50 ${
                          index < 3 ? 'bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20' : 'bg-muted/20'
                        }`}
                        data-testid={`explorer-rank-${index + 1}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankBadgeColor(index + 1)}`}>
                            {getRankIcon(index + 1)}
                          </div>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={player.avatar} alt={player.username} />
                            <AvatarFallback>{player.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{player.username}</h3>
                            {index < 3 && (
                              <Badge className="bg-gradient-to-r from-primary to-accent text-white">
                                Pioneer
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Exploring since {new Date(player.joinedAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 text-lg font-bold text-primary">
                            <Target className="w-5 h-5" />
                            {player.totalExplored.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Sectors Explored</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Combat Leaderboard */}
          <TabsContent value="combat" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sword className="w-5 h-5 text-destructive" />
                  Combat Legends
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(10)].map((_, i) => (
                      <div key={i} className="flex items-center gap-4 p-4 animate-pulse">
                        <div className="w-12 h-12 bg-muted rounded-full"></div>
                        <div className="flex-1 space-y-2">
                          <div className="h-4 bg-muted rounded w-1/3"></div>
                          <div className="h-3 bg-muted rounded w-1/4"></div>
                        </div>
                        <div className="h-6 bg-muted rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="combat-leaderboard">
                    {sortedPlayers.slice(0, 50).map((player: LeaderboardPlayer, index: number) => (
                      <div 
                        key={player.id} 
                        className={`flex items-center gap-4 p-4 rounded-lg transition-all hover:bg-muted/50 ${
                          index < 3 ? 'bg-gradient-to-r from-destructive/10 to-orange-500/10 border border-destructive/20' : 'bg-muted/20'
                        }`}
                        data-testid={`warrior-rank-${index + 1}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getRankBadgeColor(index + 1)}`}>
                            {getRankIcon(index + 1)}
                          </div>
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={player.avatar} alt={player.username} />
                            <AvatarFallback>{player.username.charAt(0).toUpperCase()}</AvatarFallback>
                          </Avatar>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg">{player.username}</h3>
                            {index < 3 && (
                              <Badge className="bg-gradient-to-r from-destructive to-orange-500 text-white">
                                Warlord
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Fighting since {new Date(player.joinedAt).toLocaleDateString()}
                          </p>
                        </div>

                        <div className="text-right">
                          <div className="flex items-center gap-2 text-lg font-bold text-destructive">
                            <Sword className="w-5 h-5" />
                            {player.totalBattlesWon.toLocaleString()}
                          </div>
                          <p className="text-sm text-muted-foreground">Victories</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
