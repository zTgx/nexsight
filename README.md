# NexSight

Real-time GPU Intelligence for AI Teams

## Installation

```bash
pip install nexsight
```

## Quick Start

### Web Dashboard

Start the web dashboard and open your browser:

```bash
nexsight run
# Open http://localhost:9988
```

With custom host/port:

```bash
nexsight start --host 0.0.0.0 --port 8080
```

### CLI Monitoring

Show GPU stats in terminal:

```bash
nexsight gpus
```

Watch mode (real-time updates, like `nvidia-smi -l 1`):

```bash
nexsight gpus --watch
```

Set refresh interval (default 1 second):

```bash
nexsight gpus --watch --interval 2
```

## Features

- **Real-time GPU monitoring** - utilization, memory, temperature, power
- **Process tracking** - see which processes are using each GPU
- **Web dashboard** - beautiful UI with live updates via WebSocket
- **CLI interface** - quick terminal output
- **Zero configuration** - works out of the box

## Requirements

- Python 3.8+
- NVIDIA GPU with drivers installed
- nvidia-ml-py3 (auto-installed)

## Links

- [PyPI](https://pypi.org/project/nexsight/)
- [GitHub](https://github.com/zTgx/nexsight)

## License

MIT
