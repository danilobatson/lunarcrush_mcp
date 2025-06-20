import { SVGProps } from "react";

export type IconSvgProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

// Gemini AI Types
export interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

// Trading Analysis Types
export interface TradingAnalysis {
  symbol: string;
  recommendation: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasoning: string;
  social_sentiment: 'bullish' | 'bearish' | 'neutral';
  key_metrics: Record<string, string | number | unknown>;
  ai_analysis: {
    summary?: string;
    pros?: string[];
    cons?: string[];
    key_factors?: string[];
  } | string;
  timestamp: string;
  chart_data: Array<{ date: string; price: number }>;
  success: boolean;
  error?: string;
  processingTime?: number;
}

// Tool Call Types
export interface ToolCall {
  tool: string;
  args: Record<string, unknown>;
  reason: string;
}

// MCP Tool Types
export interface McpTool {
  name: string;
  inputSchema: {
    type: string;
    properties?: Record<string, unknown>;
    required?: string[];
  };
  title?: string;
  description?: string;
  outputSchema?: Record<string, unknown>;
  annotations?: Record<string, unknown>;
  [key: string]: unknown;
}

// Tool Result Types
export interface ToolResult {
  tool: string;
  args: Record<string, unknown>;
  reason: string;
  result?: unknown;
  error?: string;
}
