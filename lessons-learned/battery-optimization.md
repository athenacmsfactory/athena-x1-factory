# Learned Lessons: Battery & Performance Optimization (Chromebook/Crostini)

## Context
User reported rapid battery drain on a Dell Latitude 5400 Chromebook running Debian 12 (Crostini).

## Findings
1. **Hardware Condition**: ChromeOS reported battery health < 50%. This is the primary bottleneck as the energy capacity is halved, making the system much more sensitive to CPU spikes.
2. **CPU intensive loops**: The `SiteController.js` in the Athena v9 project performed recursive directory scans of both `NATIVE` and `EXTERNAL` (Vault) directories on every `list()` call.
3. **Polling impact**: Frontend dashboards or background automation controllers (like `AutomationController`) that call `list()` frequently trigger these scans, leading to constant 90%+ CPU usage.
4. **Charging Constraints**: A charging current of ~0.879A was observed. On a power-intensive setup (multiple Node servers + Chrome in container), this might not be enough to keep up with the drain if the CPU is under heavy load.
5. **Node Memory Overheads**: Setting `NODE_OPTIONS="--max-old-space-size=13824"` allows individual Node processes to consume vast amounts of RAM, which can indirectly lead to higher power draw during garbage collection or heavy swapping (though 10GB RAM was free).

## Applied Fixes
- **Caching in SiteController**: Implemented a `CACHE_TTL` of 30 seconds for directory scans in `_scanDir`. This prevents redundant disk I/O and CPU spikes when multiple API calls or UI refreshes happen in quick succession.
- **Process Cleanup**: Restarting services (via `athstop`, `a3stop`) to break existing loops and clear hung processes.

## Recommendations for Future
- **Monitor inotify**: Use `find /proc/*/fd -name "inotify" | wc -l` to check for excessive file watchers which are notorious for battery drain in Linux.
- **Limit Headless Chrome**: Running full Chrome instances inside a Linux container on a Chromebook is extremely expensive; use only when necessary for automation or testing.
- **Power vs Performance**: Given the battery health, prefer lighter dev tools (like `sirv` instead of full `vite dev`) where possible for simple previews.
