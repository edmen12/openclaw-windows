#!/usr/bin/env python3
"""
Windows Task Scheduler Skill Handler
"""

import sys
import json
import subprocess
from typing import Any, Dict, List, Optional

def run_powershell(command: str, timeout: int = 30) -> str:
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

def list_tasks(name: Optional[str] = None) -> Dict[str, Any]:
    ps = "Get-ScheduledTask"
    if name:
        ps += f" | Where-Object {{ $_.TaskName -like '*{name}*' -or $_.TaskPath -like '*{name}*' }}"
    ps += " | Select-Object TaskName, TaskPath, State, LastTaskResult | ConvertTo-Json"
    output = run_powershell(ps)
    return {"tasks": json.loads(output)} if output else {"tasks": []}

def create_task(params: Dict[str, Any]) -> Dict[str, Any]:
    # Minimal example: New-ScheduledTaskAction/Trigger/Principal + Register-ScheduledTask
    # Expects: name, program, arguments?, schedule?, startWhenAvailable?, runLevel?
    name = params["name"]
    program = params["program"]
    arguments = params.get("arguments", "")
    schedule = params.get("schedule", "AtLogOn")  # e.g., "AtLogOn", "Daily", "Weekly"
    run_level = params.get("runLevel", "LIMITED")  # LIMITED or HIGHEST

    # Escape quotes
    program_esc = program.replace('"', '`"')
    arguments_esc = arguments.replace('"', '`"')

    ps = f"""
    $action = New-ScheduledTaskAction -Execute "{program_esc}" -Argument "{arguments_esc}"
    $trigger = New-ScheduledTaskTrigger -{schedule}
    $principal = New-ScheduledTaskPrincipal -UserId "SYSTEM" -LogonType ServiceAccount -RunLevel {run_level}
    Register-ScheduledTask -TaskName "{name}" -Action $action -Trigger $trigger -Principal $principal -Force | ConvertTo-Json
    """
    output = run_powershell(ps.strip())
    return json.loads(output) if output else {"status": "created"}

def delete_task(name: str) -> Dict[str, Any]:
    ps = f"Unregister-ScheduledTask -TaskName {name} -Confirm:$false -WhatIf:$false"
    run_powershell(ps)  # returns nothing on success
    return {"status": "deleted"}

def run_task(name: str) -> Dict[str, Any]:
    ps = f"Start-ScheduledTask -TaskName {name} | ConvertTo-Json"
    output = run_powershell(ps)
    return json.loads(output) if output else {"status": "started"}

def task_info(name: str) -> Dict[str, Any]:
    ps = f"Get-ScheduledTaskInfo -TaskName {name} | ConvertTo-Json"
    output = run_powershell(ps)
    if not output:
        raise ValueError(f"Task '{name}' not found")
    return json.loads(output)

def main():
    try:
        payload = json.loads(sys.stdin.read())
        action = payload.get("action")
        params = payload.get("params", {})

        if action == "list":
            result = list_tasks(params.get("name"))
        elif action == "create":
            result = create_task(params)
        elif action == "delete":
            result = delete_task(params["name"])
        elif action == "run":
            result = run_task(params["name"])
        elif action == "info":
            result = task_info(params["name"])
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