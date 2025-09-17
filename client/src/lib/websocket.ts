import { useEffect, useRef, useState } from 'react';

interface WebSocketMessage {
  type: string;
  data?: any;
  message?: string;
  error?: string;
}

interface UseWebSocketOptions {
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const {
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = 3000,
    maxReconnectAttempts = 5,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const connect = () => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setReconnectAttempts(0);
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessage?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        onDisconnect?.();
        
        // Attempt to reconnect if we haven't exceeded max attempts
        if (reconnectAttempts < maxReconnectAttempts) {
          reconnectTimeoutRef.current = setTimeout(() => {
            setReconnectAttempts(prev => prev + 1);
            connect();
          }, reconnectInterval);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  };

  const disconnect = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.close();
    }
    
    wsRef.current = null;
    setIsConnected(false);
  };

  const sendMessage = (message: WebSocketMessage) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  };

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    sendMessage,
    connect,
    disconnect,
    reconnectAttempts,
  };
}

// Market WebSocket Hook
export function useMarketWebSocket() {
  const [marketData, setMarketData] = useState<any[]>([]);
  const [priceUpdates, setPriceUpdates] = useState<Record<string, number>>({});

  const { isConnected, sendMessage } = useWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'market_update':
          setMarketData(message.data);
          break;
        case 'price_update':
          setPriceUpdates(prev => ({
            ...prev,
            [message.data.itemId]: message.data.price,
          }));
          break;
        case 'new_listing':
          setMarketData(prev => [message.data, ...prev]);
          break;
        case 'listing_sold':
          setMarketData(prev => prev.filter(item => item.id !== message.data.listingId));
          break;
      }
    },
    onConnect: () => {
      // Subscribe to market updates when connected
      sendMessage({ type: 'subscribe_to_market' });
    },
  });

  return {
    isConnected,
    marketData,
    priceUpdates,
    subscribeToItem: (itemId: string) => {
      sendMessage({ type: 'subscribe_to_item', data: { itemId } });
    },
  };
}

// Battle WebSocket Hook
export function useBattleWebSocket() {
  const [activeBattles, setActiveBattles] = useState<any[]>([]);
  const [battleResults, setBattleResults] = useState<any[]>([]);

  const { isConnected, sendMessage } = useWebSocket({
    onMessage: (message) => {
      switch (message.type) {
        case 'battle_started':
          setActiveBattles(prev => [message.data, ...prev]);
          break;
        case 'battle_completed':
          setBattleResults(prev => [message.data, ...prev.slice(0, 9)]); // Keep last 10
          setActiveBattles(prev => prev.filter(battle => battle.id !== message.data.id));
          break;
        case 'battle_update':
          setActiveBattles(prev => 
            prev.map(battle => 
              battle.id === message.data.id ? { ...battle, ...message.data } : battle
            )
          );
          break;
      }
    },
    onConnect: () => {
      sendMessage({ type: 'subscribe_to_battles' });
    },
  });

  return {
    isConnected,
    activeBattles,
    battleResults,
  };
}

// General purpose WebSocket service
export class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(): void {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.notifyListeners('connection', { status: 'connected' });
      };

      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.notifyListeners(message.type, message.data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.notifyListeners('connection', { status: 'disconnected' });
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.notifyListeners('error', { error });
      };

    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public send(type: string, data?: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, data }));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', { type, data });
    }
  }

  public subscribe(eventType: string, callback: (data: any) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    this.listeners.get(eventType)!.add(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  private notifyListeners(eventType: string, data: any): void {
    const listeners = this.listeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => callback(data));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectInterval);
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
