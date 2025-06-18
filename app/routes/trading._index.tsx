import { useState } from "react";
import { useFetcher } from "@remix-run/react";
import { json, type MetaFunction } from "@remix-run/node";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardHeader, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";

export const meta: MetaFunction = () => {
  return [
    { title: "Social Intelligence Trading | MCP Powered" },
    { name: "description", content: "AI-powered trading signals using LunarCrush MCP and Google Gemini" },
  ];
};

export async function loader() {
  return json({ message: "Trading page loaded successfully" });
}

export default function TradingIndex() {
  const [searchTerm, setSearchTerm] = useState("");
  const fetcher = useFetcher();
  
  const loading = fetcher.state === "submitting";

  const handleSearch = () => {
    if (!searchTerm.trim()) return;
    
    const formData = new FormData();
    formData.append("symbol", searchTerm.trim());
    
    fetcher.submit(formData, {
      method: "post",
      action: "/api/analyze"
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-gray-900 dark:via-blue-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-4xl">
          <h1 className="text-4xl font-bold mb-4">
            Social Intelligence Trading
          </h1>
          <h2 className="text-lg text-gray-600 mb-8">
            AI-powered trading signals using <span className="text-blue-600 font-semibold">LunarCrush MCP</span> and <span className="text-green-600 font-semibold">Google Gemini</span>
          </h2>
          
          {/* Key Benefits */}
          <div className="grid md:grid-cols-3 gap-6 mb-12 text-left">
            <Card className="p-4">
              <CardHeader>
                <h3 className="text-lg font-semibold text-blue-600">🔄 Real-time MCP</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm">Direct protocol connection for instant data access with full transparency</p>
              </CardBody>
            </Card>
            
            <Card className="p-4">
              <CardHeader>
                <h3 className="text-lg font-semibold text-green-600">🤖 AI Analysis</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm">Google Gemini processes social patterns for BUY/SELL/HOLD recommendations</p>
              </CardBody>
            </Card>
            
            <Card className="p-4">
              <CardHeader>
                <h3 className="text-lg font-semibold text-purple-600">📊 Any Coin</h3>
              </CardHeader>
              <CardBody>
                <p className="text-sm">Search any cryptocurrency or stock, not limited to preset options</p>
              </CardBody>
            </Card>
          </div>

          {/* Search Interface */}
          <div className="max-w-2xl mx-auto">
            <Card className="p-8 backdrop-blur-sm bg-white/70 dark:bg-gray-800/70">
              <CardHeader>
                <h3 className="text-xl font-semibold mb-4">Get Trading Signals</h3>
              </CardHeader>
              <CardBody>
                <div className="flex gap-4 mb-6">
                  <Input
                    placeholder="Search any coin (e.g., BTC, ETH, DOGE)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    size="lg"
                    variant="bordered"
                    className="flex-1"
                  />
                  <Button
                    color="primary"
                    size="lg"
                    onPress={handleSearch}
                    isLoading={loading}
                    className="px-8"
                  >
                    Analyze
                  </Button>
                </div>
                
                {/* Quick Search Chips */}
                <div className="flex flex-wrap gap-2 justify-center">
                  <span className="text-sm text-gray-600 mr-2">Quick search:</span>
                  {["BTC", "ETH", "SOL", "ADA", "DOGE"].map((coin) => (
                    <Chip
                      key={coin}
                      variant="flat"
                      color="primary"
                      className="cursor-pointer hover:bg-primary-100"
                      onClick={() => setSearchTerm(coin)}
                    >
                      {coin}
                    </Chip>
                  ))}
                </div>
              </CardBody>
            </Card>

            {/* Loading State */}
            {loading && (
              <Card className="mt-6 p-6">
                <div className="text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p>Analyzing social sentiment and market data via MCP...</p>
                  <p className="text-sm text-gray-600 mt-2">
                    🔄 Connecting to LunarCrush MCP → 📊 Fetching data → 🤖 AI Analysis
                  </p>
                </div>
              </Card>
            )}

            {/* Results Display */}
            {fetcher.data && (
              <Card className="mt-6 p-6">
                <CardHeader>
                  <h3 className="text-xl font-semibold">Analysis Results</h3>
                </CardHeader>
                <CardBody>
                  <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto">
                    {JSON.stringify(fetcher.data, null, 2)}
                  </pre>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 px-6 border-t border-gray-200 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Powered by <span className="font-semibold">LunarCrush MCP</span> • <span className="font-semibold">Google Gemini</span> • <span className="font-semibold">Model Context Protocol</span>
        </p>
        <p className="text-xs text-gray-500 mt-2">
          Educational demonstration of MCP protocol benefits vs traditional API integration
        </p>
      </footer>
    </div>
  );
}
