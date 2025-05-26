import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Database, Trash2, BarChart3, Info } from 'lucide-react';
import { recipeService } from '@/services/recipeService';

interface ApiCall {
  type: string;
  params: any;
  timestamp: number;
  cached: boolean;
}

// API call tracking
class ApiTracker {
  private static calls: ApiCall[] = [];
  private static listeners: ((calls: ApiCall[]) => void)[] = [];
  
  static track(type: string, params: any, cached: boolean = false) {
    const call: ApiCall = {
      type,
      params,
      timestamp: Date.now(),
      cached
    };
    
    this.calls.unshift(call); // Add to beginning
    
    // Keep only last 50 calls
    if (this.calls.length > 50) {
      this.calls = this.calls.slice(0, 50);
    }
    
    // Notify listeners
    this.listeners.forEach(listener => listener([...this.calls]));
  }
  
  static subscribe(listener: (calls: ApiCall[]) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }
  
  static getCalls() {
    return [...this.calls];
  }
  
  static clear() {
    this.calls = [];
    this.listeners.forEach(listener => listener([]));
  }
  
  static getStats() {
    const now = Date.now();
    const lastHour = this.calls.filter(call => now - call.timestamp < 60 * 60 * 1000);
    const lastMinute = this.calls.filter(call => now - call.timestamp < 60 * 1000);
    
    return {
      total: this.calls.length,
      lastHour: lastHour.length,
      lastMinute: lastMinute.length,
      cached: this.calls.filter(call => call.cached).length,
      api: this.calls.filter(call => !call.cached).length
    };
  }
}

// Monkey patch console.log to track API calls
const originalConsoleLog = console.log;
console.log = (...args) => {
  originalConsoleLog(...args);
  
  if (args[0] && typeof args[0] === 'string') {
    if (args[0].includes('🌐 API CALL:')) {
      const type = args[0].replace('🌐 API CALL:', '').trim();
      ApiTracker.track(type, args[1] || {}, false);
    } else if (args[0].includes('✅ Cache HIT for')) {
      const type = args[0].replace('✅ Cache HIT for', '').split(':')[0].trim();
      ApiTracker.track(type, args[1] || {}, true);
    }
  }
};

export const ApiMonitor: React.FC = () => {
  const [calls, setCalls] = useState<ApiCall[]>([]);
  const [cacheStats, setCacheStats] = useState({ totalEntries: 0, totalSize: '0 KB' });
  const [isVisible, setIsVisible] = useState(false);

  // Subscribe to API calls
  useEffect(() => {
    const unsubscribe = ApiTracker.subscribe(setCalls);
    setCalls(ApiTracker.getCalls());
    
    return unsubscribe;
  }, []);

  // Update cache stats
  useEffect(() => {
    const updateStats = () => {
      const stats = (recipeService as any).constructor.getCacheStats();
      setCacheStats(stats);
    };
    
    updateStats();
    const interval = setInterval(updateStats, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const stats = ApiTracker.getStats();

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-white shadow-lg border-2"
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          API: {stats.api} | Cache: {stats.cached}
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-96 max-h-[70vh] bg-white rounded-lg shadow-2xl border-2 border-gray-200">
      <div className="p-4 border-b bg-gray-50 rounded-t-lg">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-lg flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            API Monitor
          </h3>
          <Button
            onClick={() => setIsVisible(false)}
            variant="ghost"
            size="sm"
          >
            ×
          </Button>
        </div>
      </div>

      <Tabs defaultValue="stats" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="stats">Stats</TabsTrigger>
          <TabsTrigger value="calls">Calls</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
        </TabsList>

        <TabsContent value="stats" className="p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">API Calls</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.api}</div>
                <div className="text-xs text-muted-foreground">Total requests</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cache Hits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.cached}</div>
                <div className="text-xs text-muted-foreground">Avoided calls</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Last Hour</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.lastHour}</div>
                <div className="text-xs text-muted-foreground">Total activity</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Cache Efficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.total > 0 ? Math.round((stats.cached / stats.total) * 100) : 0}%
                </div>
                <div className="text-xs text-muted-foreground">Hit rate</div>
              </CardContent>
            </Card>
          </div>

          {stats.api > 20 && (
            <div className="flex items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-yellow-800">High API Usage</div>
                <div className="text-yellow-700">Consider adding more caching or reducing requests</div>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="calls" className="p-4">
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {calls.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No API calls tracked yet
              </div>
            ) : (
              calls.map((call, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 rounded-lg border text-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium">{call.type}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={call.cached ? "secondary" : "destructive"}>
                        {call.cached ? "CACHE" : "API"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(call.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                  <pre className="text-xs text-muted-foreground overflow-hidden">
                    {JSON.stringify(call.params, null, 2).slice(0, 100)}
                    {JSON.stringify(call.params).length > 100 && '...'}
                  </pre>
                </div>
              ))
            )}
          </div>
          <div className="pt-4 border-t">
            <Button
              onClick={() => ApiTracker.clear()}
              variant="outline"
              size="sm"
              className="w-full"
            >
              Clear History
            </Button>
          </div>
        </TabsContent>

        <TabsContent value="cache" className="p-4">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{cacheStats.totalEntries}</div>
                  <div className="text-xs text-muted-foreground">Cached items</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{cacheStats.totalSize}</div>
                  <div className="text-xs text-muted-foreground">Storage used</div>
                </CardContent>
              </Card>
            </div>

            <div className="flex items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <Info className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0" />
              <div className="text-sm">
                <div className="font-medium text-blue-800">Cache Benefits</div>
                <div className="text-blue-700">
                  • 24-hour persistence<br/>
                  • Automatic cleanup<br/>
                  • Reduced API costs
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => {
                  (recipeService as any).constructor.clearCache();
                  setCacheStats({ totalEntries: 0, totalSize: '0 KB' });
                }}
                variant="destructive"
                size="sm"
                className="w-full"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear Cache
              </Button>
              
              <Button
                onClick={() => {
                  const stats = (recipeService as any).constructor.getCacheStats();
                  setCacheStats(stats);
                }}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Database className="w-4 h-4 mr-2" />
                Refresh Stats
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 