"""FastAPI application — Legal Adviser prototype."""

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.claim_generator import generate_claim
from app.mock_1c import fetch_problems, get_problem_by_id, update_problem_status
from app.models import (
    PROBLEM_TYPE_LABELS,
    STATUS_LABELS,
    Claim,
    ProblemStatus,
)

app = FastAPI(title="LegalAdviser", version="0.1.0")
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# In-memory claim storage for the prototype
_claims: dict[str, Claim] = {}


def _ctx(request: Request, **extra):
    return {
        "request": request,
        "type_labels": PROBLEM_TYPE_LABELS,
        "status_labels": STATUS_LABELS,
        **extra,
    }


# ── Pages ────────────────────────────────────────────────────────────────

@app.get("/", response_class=HTMLResponse)
async def dashboard(request: Request):
    problems = fetch_problems()
    return templates.TemplateResponse("dashboard.html", _ctx(request, problems=problems))


@app.get("/problem/{problem_id}", response_class=HTMLResponse)
async def problem_detail(request: Request, problem_id: str):
    problem = get_problem_by_id(problem_id)
    if not problem:
        return HTMLResponse("Проблема не найдена", status_code=404)
    claim = _claims.get(problem_id)
    return templates.TemplateResponse(
        "problem.html", _ctx(request, problem=problem, claim=claim)
    )


@app.post("/problem/{problem_id}/generate-claim")
async def generate_claim_action(problem_id: str):
    problem = get_problem_by_id(problem_id)
    if not problem:
        return HTMLResponse("Проблема не найдена", status_code=404)
    claim = generate_claim(problem)
    _claims[problem_id] = claim
    update_problem_status(problem_id, ProblemStatus.CLAIM_GENERATED)
    return RedirectResponse(f"/problem/{problem_id}", status_code=303)


@app.post("/problem/{problem_id}/send-claim")
async def send_claim_action(problem_id: str):
    claim = _claims.get(problem_id)
    if not claim:
        return HTMLResponse("Претензия не найдена", status_code=404)
    # In production: send email / upload to EDO system
    claim.sent = True
    update_problem_status(problem_id, ProblemStatus.SENT)
    return RedirectResponse(f"/problem/{problem_id}", status_code=303)


@app.get("/settings", response_class=HTMLResponse)
async def settings_page(request: Request):
    return templates.TemplateResponse("settings.html", _ctx(request))
