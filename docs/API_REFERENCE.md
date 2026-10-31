# Industrial CrisisOps — REST API Reference

The CrisisOps backend provides a high-performance, asynchronous REST API powered by FastAPI.
All routes are prefixed with `/api` by default.

- **Base URL (Local)**: `http://localhost:8000/api`
- **Base URL (Production)**: `https://crisisops-api.onrender.com/api`
- **Interactive Swagger Docs**: `https://crisisops-api.onrender.com/docs`
- **ReDoc Specification**: `https://crisisops-api.onrender.com/redoc`

---

## Table of Contents
1. [System & Health](#1-system--health)
2. [Machines & Telemetry](#2-machines--telemetry)
3. [Incidents & Investigation](#3-incidents--investigation)
4. [AI Multi-Agent Pipeline & Approvals](#4-ai-multi-agent-pipeline--approvals)
5. [Standard Operating Procedures (SOPs)](#5-standard-operating-procedures-sops)
6. [Audit Trail & Cryptographic Verification](#6-audit-trail--cryptographic-verification)
7. [Simulation & Telemetry Engine](#7-simulation--telemetry-engine)

---

## 1. System & Health

### `GET /api/health`
Checks backend service availability and running environment.

#### Response `200 OK`
```json
{
  "status": "ok",
  "app": "Industrial CrisisOps",
  "version": "1.0.0",
  "environment": "production"
}
```

---

## 2. Machines & Telemetry

### `GET /api/machines`
Retrieves all registered industrial assets across the facility.

#### Response `200 OK`
```json
[
  {
    "id": "M-204",
    "name": "PMP-204 Centrifugal Coolant Pump",
    "type": "Centrifugal Pump",
    "location": "Line B - Cooling Water Circulation Bay",
    "status": "CRITICAL",
    "criticality": "CRITICAL",
    "health_score": 46.5,
    "vibration_threshold": 4.5,
    "temp_threshold": 75.0,
    "rated_output_units": 120.0,
    "output_unit_label": "m³/hour",
    "created_at": "2026-10-31T06:00:00Z"
  }
]
```

---

### `GET /api/machines/{machine_id}`
Returns complete machine metadata, recent telemetry records, overdue maintenance items, and active incidents.

#### Parameters
- `machine_id` (path, string, required): e.g. `M-204`

#### Response `200 OK`
```json
{
  "id": "M-204",
  "name": "PMP-204 Centrifugal Coolant Pump",
  "type": "Centrifugal Pump",
  "location": "Line B - Cooling Water Circulation Bay",
  "status": "CRITICAL",
  "description": "Primary cooling water circulation pump serving Machining Line B high-speed spindle heads.",
  "created_at": "2026-10-31T06:00:00Z",
  "recent_telemetry": [
    {
      "id": 49,
      "machine_id": "M-204",
      "timestamp": "2026-10-31T06:00:00Z",
      "temperature": 88.5,
      "vibration": 7.82,
      "rpm": 1450.0,
      "pressure": 3.8,
      "z_score": 3.83,
      "is_anomaly": true
    }
  ],
  "maintenance_records": [
    {
      "id": "MNT-882",
      "machine_id": "M-204",
      "service_type": "Bearing Replacement & Seal Overhaul",
      "technician": "Rajesh Kumar (Senior Mech)",
      "parts_replaced": "SKF Explorer 6309 Deep Groove Ball Bearing",
      "cost_inr": 25000.0,
      "timestamp": "2025-08-15T00:00:00Z"
    }
  ],
  "active_incidents": []
}
```

#### Error Response `404 Not Found`
```json
{
  "detail": "Machine 'M-999' not found"
}
```

---

### `GET /api/machines/{machine_id}/telemetry`
Fetches chronological telemetry samples for time-series charting.

#### Parameters
- `machine_id` (path, string, required)
- `limit` (query, integer, optional, default: 50, range: 1–500)

#### Response `200 OK`
```json
[
  {
    "id": 49,
    "machine_id": "M-204",
    "timestamp": "2026-10-31T06:00:00Z",
    "temperature": 88.5,
    "vibration": 7.82,
    "rpm": 1450.0,
    "pressure": 3.8,
    "z_score": 3.83,
    "is_anomaly": true
  }
]
```

---

## 3. Incidents & Investigation

### `GET /api/incidents`
Lists all recorded plant incidents with optional status or severity filters.

#### Parameters
- `status` (query, string, optional): `OPEN`, `CRITICAL`, `CONTAINED`, `RESOLVED`
- `severity` (query, string, optional): `LOW`, `MEDIUM`, `HIGH`, `CRITICAL`

#### Response `200 OK`
```json
[
  {
    "id": "INC-M204-001",
    "machine_id": "M-204",
    "title": "Drive-End Bearing Thermal Degradation & High Harmonic Vibration",
    "severity": "CRITICAL",
    "status": "CRITICAL",
    "created_at": "2026-10-31T06:00:00Z",
    "root_cause": "Drive-end ball bearing severe fatigue failure caused by exceeded operational hours (overdue maintenance MNT-882 by 60 days).",
    "financial_loss_estimate": 306000.0,
    "recommended_sop_code": "SOP-M204-BEARING"
  }
]
```

---

### `GET /api/incidents/{incident_id}`
Returns incident details, correlated evidence items, and recommended action items.

#### Parameters
- `incident_id` (path, string, required): e.g. `INC-M204-001`

#### Response `200 OK`
```json
{
  "id": "INC-M204-001",
  "machine_id": "M-204",
  "title": "Drive-End Bearing Thermal Degradation & High Harmonic Vibration",
  "severity": "CRITICAL",
  "status": "CRITICAL",
  "created_at": "2026-10-31T06:00:00Z",
  "evidence": [
    {
      "id": "EV-001",
      "incident_id": "INC-M204-001",
      "evidence_type": "TELEMETRY_ANOMALY",
      "source": "SCADA Telemetry Stream",
      "description": "Vibration harmonic frequency breach (+3.83 Z-score deviation above baseline).",
      "confidence_score": 0.96
    }
  ],
  "recommendations": [
    {
      "id": "REC-001",
      "incident_id": "INC-M204-001",
      "sop_code": "SOP-M204-BEARING",
      "action_type": "THROTTLE_AND_FAILOVER",
      "description": "Throttle PMP-204 pump hydraulic motor load to 25% capacity. Spin up secondary pump PMP-102.",
      "requires_human_approval": true,
      "human_approved": false,
      "is_active": true
    }
  ]
}
```

---

## 4. AI Multi-Agent Pipeline & Approvals

### `POST /api/incidents/{incident_id}/investigate`
Executes the full 4-stage sequential agent pipeline (Signal $\to$ RCA $\to$ Impact $\to$ SOP RAG).

#### Response `200 OK`
```json
{
  "status": "success",
  "incident_id": "INC-M204-001",
  "pipeline_stages": {
    "signal_analysis": {
      "status": "ANOMALY_CONFIRMED",
      "metric": "vibration",
      "z_score": 3.83,
      "threshold": 4.5
    },
    "root_cause_analysis": {
      "status": "ROOT_CAUSE_IDENTIFIED",
      "root_cause": "Drive-End Bearing Mechanical Wear",
      "maintenance_record": "MNT-882",
      "days_overdue": 60
    },
    "financial_impact": {
      "downtime_hours": 12.0,
      "production_loss_inr": 306000.0,
      "maintenance_cost_inr": 45000.0,
      "total_exposure_inr": 351000.0
    },
    "sop_recommendation": {
      "sop_code": "SOP-M204-BEARING",
      "title": "Centrifugal Pump Bearing Overheat Containment Procedure",
      "containment_action": "Throttle motor to 25% capacity. Engage secondary standby pump PMP-102."
    }
  }
}
```

---

### `POST /api/incidents/{incident_id}/approve`
**Human Authorization Gate**: Operator explicitly authorizes containment plan.

#### Request Body
```json
{
  "operator_name": "Shift Supervisor Deshmukh"
}
```

#### Response `200 OK`
```json
{
  "status": "APPROVED",
  "incident_id": "INC-M204-001",
  "approved_by": "Shift Supervisor Deshmukh",
  "approval_time": "2026-10-31T07:15:00Z",
  "action_authorized": true
}
```

---

### `POST /api/incidents/{incident_id}/reject`
**Supervisor Rejection / Hold**: Holds plan execution and requests manual on-site mechanical inspection.

#### Request Body
```json
{
  "operator_name": "Shift Supervisor Deshmukh",
  "reason": "Physical on-site inspection required before actuation"
}
```

#### Response `200 OK`
```json
{
  "status": "REJECTED",
  "incident_id": "INC-M204-001",
  "rejected_by": "Shift Supervisor Deshmukh",
  "reason": "Physical on-site inspection required before actuation",
  "action_authorized": false
}
```

---

### `POST /api/incidents/{incident_id}/execute-actuation`
Executes software-guided containment actuation post-human authorization.

> **Zero-Trust Safety Invariant**: If human approval is missing, this endpoint **strictly returns `403 Forbidden`**.

#### Response `200 OK` (When Approved)
```json
{
  "status": "SUCCESS",
  "incident_id": "INC-M204-001",
  "machine_status": "CONTAINED",
  "action_executed": "Throttled PMP-204 to 25% capacity; Standby pump PMP-102 engaged.",
  "telemetry_stabilized": true
}
```

#### Error Response `403 Forbidden` (When Unapproved)
```json
{
  "detail": "ACTUATION FORBIDDEN: Human operator approval is required before containment execution."
}
```

---

## 5. Standard Operating Procedures (SOPs)

### `GET /api/sops`
Lists all indexed plant operating procedures.

#### Response `200 OK`
```json
[
  {
    "id": "SOP-M204",
    "sop_code": "SOP-M204-BEARING",
    "title": "Centrifugal Pump Bearing Overheat Containment Procedure",
    "category": "PUMP_EMERGENCY",
    "target_equipment_type": "Centrifugal Pump",
    "revision": "v2.1"
  }
]
```

---

### `GET /api/sops/{sop_id}`
Returns complete Markdown text and actionable steps for an SOP.

#### Response `200 OK`
```json
{
  "id": "SOP-M204",
  "sop_code": "SOP-M204-BEARING",
  "title": "Centrifugal Pump Bearing Overheat Containment Procedure",
  "category": "PUMP_EMERGENCY",
  "target_equipment_type": "Centrifugal Pump",
  "markdown_content": "# SOP-M204: Emergency Bearing Thermal Runaway Containment\n..."
}
```

---

## 6. Audit Trail & Cryptographic Verification

### `GET /api/incidents/{incident_id}/audit-trail`
Retrieves chronological audit log entries with SHA-256 hash chains.

#### Response `200 OK`
```json
[
  {
    "id": 1,
    "incident_id": "INC-M204-001",
    "timestamp": "2026-10-31T06:00:00Z",
    "actor_type": "DETECTOR",
    "actor_id": "StatisticalAnomalyDetector",
    "action_type": "INCIDENT_TRIGGERED",
    "details": {
      "z_score": 3.83,
      "metric": "vibration"
    },
    "previous_hash": "0000000000000000000000000000000000000000000000000000000000000000",
    "current_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855"
  }
]
```

---

### `GET /api/incidents/{incident_id}/audit-trail/verify`
Server-side cryptographic hash verification confirming zero tampering across the audit ledger.

#### Response `200 OK`
```json
{
  "incident_id": "INC-M204-001",
  "total_records": 4,
  "is_valid": true,
  "verification_status": "VERIFIED_TAMPER_FREE",
  "verified_at": "2026-10-31T07:30:00Z"
}
```

---

### `GET /api/incidents/{incident_id}/replay`
Reconstructs the full timeline of the incident for time-travel inspection.

#### Response `200 OK`
```json
{
  "incident_id": "INC-M204-001",
  "timeline_events": [
    {
      "step": 1,
      "event_type": "TELEMETRY_BREACH",
      "timestamp": "2026-10-31T06:00:00Z",
      "summary": "Vibration reached 7.82 mm/s (Z-score +3.83)"
    },
    {
      "step": 2,
      "event_type": "RCA_DIAGNOSIS",
      "timestamp": "2026-10-31T06:01:00Z",
      "summary": "Maintenance record MNT-882 overdue by 60 days"
    }
  ]
}
```

---

## 7. Simulation & Telemetry Engine

### `GET /api/simulation/status`
Returns current scenario playback status.

### `POST /api/simulation/tick`
Advances the global simulation clock across all 10 assets by 1 tick.

### `POST /api/simulation/trigger-degradation`
Forces deterministic bearing degradation on pump `M-204` for live demo trigger.

### `POST /api/simulation/reset`
Resets the simulation stream back to nominal operating baseline.

