from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.services.agent_orchestrator import agent_orchestrator
from app.services.actuation_engine import actuation_engine

router = APIRouter(prefix="/incidents", tags=["Investigation & AI Agents"])


class ApprovePlanRequest(BaseModel):
    operator_name: Optional[str] = "Lead Industrial Operator"


class RejectPlanRequest(BaseModel):
    operator_name: Optional[str] = None
    rejected_by: Optional[str] = None
    reason: Optional[str] = "Physical on-site inspection required before actuation"

    def get_operator_name(self) -> str:
        return self.operator_name or self.rejected_by or "Shift Supervisor"


@router.post("/{incident_id}/investigate", response_model=Dict[str, Any])
def trigger_incident_investigation(
    incident_id: str,
    db: Session = Depends(get_db)
):
    """
    Triggers full 4-stage AI agent investigation pipeline (Signal -> RCA -> Impact -> SOP RAG).
    """
    try:
        result = agent_orchestrator.run_investigation_pipeline(db, incident_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/{incident_id}/investigation", response_model=Dict[str, Any])
def get_incident_investigation(
    incident_id: str,
    db: Session = Depends(get_db)
):
    """
    Retrieves existing AI agent investigation analysis for an incident.
    """
    try:
        result = agent_orchestrator.run_investigation_pipeline(db, incident_id)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{incident_id}/approve", response_model=Dict[str, Any])
def approve_response_plan(
    incident_id: str,
    payload: Optional[ApprovePlanRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Human Approval Gate: Operator explicitly authorizes the AI recommended response plan.
    """
    operator_name = payload.operator_name if payload else "Lead Industrial Operator"
    try:
        result = actuation_engine.approve_action_plan(db, incident_id, operator_name)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{incident_id}/reject", response_model=Dict[str, Any])
def reject_response_plan(
    incident_id: str,
    payload: Optional[RejectPlanRequest] = None,
    db: Session = Depends(get_db)
):
    """
    Supervisor Rejection / Inspection Request: Operator holds action plan and requests physical inspection.
    """
    operator_name = payload.get_operator_name() if payload else "Shift Supervisor"
    reason = payload.reason if payload and payload.reason else "Manual on-site inspection requested before software containment"
    try:
        result = actuation_engine.reject_action_plan(db, incident_id, operator_name, reason)
        return result
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/{incident_id}/execute-actuation", response_model=Dict[str, Any])
def execute_actuation(
    incident_id: str,
    db: Session = Depends(get_db)
):
    """
    Executes software-guided containment actuation post-human approval.
    Updates machine status to CONTAINED and stabilizes telemetry graphs to normal baseline.
    """
    try:
        result = actuation_engine.execute_simulated_actuation(db, incident_id)
        return result
    except PermissionError as e:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
