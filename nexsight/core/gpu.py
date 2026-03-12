"""GPU monitoring using nvidia-ml-py3."""

from typing import List, Dict, Any, Optional
import pynvml


class GPUMonitor:
    """Monitor NVIDIA GPUs using NVML."""

    def __init__(self):
        """Initialize NVML and detect GPUs."""
        self._initialized = False
        try:
            pynvml.nvmlInit()
            self._initialized = True
            self.device_count = pynvml.nvmlDeviceGetCount()
        except pynvml.NVMLError as e:
            raise RuntimeError(f"Failed to initialize NVML: {e}. "
                             "Make sure NVIDIA drivers are installed.")

    def get_gpu_info(self, gpu_id: int) -> Dict[str, Any]:
        """Get detailed info for a specific GPU."""
        if not self._initialized:
            raise RuntimeError("NVML not initialized")
        if gpu_id >= self.device_count:
            raise ValueError(f"GPU {gpu_id} does not exist")

        handle = pynvml.nvmlDeviceGetHandleByIndex(gpu_id)

        # Basic info
        name = pynvml.nvmlDeviceGetName(handle)
        if isinstance(name, bytes):
            name = name.decode('utf-8')

        # Utilization
        try:
            utilization = pynvml.nvmlDeviceGetUtilizationRates(handle)
            gpu_util = utilization.gpu
            mem_util = utilization.memory
        except pynvml.NVMLError:
            gpu_util = 0
            mem_util = 0

        # Memory
        try:
            mem_info = pynvml.nvmlDeviceGetMemoryInfo(handle)
            memory_total = mem_info.total // (1024**3)  # GB
            memory_used = mem_info.used // (1024**3)
            memory_free = mem_info.free // (1024**3)
            memory_percent = (mem_info.used / mem_info.total) * 100
        except pynvml.NVMLError:
            memory_total = memory_used = memory_free = 0
            memory_percent = 0

        # Temperature
        try:
            temp = pynvml.nvmlDeviceGetTemperature(handle, pynvml.NVML_TEMPERATURE_GPU)
        except pynvml.NVMLError:
            temp = 0

        # Power
        try:
            power_draw = pynvml.nvmlDeviceGetPowerUsage(handle) / 1000  # W
        except pynvml.NVMLError:
            power_draw = 0

        try:
            power_limit = pynvml.nvmlDeviceGetPowerManagementLimit(handle) / 1000
        except pynvml.NVMLError:
            power_limit = 0

        # Driver info
        try:
            driver_version = pynvml.nvmlSystemGetDriverVersion()
            if isinstance(driver_version, bytes):
                driver_version = driver_version.decode('utf-8')
        except pynvml.NVMLError:
            driver_version = "unknown"

        return {
            "id": gpu_id,
            "name": name,
            "utilization": {
                "gpu": gpu_util,
                "memory": mem_util,
            },
            "memory": {
                "used_gb": round(memory_used, 2),
                "total_gb": round(memory_total, 2),
                "free_gb": round(memory_free, 2),
                "percent": round(memory_percent, 1),
            },
            "temperature": temp,
            "power": {
                "current_w": round(power_draw, 1),
                "limit_w": round(power_limit, 1),
            },
            "driver_version": driver_version,
        }

    def get_all_gpus(self) -> List[Dict[str, Any]]:
        """Get info for all GPUs."""
        return [self.get_gpu_info(i) for i in range(self.device_count)]

    def get_gpu_processes(self, gpu_id: int) -> List[Dict[str, Any]]:
        """Get processes running on a specific GPU."""
        if not self._initialized:
            raise RuntimeError("NVML not initialized")
        if gpu_id >= self.device_count:
            raise ValueError(f"GPU {gpu_id} does not exist")

        handle = pynvml.nvmlDeviceGetHandleByIndex(gpu_id)
        processes = []

        try:
            running_procs = pynvml.nvmlDeviceGetComputeRunningProcesses(handle)
        except pynvml.NVMLError:
            return processes

        for proc in running_procs:
            try:
                pid = proc.pid
                used_memory = proc.usedGpuMemory // (1024**3)  # GB

                # Get process name if possible
                import psutil
                try:
                    p = psutil.Process(pid)
                    name = p.name()
                    cmdline = " ".join(p.cmdline())
                    username = p.username()
                except (psutil.NoSuchProcess, psutil.AccessDenied):
                    name = "unknown"
                    cmdline = ""
                    username = "unknown"
            except ImportError:
                # psutil not available
                name = cmdline = username = "unknown"
                used_memory = proc.usedGpuMemory // (1024**3)

            processes.append({
                "pid": pid,
                "name": name,
                "command": cmdline,
                "user": username,
                "memory_gb": round(used_memory, 2),
            })

        return sorted(processes, key=lambda p: p["memory_gb"], reverse=True)

    def shutdown(self):
        """Clean up NVML."""
        if self._initialized:
            pynvml.nvmlShutdown()
            self._initialized = False

    def __enter__(self):
        return self

    def __exit__(self, *args):
        self.shutdown()


# Singleton instance
_monitor: Optional[GPUMonitor] = None


def get_monitor() -> GPUMonitor:
    """Get or create the GPU monitor singleton."""
    global _monitor
    if _monitor is None:
        _monitor = GPUMonitor()
    return _monitor
