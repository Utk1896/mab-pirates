"""
MAB Pirates - Multi-Armed Bandit Tournament Platform
FastAPI backend
"""

import asyncio
import hashlib
import json
import os
import subprocess
import sys
import tempfile
import time
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional

from fastapi import (
    BackgroundTasks,
    Depends,
    FastAPI,
    File,
    Form,
    HTTPException,
    UploadFile,
)
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles

from database import (
    create_tables,
    get_db,
    get_leaderboard,
    get_run_details,
    get_student_runs,
    get_student_uploads,
    save_run_result,
    save_upload,
    get_all_uploads_for_mentor,
)
from environment import TreasureIslandEnv

app = FastAPI(title="MAB Pirates")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).parent.parent
_DATA_DIR = Path("/data") if Path("/data").exists() else BASE_DIR
UPLOADS_DIR = _DATA_DIR / "uploads"
FRONTEND_DIR = BASE_DIR / "frontend"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

MENTOR_PASSWORD = os.environ.get("MENTOR_PASSWORD", "pirates2025")
HORIZON = 1000  # number of pulls per run


@app.on_event("startup")
async def startup():
    create_tables()


# ── Static files & frontend ──────────────────────────────────────────────────

app.mount("/static", StaticFiles(directory=str(FRONTEND_DIR)), name="static")


@app.get("/", response_class=HTMLResponse)
async def root():
    return FileResponse(str(FRONTEND_DIR / "index.html"))


@app.get("/mentor", response_class=HTMLResponse)
async def mentor_page():
    return FileResponse(str(FRONTEND_DIR / "mentor.html"))


# ── Environment info ──────────────────────────────────────────────────────────

@app.get("/api/env-info")
async def env_info():
    env = TreasureIslandEnv()
    return {
        "n_chests": env.n_chests,
        "horizon": HORIZON,
        "chest_names": env.chest_names,
        "chest_descriptions": env.chest_descriptions,
    }


# ── Upload ────────────────────────────────────────────────────────────────────

@app.post("/api/upload")
async def upload_code(
    background_tasks: BackgroundTasks,
    student_name: str = Form(...),
    student_id: str = Form(...),
    quest: str = Form(...),
    file: UploadFile = File(...),
):
    if not file.filename.endswith(".py"):
        raise HTTPException(400, "Only .py files are accepted, mate!")

    content = await file.read()
    if len(content) > 500_000:
        raise HTTPException(400, "File too large (max 500KB)")

    file_hash = hashlib.sha256(content).hexdigest()[:12]
    upload_id = str(uuid.uuid4())
    safe_name = f"{student_id}_{upload_id[:8]}.py"
    save_path = UPLOADS_DIR / safe_name

    save_path.write_bytes(content)

    db_id = save_upload(
        upload_id=upload_id,
        student_name=student_name,
        student_id=student_id,
        filename=file.filename,
        filepath=str(save_path),
        file_hash=file_hash,
        quest=quest,
    )

    background_tasks.add_task(run_evaluation, upload_id, str(save_path), student_name, student_id)

    return {"upload_id": upload_id, "message": "Code uploaded! Evaluation starting..."}


# ── Run evaluation ────────────────────────────────────────────────────────────

async def run_evaluation(upload_id: str, filepath: str, student_name: str, student_id: str):
    """Run the student's bot against the environment in a subprocess."""
    runner_script = Path(__file__).parent / "runner.py"

    try:
        proc = await asyncio.create_subprocess_exec(
            sys.executable,
            str(runner_script),
            filepath,
            str(HORIZON),
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE,
        )
        try:
            stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=60)
        except asyncio.TimeoutError:
            proc.kill()
            save_run_result(
                run_id=str(uuid.uuid4()),
                upload_id=upload_id,
                student_name=student_name,
                student_id=student_id,
                total_gold=0,
                regret=None,
                choices=[],
                rewards=[],
                status="timeout",
                error_msg="Execution timed out after 60 seconds",
            )
            return

        if proc.returncode != 0:
            error = stderr.decode()[:2000]
            save_run_result(
                run_id=str(uuid.uuid4()),
                upload_id=upload_id,
                student_name=student_name,
                student_id=student_id,
                total_gold=0,
                regret=None,
                choices=[],
                rewards=[],
                status="error",
                error_msg=error,
            )
            return

        result = json.loads(stdout.decode())
        save_run_result(
            run_id=result["run_id"],
            upload_id=upload_id,
            student_name=student_name,
            student_id=student_id,
            total_gold=result["total_gold"],
            regret=result["regret"],
            choices=result["choices"],
            rewards=result["rewards"],
            status="success",
            error_msg=None,
        )

    except Exception as e:
        save_run_result(
            run_id=str(uuid.uuid4()),
            upload_id=upload_id,
            student_name=student_name,
            student_id=student_id,
            total_gold=0,
            regret=None,
            choices=[],
            rewards=[],
            status="error",
            error_msg=str(e),
        )


