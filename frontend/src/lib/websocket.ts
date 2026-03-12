export type GPUData = {
  id: number;
  name: string;
  utilization: {
    gpu: number;
    memory: number;
  };
  memory: {
    used_gb: number;
    total_gb: number;
    free_gb: number;
    percent: number;
  };
  temperature: number;
  power: {
    current_w: number;
    limit_w: number;
  };
  processes: Array<{
    pid: number;
    name: string;
    command: string;
    user: string;
    memory_gb: number;
  }>;
};

type WSMessage = {
  type: "gpu_update";
  data: GPUData[];
};

export class GPUWebSocket {
  private ws: WebSocket | null = null;
  private url: string;
  private listeners: Set<(data: GPUData[]) => void> = new Set();
  private reconnectDelay = 1000;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(url?: string) {
    // Auto-detect WebSocket URL based on environment
    if (url) {
      this.url = url;
    } else if (typeof window !== 'undefined') {
      // In browser: detect if in development mode
      const isDev = window.location.port === '3000'; // Next.js dev server

      if (isDev) {
        // Development: connect directly to Python backend
        this.url = 'ws://127.0.0.1:9988/ws';
      } else {
        // Production: use current host (served by Python backend)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.host;
        this.url = `${protocol}//${host}/ws`;
      }
    } else {
      // Default for SSR
      this.url = 'ws://localhost:9988/ws';
    }
  }

  connect() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      return;
    }

    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log(`WebSocket connected to ${this.url}`);
      this.reconnectDelay = 1000;
    };

    this.ws.onmessage = (event) => {
      try {
        const message: WSMessage = JSON.parse(event.data);
        if (message.type === "gpu_update") {
          this.listeners.forEach((listener) => listener(message.data));
        }
      } catch (e) {
        console.error("Failed to parse WebSocket message:", e);
      }
    };

    this.ws.onclose = () => {
      console.log("WebSocket disconnected, reconnecting...");
      this.scheduleReconnect();
    };

    this.ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, this.reconnectDelay);
    this.reconnectDelay = Math.min(this.reconnectDelay * 2, 30000);
  }

  disconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  subscribe(callback: (data: GPUData[]) => void) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
}

export const gpuWs = new GPUWebSocket();
