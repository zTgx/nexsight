"use client";

import { GPUData } from "@/lib/websocket";

interface GPUCardProps {
  gpu: GPUData;
}

export function GPUCard({ gpu }: GPUCardProps) {
  const {
    id,
    name,
    utilization,
    memory,
    temperature,
    power,
    processes,
  } = gpu;

  const getTempColor = (temp: number) => {
    if (temp < 60) return "text-green-400";
    if (temp < 80) return "text-yellow-400";
    return "text-red-400";
  };

  const getUtilColor = (util: number) => {
    if (util < 50) return "bg-green-500";
    if (util < 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="bg-gray-900/80 backdrop-blur-xl rounded-2xl p-6 border border-white/20 hover:border-green-400/50 transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
            <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2m5-2H4m5 2h10M9 5h6a2 2 0 012 2v10a2 2 0 01-2 2H9a2 2 0 01-2-2V7a2 2 0 012-2z" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-lg">{name}</div>
            <div className="text-sm text-gray-400">GPU #{id}</div>
          </div>
        </div>
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
      </div>

      {/* Stats Grid */}
      <div className="space-y-4">
        {/* GPU & Memory Utilization */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-400 text-sm mb-1">GPU Util</div>
            <div className="flex items-center space-x-2">
              <span className="font-mono font-bold text-2xl text-green-400">
                {utilization.gpu}%
              </span>
            </div>
            <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full ${getUtilColor(utilization.gpu)}`}
                style={{ width: `${utilization.gpu}%` }}
              />
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Memory</div>
            <div className="font-mono font-bold text-2xl text-blue-400">
              {memory.used_gb}/{memory.total_gb}GB
            </div>
            <div className="mt-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500"
                style={{ width: `${memory.percent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Temp & Power */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-gray-400 text-sm mb-1">Temperature</div>
            <div className={`font-mono font-bold text-xl ${getTempColor(temperature)}`}>
              {temperature}°C
            </div>
          </div>
          <div>
            <div className="text-gray-400 text-sm mb-1">Power</div>
            <div className="font-mono font-bold text-xl text-purple-400">
              {power.current_w}/{power.limit_w}W
            </div>
          </div>
        </div>

        {/* Processes */}
        {processes.length > 0 && (
          <div className="border-t border-gray-700 pt-3 mt-3">
            <div className="text-gray-400 text-sm mb-2">Processes</div>
            <div className="space-y-1">
              {processes.slice(0, 3).map((proc) => (
                <div key={proc.pid} className="flex justify-between text-sm">
                  <span className="text-gray-300 truncate flex-1">
                    {proc.name} ({proc.pid})
                  </span>
                  <span className="font-mono text-green-400 ml-2">
                    {proc.memory_gb}GB
                  </span>
                </div>
              ))}
              {processes.length > 3 && (
                <div className="text-gray-500 text-xs">
                  +{processes.length - 3} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
