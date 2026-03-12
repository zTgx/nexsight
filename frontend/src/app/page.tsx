"use client";

import { useEffect, useState } from "react";
import { GPUCard } from "@/components/GPUCard";
import { gpuWs, GPUData } from "@/lib/websocket";

export default function Home() {
  const [gpus, setGpus] = useState<GPUData[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const unsubscribe = gpuWs.subscribe((data) => {
      setGpus(data);
      setConnected(true);
    });

    gpuWs.connect();

    return () => {
      unsubscribe();
      gpuWs.disconnect();
    };
  }, []);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 backdrop-blur-xl bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2m5-2H4m5 2h10M9 5h6a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">NexSight</h1>
              <p className="text-xs text-gray-400">Real-time GPU Intelligence</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
            <span className="text-sm text-gray-400">
              {connected ? 'Live' : 'Connecting...'}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {gpus.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-400 mb-4" />
            <p className="text-gray-400">Detecting GPUs...</p>
          </div>
        ) : (
          <>
            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="text-gray-400 text-sm">Total GPUs</div>
                <div className="text-2xl font-bold text-white">{gpus.length}</div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="text-gray-400 text-sm">Avg GPU Util</div>
                <div className="text-2xl font-bold text-green-400">
                  {Math.round(gpus.reduce((sum, g) => sum + g.utilization.gpu, 0) / gpus.length)}%
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="text-gray-400 text-sm">Total Memory</div>
                <div className="text-2xl font-bold text-blue-400">
                  {gpus.reduce((sum, g) => sum + g.memory.total_gb, 0)}GB
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl p-4 border border-white/10">
                <div className="text-gray-400 text-sm">Total Power</div>
                <div className="text-2xl font-bold text-purple-400">
                  {Math.round(gpus.reduce((sum, g) => sum + g.power.current_w, 0))}W
                </div>
              </div>
            </div>

            {/* GPU Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gpus.map((gpu) => (
                <GPUCard key={gpu.id} gpu={gpu} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-gray-400 text-sm">
          <p>NexSight v0.1.0 — Built for AI Engineers</p>
        </div>
      </footer>
    </main>
  );
}
