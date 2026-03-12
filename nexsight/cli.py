"""NexSight CLI - Real-time GPU Intelligence."""

import typer
from rich.console import Console
from rich.table import Table

from .core.gpu import get_monitor
from .server.app import run_server

app = typer.Typer(
    name="nexsight",
    help="NexSight - Real-time GPU Intelligence for AI Teams",
    add_completion=False,
)
console = Console()


@app.command()
def run(
    host: str = typer.Option("127.0.0.1", "--host", "-h", help="Host to bind to"),
    port: int = typer.Option(9988, "--port", "-p", help="Port to bind to"),
):
    """Start the NexSight web dashboard."""
    console.print(f"\n[bold green]🚀 NexSight Dashboard[/bold green]")
    console.print(f"   [dim]Starting server on {host}:{port}...[/dim]\n")

    # Show URL
    if host == "0.0.0.0":
        url = f"http://localhost:{port}"
    else:
        url = f"http://{host}:{port}"

    console.print(f"   [cyan]Open:[/cyan] [bold white]{url}[/bold white]")
    console.print(f"   [dim]Press Ctrl+C to stop[/dim]\n")

    # Add a separator
    console.print("=" * 50, style="dim")

    run_server(host=host, port=port)


@app.command()
def start(
    host: str = typer.Option("0.0.0.0", "--host", "-h", help="Host to bind to"),
    port: int = typer.Option(9988, "--port", "-p", help="Port to bind to"),
):
    """Start the NexSight web dashboard (alias for 'run')."""
    run(host=host, port=port)


@app.command()
def gpus(
    watch: bool = typer.Option(False, "--watch", "-w", help="Watch mode - continuously update (like nvidia-smi -l 1)"),
    interval: float = typer.Option(1.0, "--interval", "-i", help="Refresh interval in seconds (for watch mode)"),
):
    """Show GPU stats in terminal."""
    import time
    import signal
    import sys

    monitor = get_monitor()

    def get_table():
        gpu_list = monitor.get_all_gpus()

        if not gpu_list:
            table = Table(title="🎮 GPU Status", show_header=True, header_style="bold red")
            table.add_column("Error", style="red")
            table.add_row("No GPUs detected")
            return table

        table = Table(title="🎮 GPU Status", show_header=True, header_style="bold magenta")
        table.add_column("ID", style="cyan", width=4)
        table.add_column("Name", style="green")
        table.add_column("Util", style="yellow")
        table.add_column("Memory", style="blue")
        table.add_column("Temp", style="red")
        table.add_column("Power", style="purple")

        for gpu in gpu_list:
            table.add_row(
                str(gpu["id"]),
                gpu["name"],
                f"{gpu['utilization']['gpu']}%",
                f"{gpu['memory']['used_gb']}/{gpu['memory']['total_gb']}GB "
                f"({gpu['memory']['percent']}%)",
                f"{gpu['temperature']}°C",
                f"{gpu['power']['current_w']}/{gpu['power']['limit_w']}W",
            )

        return table

    if not watch:
        # Single shot
        console.print(get_table())
    else:
        # Watch mode - similar to nvidia-smi -l 1
        console.print(f"🔄 Watch mode enabled (refresh every {interval}s)", style="dim")
        console.print("   Press Ctrl+C to exit\n", style="dim")

        def signal_handler(sig, frame):
            console.print("\n👋 Stopped", style="yellow")
            sys.exit(0)

        signal.signal(signal.SIGINT, signal_handler)

        try:
            while True:
                console.clear()
                console.print(get_table())
                time.sleep(interval)
        except KeyboardInterrupt:
            console.print("\n👋 Stopped", style="yellow")


@app.command()
def version():
    """Show version information."""
    from . import __version__
    console.print(f"NexSight version {__version__}", style="bold green")


if __name__ == "__main__":
    app()
