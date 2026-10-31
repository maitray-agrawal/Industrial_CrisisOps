from typing import Dict, Any, Optional
from pydantic import BaseModel, Field
from app.agents.rca_agent import RCAPayload


class ImpactAssessmentOutput(BaseModel):
    estimated_downtime_hours: float = Field(..., description="Estimated total production downtime in hours")
    estimated_financial_loss_usd: float = Field(..., description="Estimated direct and indirect financial impact in USD (legacy compat)")
    safety_risk_rating: str = Field(..., description="Safety risk rating: LOW, MODERATE, HIGH, SEVERE")
    summary: str = Field(..., description="Human readable business and operational impact summary")
    production_capacity_loss_pct: float = Field(..., description="Percentage reduction in total plant throughput")
    used_fallback: bool = False

    # India-Focused Localization Fields (INR ₹, Chakan MIDC Assumptions)
    currency: str = "INR"
    estimated_financial_loss_inr: float = Field(default=306000.0, description="Estimated production value affected in INR")
    production_speed_units_hr: float = Field(default=120.0, description="Nominal hourly production throughput (components/hour)")
    production_units_affected: float = Field(default=360.0, description="Estimated total components affected during repair")
    unit_value_inr: float = Field(default=850.0, description="Illustrative contribution value per manufactured component (₹)")
    estimated_maintenance_cost_inr: float = Field(default=45000.0, description="Estimated spare parts and technician repair cost (₹)")
    formatted_inr: str = Field(default="₹3.06 lakh", description="Formatted Indian currency display string")
    calculation_basis: str = Field(
        default="Estimated downtime: 3.0h | Line speed: 120 units/hr | Affected: 360 units @ ₹850/unit = ₹3,06,000 estimated production value affected.",
        description="Explicit breakdown of assumptions behind the financial calculation"
    )


class ImpactAssessmentAgent:
    """
    Agent 3: Impact Assessment Agent
    Calculates operational downtime, Indian rupee (₹) production value affected, and safety risks.
    """

    def assess_impact(
        self,
        machine_id: str,
        rca_payload: RCAPayload,
        machine_metadata: Optional[Dict[str, Any]] = None
    ) -> ImpactAssessmentOutput:
        """
        Executes operational impact estimation with deterministic business logic fallback.
        """
        try:
            confidence = rca_payload.confidence_score

            # Standardized financial model: Pune Automotive Components Plant (Chakan MIDC)
            # Legacy USD compatibility: 24.0h @ $1,875/hr = $45,000 USD
            downtime_hours = 24.0
            financial_loss = 45000.0
            risk_rating = "HIGH"
            capacity_loss = 35.0

            # Realistic Indian Automotive Line Assumptions:
            # Shift repair duration: 3.0 hours typical containment/bearing inspection
            # Production rate: 120 precision automotive components / hour
            # Value per component: ₹850
            # Production value affected: 3.0h × 120 = 360 units × ₹850 = ₹3,06,000
            # Spare parts & technician maintenance cost: ₹45,000
            # Total estimated financial exposure: ₹3,51,000 (~₹3.51 lakh)
            inr_speed = 120.0
            inr_downtime = 3.0
            inr_unit_value = 850.0
            inr_units_affected = inr_downtime * inr_speed
            inr_loss = inr_units_affected * inr_unit_value
            maint_cost_inr = 45000.0

            if confidence > 90.0:
                risk_rating = "HIGH" if "bearing" in rca_payload.hypothesis.lower() else "MODERATE"

            summary = (
                f"Unplanned downtime on {machine_id} estimated at {inr_downtime:.1f} hours ({capacity_loss:.0f}% line reduction). "
                f"Affects {inr_units_affected:.0f} components at ₹{inr_unit_value:.0f}/unit, totaling an estimated "
                f"₹{inr_loss:,.0f} (₹3.06 lakh) in production value affected, with ₹{maint_cost_inr:,.0f} maintenance cost."
            )

            calc_basis = (
                f"Estimated downtime: {inr_downtime:.1f}h | Line output: {inr_speed:.0f} components/hr | "
                f"Affected: {inr_units_affected:.0f} units | Illustrative value: ₹{inr_unit_value:.0f}/unit | "
                f"Estimated production value affected: ₹{inr_loss:,.0f} | Maintenance: ₹{maint_cost_inr:,.0f}"
            )

            return ImpactAssessmentOutput(
                estimated_downtime_hours=downtime_hours,
                estimated_financial_loss_usd=financial_loss,
                safety_risk_rating=risk_rating,
                summary=summary,
                production_capacity_loss_pct=capacity_loss,
                used_fallback=True,
                currency="INR",
                estimated_financial_loss_inr=inr_loss,
                production_speed_units_hr=inr_speed,
                production_units_affected=inr_units_affected,
                unit_value_inr=inr_unit_value,
                estimated_maintenance_cost_inr=maint_cost_inr,
                formatted_inr="₹3.06 lakh",
                calculation_basis=calc_basis
            )

        except Exception as err:
            return self._fallback_impact(machine_id, str(err))

    def _fallback_impact(self, machine_id: str, reason: str) -> ImpactAssessmentOutput:
        return ImpactAssessmentOutput(
            estimated_downtime_hours=24.0,
            estimated_financial_loss_usd=45000.0,
            safety_risk_rating="HIGH",
            summary=f"Unplanned downtime on {machine_id} estimated at 3.0 hours, affecting 360 components for an estimated ₹3,06,000 (₹3.06 lakh) production value affected.",
            production_capacity_loss_pct=35.0,
            used_fallback=True,
            currency="INR",
            estimated_financial_loss_inr=306000.0,
            production_speed_units_hr=120.0,
            production_units_affected=360.0,
            unit_value_inr=850.0,
            estimated_maintenance_cost_inr=45000.0,
            formatted_inr="₹3.06 lakh",
            calculation_basis="Estimated downtime: 3.0h | Line speed: 120 units/hr | Affected: 360 units @ ₹850/unit = ₹3,06,000 estimated production value affected."
        )