# ── Results & Leaderboard ─────────────────────────────────────────────────────

@app.get("/api/leaderboard")
async def leaderboard():
    return get_leaderboard()


@app.get("/api/student/{student_id}")
async def student_profile(student_id: str):
    runs = get_student_runs(student_id)
    uploads = get_student_uploads(student_id)
    return {"runs": runs, "uploads": uploads}


@app.get("/api/run/{run_id}")
async def run_detail(run_id: str):
    run = get_run_details(run_id)
    if not run:
        raise HTTPException(404, "Run not found")
    return run


@app.get("/api/upload-status/{upload_id}")
async def upload_status(upload_id: str):
    """Poll for run completion after upload."""
    from database import get_run_by_upload
    run = get_run_by_upload(upload_id)
    if not run:
        return {"status": "pending"}
    return run


# ── Mentor API ────────────────────────────────────────────────────────────────

@app.post("/api/mentor/login")
async def mentor_login(password: str = Form(...)):
    if password != MENTOR_PASSWORD:
        raise HTTPException(403, "Wrong password, landlubber!")
    return {"token": hashlib.sha256(password.encode()).hexdigest()}


@app.get("/api/mentor/uploads")
async def mentor_uploads(token: str):
    expected = hashlib.sha256(MENTOR_PASSWORD.encode()).hexdigest()
    if token != expected:
        raise HTTPException(403, "Unauthorized")
    return get_all_uploads_for_mentor()


@app.get("/api/mentor/code/{upload_id}")
async def mentor_view_code(upload_id: str, token: str):
    expected = hashlib.sha256(MENTOR_PASSWORD.encode()).hexdigest()
    if token != expected:
        raise HTTPException(403, "Unauthorized")
    from database import get_upload_by_id
    upload = get_upload_by_id(upload_id)
    if not upload:
        raise HTTPException(404, "Upload not found")
    code = Path(upload["filepath"]).read_text()
    return {"code": code, "upload": upload}


@app.get("/api/mentor/export")
async def mentor_export(token: str):
    expected = hashlib.sha256(MENTOR_PASSWORD.encode()).hexdigest()
    if token != expected:
        raise HTTPException(403, "Unauthorized")
        
    uploads = get_all_uploads_for_mentor()
    
    # Group by student
    students = {}
    for u in uploads:
        key = (u["student_name"], u["student_id"])
        if key not in students:
            students[key] = []
        
        # Load code
        try:
            code = Path(u["filepath"]).read_text()
        except Exception:
            code = "Error reading file"
            
        u["code"] = code
        students[key].append(u)
        
    # Sort students by name and id (case-insensitive)
    sorted_keys = sorted(students.keys(), key=lambda x: (x[0].lower(), x[1].lower()))
    
    export_data = []
    for k in sorted_keys:
        subs = students[k]
        # Sort submissions by time
        subs.sort(key=lambda x: x["uploaded_at"])
        export_data.append({
            "student_name": k[0],
            "student_id": k[1],
            "submission_count": len(subs),
            "submissions": [
                {
                    "filename": s["filename"],
                    "uploaded_at": s["uploaded_at"],
                    "status": s["status"],
                    "total_gold": s["total_gold"],
                    "regret": s["regret"],
                    "code": s["code"]
                } for s in subs
            ]
        })
        
    return export_data
