import pytest
from fastapi.testclient import TestClient
from app.models.models import Incident, ActionRecommendation
from app.core.database import SessionLocal


def test_safety_unauthorized_actuation_returns_403(client: TestClient):
    """Verify unauthorized containment actuation is blocked by HTTP 403 Forbidden."""
    # Ensure unapproved state
    db = SessionLocal()
    inc = db.query(Incident).filter(Incident.id == 'INC-M204-001').first()
    act = db.query(ActionRecommendation).filter(ActionRecommendation.incident_id == 'INC-M204-001').first()
    inc.status = 'PENDING_APPROVAL'
    act.human_approved = False
    act.approved_by = None
    act.simulation_executed = False
    db.commit()
    db.close()

    res = client.post('/api/incidents/INC-M204-001/execute-actuation', json={
        'executed_by': 'Unauthorized-Actor',
        'simulation_mode': True
    })
    assert res.status_code == 403
    assert "Human approval required" in res.json()["detail"]


def test_supervisor_rejection_and_audit_event(client: TestClient):
    """Verify supervisor can reject an action plan with reason, updating status to INSPECTION_REQUESTED."""
    res_reject = client.post('/api/incidents/INC-M204-001/reject', json={
        'rejected_by': 'Shift Supervisor Deshmukh',
        'reason': 'Secondary cooling loop PMP-102 pressure manifold needs manual valve verification.'
    })
    assert res_reject.status_code == 200
    data = res_reject.json()
    assert data['status'] == 'INSPECTION_REQUESTED'
    assert data['human_approved'] is False
    assert data['rejected_by'] == 'Shift Supervisor Deshmukh'

    # Verify audit trail logs the rejection
    res_audit = client.get('/api/incidents/INC-M204-001/audit-trail')
    assert res_audit.status_code == 200
    logs = res_audit.json()
    assert any(log['action_type'] == 'OPERATOR_REJECTED' for log in logs)


def test_supervisor_approval_and_simulated_actuation(client: TestClient):
    """Verify supervisor approval unlocks simulated actuation, stabilizing telemetry."""
    # Reset to PENDING_APPROVAL
    db = SessionLocal()
    inc = db.query(Incident).filter(Incident.id == 'INC-M204-001').first()
    act = db.query(ActionRecommendation).filter(ActionRecommendation.incident_id == 'INC-M204-001').first()
    inc.status = 'PENDING_APPROVAL'
    act.human_approved = False
    db.commit()
    db.close()

    # Approve
    res_app = client.post('/api/incidents/INC-M204-001/approve', json={
        'approved_by': 'Shift Supervisor Patil',
        'override_notes': 'Authorized pump rollover'
    })
    assert res_app.status_code == 200
    assert res_app.json()['status'] == 'APPROVED'

    # Execute actuation
    res_act = client.post('/api/incidents/INC-M204-001/execute-actuation', json={
        'executed_by': 'Shift Supervisor Patil',
        'simulation_mode': True
    })
    assert res_act.status_code == 200
    act_data = res_act.json()
    assert act_data['incident_status'] == 'CONTAINED'
    assert act_data['machine_status'] == 'CONTAINED'
    assert act_data['telemetry_stabilized'] is True

    # Verify cryptographic audit chain integrity
    res_ver = client.get('/api/incidents/INC-M204-001/audit-trail/verify')
    assert res_ver.status_code == 200
    ver = res_ver.json()
    assert ver['is_valid'] is True

