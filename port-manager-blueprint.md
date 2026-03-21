# 🏗️ Port Manager Blueprint (Documentation Only)

This file contains the "blueprint" of the central Port Manager used on this machine. It is NOT functional here; it serves as documentation for rebuilding the system if this project is moved to another environment.

## 🛠️ Infrastructure Component
- **Central Path:** `~/INFRA/port-manager/`
- **Registry:** `registry.json` (JSON DB of all ports)
- **Logic:** `scripts/manage_ports.py` (Python CLI)

---

## 📜 Port Manager Logic (`manage_ports.py`)

```python
#!/usr/bin/env python3
import json
import os
import sys
import socket
import time
from pathlib import Path
from typing import Optional, Dict, Any

REGISTRY_PATH = Path.home() / "INFRA/port-manager/registry.json"
LOCK_PATH = REGISTRY_PATH.with_suffix(".lock")

def acquire_lock(timeout=5):
    start_time = time.time()
    while time.time() - start_time < timeout:
        try:
            # Atomic creation of a lock file
            fd = os.open(LOCK_PATH, os.O_CREAT | os.O_EXCL | os.O_RDWR)
            os.close(fd)
            return True
        except FileExistsError:
            time.sleep(0.1)
    return False

def release_lock():
    try:
        os.remove(LOCK_PATH)
    except FileNotFoundError:
        pass

def load_registry() -> Dict[str, Any]:
    if not REGISTRY_PATH.exists():
        return {"services": {}, "next_available": 8002}
    with open(REGISTRY_PATH, "r") as f:
        return json.load(f)

def save_registry(registry: Dict[str, Any]):
    # Ensure directory exists
    REGISTRY_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(REGISTRY_PATH, "w") as f:
        json.dump(registry, f, indent=2)

def is_port_in_use(port: int) -> bool:
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(0.3)
        return s.connect_ex(("127.0.0.1", port)) == 0

def find_next_free(registry: Dict[str, Any], start: Optional[int] = None) -> int:
    start = start or registry.get("next_available", 8002)
    used_ports = {v["port"] for v in registry["services"].values()}
    port = start
    while port in used_ports or is_port_in_use(port):
        port += 1
    return port

def get_port(service: str, project: str, description: str = "", preferred_port: Optional[int] = None):
    if not acquire_lock():
        print("Error: Could not acquire lock on registry file.")
        sys.exit(1)
    
    try:
        registry = load_registry()
        services = registry["services"]
        
        if service in services:
            existing = services[service]
            print(f"Success: Service '{service}' already has port {existing['port']}.")
            print(f"PORT={existing['port']}")
            return

        if preferred_port:
            used_ports = {v["port"] for v in services.values()}
            if preferred_port in used_ports:
                owner = next(k for k, v in services.items() if v["port"] == preferred_port)
                print(f"Error: Port {preferred_port} is already assigned to '{owner}'.")
                sys.exit(1)
            if is_port_in_use(preferred_port):
                print(f"Error: Port {preferred_port} is already in use by another process.")
                sys.exit(1)
            assigned_port = preferred_port
        else:
            assigned_port = find_next_free(registry)
            
        services[service] = {
            "port": assigned_port,
            "project": project,
            "description": description
        }
        registry["next_available"] = find_next_free(registry, assigned_port + 1)
        save_registry(registry)
        print(f"Success: Assigned port {assigned_port} to service '{service}'.")
        print(f"PORT={assigned_port}")
    finally:
        release_lock()

def release_port(service: str):
    if not acquire_lock():
        print("Error: Could not acquire lock on registry file.")
        sys.exit(1)
    
    try:
        registry = load_registry()
        if service not in registry["services"]:
            print(f"Error: Service '{service}' not found in registry.")
            sys.exit(1)
        
        removed = registry["services"].pop(service)
        save_registry(registry)
        print(f"Success: Released port {removed['port']} for service '{service}'.")
    finally:
        release_lock()

def list_ports():
    registry = load_registry()
    services = registry["services"]
    if not services:
        print("No services registered.")
        return
    
    print(f"{'Service':<25} {'Port':<6} {'Project':<15} {'Description'}")
    print("-" * 70)
    for name, info in sorted(services.items(), key=lambda x: x[1]['port']):
        in_use = " (IN USE)" if is_port_in_use(info['port']) else ""
        print(f"{name:<25} {info['port']:<6} {info['project']:<15} {info.get('description', '')}{in_use}")

def main():
    if len(sys.argv) < 2:
        print("Usage: manage_ports.py <get|release|list> [args]")
        sys.exit(1)
    
    command = sys.argv[1]
    
    if command == "get":
        if len(sys.argv) < 4:
            print("Usage: manage_ports.py get <service> <project> [description] [preferred_port]")
            sys.exit(1)
        service = sys.argv[2]
        project = sys.argv[3]
        description = sys.argv[4] if len(sys.argv) > 4 else ""
        preferred_port = int(sys.argv[5]) if len(sys.argv) > 5 else None
        get_port(service, project, description, preferred_port)
    
    elif command == "release":
        if len(sys.argv) < 3:
            print("Usage: manage_ports.py release <service>")
            sys.exit(1)
        service = sys.argv[2]
        release_port(service)
    
    elif command == "list":
        list_ports()
    
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

if __name__ == "__main__":
    main()
```

---

## 📜 Skill Definition (`SKILL.md`)

```markdown
---
name: port-registry
description: Centraal beheer van poorttoewijzingen voor het KDC ecosysteem via ~/INFRA/port-manager.
---

# Port Manager

This skill manages a central `registry.json` file in `~/INFRA/port-manager/` to coordinate port assignments across different projects and services.

## Workflows

### 1. Assign a Port
Run: `python3 ~/INFRA/port-manager/scripts/manage_ports.py get <service-name> <project-name> [description] [preferred-port]`

### 2. Release a Port
Run: `python3 ~/INFRA/port-manager/scripts/manage_ports.py release <service-name>`

### 3. List Ports
Run: `python3 ~/INFRA/port-manager/scripts/manage_ports.py list`

## Central Registry
The source of truth is `~/INFRA/port-manager/registry.json`.
```

## 🚀 Bootstrap Script

If this project is deployed on a new system, run this to re-establish the central Port Manager:

```bash
# 1. Create Infrastructure Directory
mkdir -p ~/INFRA/port-manager/scripts

# 2. Rehydrate manage_ports.py
# (Copy the python code from the "Port Manager Logic" section above into this file)
# vi ~/INFRA/port-manager/scripts/manage_ports.py
chmod +x ~/INFRA/port-manager/scripts/manage_ports.py

# 3. Create initial Registry if missing
if [ ! -f ~/INFRA/port-manager/registry.json ]; then
  echo '{"services": {}, "next_available": 8002}' > ~/INFRA/port-manager/registry.json
fi

# 4. Register the Skill in Gemini CLI
mkdir -p ~/.gemini/skills/port-registry
# (Copy the SKILL.md content from above into ~/.gemini/skills/port-registry/SKILL.md)
```
