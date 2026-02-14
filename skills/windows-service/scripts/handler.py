#!/usr/bin/env python3
"""
Windows Service Skill Handler

Protocol:
- Reads JSON from stdin: {"action": "...", "params": {...}}
- Writes JSON to stdout: result object or {"error": "..."}
"""

import sys
import json
import subprocess
from typing import Any, Dict, List, Optional

def run_powershell(command: str, timeout: int = 30) -> str:
    """Execute a PowerShell command and return stdout."""
    try:
        proc = subprocess.run(
            ["powershell.exe", "-NoProfile", "-NonInteractive", "-Command", command],
            capture_output=True,
            text=True,
            timeout=timeout,
        )
        if proc.returncode != 0:
            raise RuntimeError(f"PowerShell error: {proc.stderr.strip()}")
        return proc.stdout.strip()
    except subprocess.TimeoutExpired:
        raise RuntimeError("PowerShell command timed out")

def list_services(filter: Optional[str], properties: List[str]) -> Dict[str, Any]:
    ps = "Get-Service"
    if filter:
        ps += f" | Where-Object {{ $_.Name -like '*{filter}*' -or $_.DisplayName -like '*{filter}*' }}"
    if properties:
        ps += f" | Select-Object {','.join(properties)} | ConvertTo-Json"
    else:
        ps += " | ConvertTo-Json"
    output = run_powershell(ps)
    return {"services": json.loads(output)} if output else {"services": []}

def get_status(name: str) -> Dict[str, Any]:
    ps = f"Get-Service -Name {name} | Select-Object Name, Status, StartType | ConvertTo-Json"
    output = run_powershell(ps)
    if not output:
        raise ValueError(f"Service '{name}' not found")
    return json.loads(output)

def start_service(name: str) -> Dict[str, Any]:
    ps = f"Start-Service -Name {name} -PassThru | Select-Object Name, Status | ConvertTo-Json"
    output = run_powershell(ps)
    return json.loads(output) if output else {"status": "started"}

def stop_service(name: str, force: bool) -> Dict[str, Any]:
    cmd = f"Stop-Service -Name {name} -PassThru"
    if force:
        cmd += " -Force"
    cmd += " | Select-Object Name, Status | ConvertTo-Json"
    output = run_powershell(cmd)
    return json.loads(output) if output else {"status": "stopped"}

def restart_service(name: str) -> Dict[str, Any]:
    ps = f"Restart-Service -Name {name} -PassThru | Select-Object Name, Status | ConvertTo-Json"
    output = run_powershell(ps)
    return json.loads(output) if output else {"status": "restarted"}

def get_details(name: str) -> Dict[str, Any]:
    ps = f"""
    $svc = Get-WmiObject -Class Win32_Service -Filter "Name='{name}'"
    $svc | Select-Object Name, DisplayName, State, StartMode, ProcessId, ExitCode, ServiceSpecificExitCode | ConvertTo-Json
    """
    output = run_powershell(ps.strip())
    if not output:
        raise ValueError(f"Service '{name}' not found or WMI query failed")
    return json.loads(output)

def main():
    try:
        payload = json.loads(sys.stdin.read())
        action = payload.get("action")
        params = payload.get("params", {})

        if action == "list":
            result = list_services(params.get("filter"), params.get("properties", ["Name", "Status", "DisplayName", "StartType"]))
        elif action == "status":
            result = get_status(params["name"])
        elif action == "start":
            result = start_service(params["name"])
        elif action == "stop":
            result = stop_service(params["name"], params.get("force", False))
        elif action == "restart":
            result = restart_service(params["name"])
        elif action == "details":
            result = get_details(params["name"])
        else:
            result = {"error": f"Unknown action: {action}"}
            print(json.dumps(result))
            sys.exit(1)

        print(json.dumps(result, indent=2, ensure_ascii=False))

    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)

if __name__ == "__main__":
    main()