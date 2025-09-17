import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { 
  ShoppingCart, 
  TrendingUp, 
  Package, 
  Search,
  Coins,
  Clock,
  User,
  Filter
} from 'lucide-react';

interface MarketListing {
  marketListings: {
    id: string;
    quantity: number;
    pricePerUnit: string;
    totalPrice: string;
    createdAt: string;
    expiresAt: string;
  };
  item: {
    id: string;
    name: string;
    description: string;
    itemType: string;
    rarity: string;
  };
  seller: {
    username: string;
  };
}

export default function Market() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRarity, setSelectedRarity] = useState<string>('all');

  const { data: listings, isLoading } = useQuery({
    queryKey: ['/api/market/listings'],
  });

  const { data: myListings } = useQuery({
    queryKey: ['/api/market/my-listings'],
    enabled: isAuthenticated,
  });

  const { data: inventory } = useQuery({
    queryKey: ['/api/inventory'],
    enabled: isAuthenticated,
  });

  const buyMutation = useMutation({
    mutationFn: async (listingId: string) => {
      const response = await apiRequest('POST', '/api/market/buy', { listingId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Purchase Successful",
        description: "Item has been added to your inventory!",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/market/listings'] });
      queryClient.invalidateQueries({ queryKey: ['/api/inventory'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/profile'] });
    },
    onError: (error: any) => {
      toast({
        title: "Purchase Failed",
        description: error.message || "Unable to complete purchase",
        variant: "destructive",
      });
    },
  });

  const filteredListings = listings?.filter((listing: MarketListing) => {
    const matchesSearch = listing.item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         listing.item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRarity = selectedRarity === 'all' || listing.item.rarity === selectedRarity;
    return matchesSearch && matchesRarity;
  }) || [];

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'legendary': return 'bg-yellow-500';
      case 'epic': return 'bg-purple-500';
      case 'rare': return 'bg-blue-500';
      case 'uncommon': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen py-8" data-testid="market-page">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-xl flex items-center justify-center">
              <ShoppingCart className="w-8 h-8 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold" data-testid="market-title">
                Galactic Marketplace
              </h1>
              <p className="text-muted-foreground">
                Trade resources, ships, and artifacts with players across the universe
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <Card className="glass-effect mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedRarity}
                  onChange={(e) => setSelectedRarity(e.target.value)}
                  className="px-3 py-2 bg-input border border-border rounded-md text-sm"
                  data-testid="rarity-filter"
                >
                  <option value="all">All Rarities</option>
                  <option value="common">Common</option>
                  <option value="uncommon">Uncommon</option>
                  <option value="rare">Rare</option>
                  <option value="epic">Epic</option>
                  <option value="legendary">Legendary</option>
                </select>
                <Button variant="outline" size="icon">
                  <Filter className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="browse" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="browse" data-testid="browse-tab">Browse Market</TabsTrigger>
            <TabsTrigger value="sell" disabled={!isAuthenticated} data-testid="sell-tab">
              Sell Items
            </TabsTrigger>
            <TabsTrigger value="my-listings" disabled={!isAuthenticated} data-testid="my-listings-tab">
              My Listings
            </TabsTrigger>
          </TabsList>

          {/* Browse Market */}
          <TabsContent value="browse" className="space-y-6">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <Card key={i} className="glass-effect animate-pulse">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                        <div className="h-8 bg-muted rounded"></div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : filteredListings.length === 0 ? (
              <Card className="glass-effect">
                <CardContent className="p-12 text-center">
                  <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">No Items Found</h3>
                  <p className="text-muted-foreground">
                    {searchTerm || selectedRarity !== 'all' 
                      ? 'Try adjusting your search filters'
                      : 'The marketplace is currently empty. Be the first to list an item!'
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" data-testid="market-listings">
                {filteredListings.map((listing: MarketListing) => (
                  <Card key={listing.marketListings.id} className="glass-effect hover:glow-effect transition-all">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-lg">{listing.item.name}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {listing.item.description}
                            </p>
                          </div>
                          <Badge 
                            className={`${getRarityColor(listing.item.rarity)} text-white`}
                            data-testid={`rarity-${listing.item.rarity}`}
                          >
                            {listing.item.rarity}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Quantity:</span>
                            <span className="font-medium">{listing.marketListings.quantity}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Price per unit:</span>
                            <span className="font-medium flex items-center gap-1">
                              <Coins className="w-3 h-3 text-accent" />
                              {parseFloat(listing.marketListings.pricePerUnit).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total:</span>
                            <span className="font-bold text-lg flex items-center gap-1">
                              <Coins className="w-4 h-4 text-accent" />
                              {parseFloat(listing.marketListings.totalPrice).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            Seller: {listing.seller.username}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Listed: {new Date(listing.marketListings.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        <Button 
                          className="w-full btn-primary"
                          onClick={() => buyMutation.mutate(listing.marketListings.id)}
                          disabled={!isAuthenticated || buyMutation.isPending}
                          data-testid={`buy-button-${listing.marketListings.id}`}
                        >
                          {buyMutation.isPending ? (
                            <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <>
                              <ShoppingCart className="w-4 h-4 mr-2" />
                              Purchase
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Sell Items */}
          <TabsContent value="sell" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Sell Your Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!inventory || inventory.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Items to Sell</h3>
                    <p className="text-muted-foreground">
                      Explore the universe to find items you can sell on the marketplace!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="sellable-items">
                    <p className="text-muted-foreground">
                      Select items from your inventory to list on the marketplace:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {inventory.slice(0, 6).map((item: any, index: number) => (
                        <Card key={index} className="border border-border">
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-medium">{item.item.name}</h4>
                              <Badge variant="outline">×{item.inventory.quantity}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">
                              {item.item.description}
                            </p>
                            <Button size="sm" variant="outline" className="w-full">
                              List for Sale
                            </Button>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* My Listings */}
          <TabsContent value="my-listings" className="space-y-6">
            <Card className="glass-effect">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Your Active Listings
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!myListings || myListings.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-semibold mb-2">No Active Listings</h3>
                    <p className="text-muted-foreground">
                      You haven't listed any items for sale yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4" data-testid="my-active-listings">
                    {myListings.map((listing: any, index: number) => (
                      <Card key={index} className="border border-border">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{listing.item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                Quantity: {listing.marketListings.quantity}
                              </p>
                              <p className="text-sm">
                                Price: {parseFloat(listing.marketListings.totalPrice).toLocaleString()} crystals
                              </p>
                            </div>
                            <div className="text-right">
                              <Badge variant="outline">Active</Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                Listed {new Date(listing.marketListings.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
