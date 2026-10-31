"""
Industrial CrisisOps — Realistic Demonstration Seed Data
Domain: Automotive Components Manufacturing Plant
Location: Chakan MIDC, Pune, Maharashtra, India
Operating Pattern: 3 Shifts (24-Hour Continuous Automotive Precision Line)
Data Label: DEMO DATA — SIMULATED INDUSTRIAL ENVIRONMENT
"""

import random
from datetime import datetime, timedelta, timezone
from app.core.database import SessionLocal, engine, Base
from app.models.models import (
    Machine,
    TelemetryRecord,
    MaintenanceRecord,
    SOPDocument,
    Incident,
    Evidence,
    ActionRecommendation
)


def populate_seed_data(db):
    """Seed comprehensive, realistic industrial data for Pune Automotive Plant."""
    now = datetime.now(timezone.utc)

    # -------------------------------------------------------------
    # 1. REGISTERED MACHINES (10 Precision Automotive Assets)
    # -------------------------------------------------------------
    machines = [
        # Machine 1: Primary Pump (INC-M204-001 target) - Satisfies test_machines.py: "M-204"
        Machine(
            id="M-204",
            name="PMP-204 Centrifugal Coolant Pump",
            type="Centrifugal Pump",
            location="Line B - Cooling Water Circulation Bay",
            status="CRITICAL",
            description="Primary cooling water circulation pump serving Machining Line B high-speed spindle heads. Rated for 120 m³/hour. Critical for thermal dissipation.",
            equipment_category="Centrifugal Pump",
            manufacturer_model="Kirloskar KPD-80/20 Industrial (Illustrative)",
            criticality="CRITICAL",
            health_score=46.5,
            last_maintenance_date=now - timedelta(days=420),
            next_maintenance_date=now - timedelta(days=60),  # Overdue by 60 days
            vibration_threshold=4.5,
            temp_threshold=75.0,
            rated_output_units=120.0,
            output_unit_label="m³/hour"
        ),
        # Machine 2: Precision CNC Machining Centre - Satisfies test_machines.py: "M-101"
        Machine(
            id="M-101",
            name="CNC-101 5-Axis Machining Centre",
            type="CNC Machining Centre",
            location="Line A - Precision Machining Bay",
            status="WARNING",
            description="High-precision 5-axis CNC machining centre machining automotive cylinder heads and transmission cases. Rated for 120 components/hour.",
            equipment_category="CNC Machining Centre",
            manufacturer_model="BFW Chakra BMV 60+ (Illustrative)",
            criticality="HIGH",
            health_score=71.0,
            last_maintenance_date=now - timedelta(days=65),
            next_maintenance_date=now + timedelta(days=25),
            vibration_threshold=2.8,
            temp_threshold=65.0,
            rated_output_units=120.0,
            output_unit_label="units/hour"
        ),
        # Machine 3: Industrial Air Compressor - Satisfies test_machines.py: "M-305"
        Machine(
            id="M-305",
            name="CMP-301 Rotary Screw Air Compressor",
            type="Air Compressor",
            location="Utility Plant - Air Header Bay 1",
            status="WARNING",
            description="Heavy rotary screw air compressor providing constant 7.5-8.5 bar pneumatic pressure across plant pneumatic automation and robotic cells.",
            equipment_category="Air Compressor",
            manufacturer_model="Elgi EG-75 Rotary Screw (Illustrative)",
            criticality="HIGH",
            health_score=68.5,
            last_maintenance_date=now - timedelta(days=90),
            next_maintenance_date=now + timedelta(days=30),
            vibration_threshold=3.2,
            temp_threshold=85.0,
            rated_output_units=8.5,
            output_unit_label="bar"
        ),
        # Machine 4: Hydraulic Press
        Machine(
            id="HYD-105",
            name="HYD-105 500T Hydraulic Forming Press",
            type="Hydraulic Press",
            location="Press Shop - Line C",
            status="NORMAL",
            description="Deep draw 500-tonne hydraulic forming press stamping automotive chassis bracket components and structural panels.",
            equipment_category="Hydraulic Press",
            manufacturer_model="Godrej PE-500 Heavy Hydraulic (Illustrative)",
            criticality="HIGH",
            health_score=94.0,
            last_maintenance_date=now - timedelta(days=120),
            next_maintenance_date=now + timedelta(days=60),
            vibration_threshold=3.0,
            temp_threshold=60.0,
            rated_output_units=45.0,
            output_unit_label="strokes/min"
        ),
        # Machine 5: Conveyor System
        Machine(
            id="CON-401",
            name="CON-401 Pallet Transfer Conveyor",
            type="Conveyor System",
            location="Assembly Line B - Transfer Tunnel",
            status="NORMAL",
            description="Automated roller conveyor moving machined cylinder blocks from Line A to sub-assembly lines with optical position tracking.",
            equipment_category="Conveyor System",
            manufacturer_model="Dematic Modular Pallet Line (Illustrative)",
            criticality="MEDIUM",
            health_score=96.5,
            last_maintenance_date=now - timedelta(days=30),
            next_maintenance_date=now + timedelta(days=60),
            vibration_threshold=2.2,
            temp_threshold=50.0,
            rated_output_units=15.0,
            output_unit_label="m/min"
        ),
        # Machine 6: Robotic Welding Cell
        Machine(
            id="WLD-202",
            name="WLD-202 Robotic Spot Welding Cell",
            type="Robotic Welding Cell",
            location="Robotic Fabrication Cell 2",
            status="NORMAL",
            description="Six-axis industrial robotic welding station performing automated spot welding on automotive sub-frames and suspension arms.",
            equipment_category="Robotic Welding Cell",
            manufacturer_model="ABB IRB 6700 Spot Welder (Illustrative)",
            criticality="HIGH",
            health_score=91.5,
            last_maintenance_date=now - timedelta(days=15),
            next_maintenance_date=now + timedelta(days=45),
            vibration_threshold=2.0,
            temp_threshold=55.0,
            rated_output_units=60.0,
            output_unit_label="cycles/hour"
        ),
        # Machine 7: Industrial Electric Motor
        Machine(
            id="MOT-110",
            name="MOT-110 75kW Induction Motor",
            type="Industrial Electric Motor",
            location="Air Handling Unit 3 - Roof Bay",
            status="NORMAL",
            description="Three-phase 75kW induction motor driving central ventilation exhaust and fumes scrubbing system for Press Shop.",
            equipment_category="Electric Motor",
            manufacturer_model="Siemens 1LE1 High Efficiency (Illustrative)",
            criticality="MEDIUM",
            health_score=97.0,
            last_maintenance_date=now - timedelta(days=25),
            next_maintenance_date=now + timedelta(days=155),
            vibration_threshold=2.5,
            temp_threshold=70.0,
            rated_output_units=1480.0,
            output_unit_label="RPM"
        ),
        # Machine 8: Industrial Chiller
        Machine(
            id="CHL-501",
            name="CHL-501 Water-Cooled Screw Chiller",
            type="Industrial Chiller",
            location="Utility Plant - Chiller Room",
            status="NORMAL",
            description="Central water-cooled screw chiller supplying 7°C chilled water to machine tool heat exchangers and hydraulic oil coolers.",
            equipment_category="Industrial Chiller",
            manufacturer_model="Voltas VSC-150 Screw Chiller (Illustrative)",
            criticality="HIGH",
            health_score=93.5,
            last_maintenance_date=now - timedelta(days=45),
            next_maintenance_date=now + timedelta(days=75),
            vibration_threshold=2.8,
            temp_threshold=45.0,
            rated_output_units=150.0,
            output_unit_label="TR"
        ),
        # Machine 9: Auxiliary Pump
        Machine(
            id="PMP-102",
            name="PMP-102 Auxiliary Coolant Circulation Pump",
            type="Centrifugal Pump",
            location="Line A - Coolant Station",
            status="NORMAL",
            description="Backup centrifugal pump configured for automatic rollover in case of main coolant pressure drop on Line A.",
            equipment_category="Centrifugal Pump",
            manufacturer_model="Kirloskar KPD-50/16 (Illustrative)",
            criticality="MEDIUM",
            health_score=98.0,
            last_maintenance_date=now - timedelta(days=50),
            next_maintenance_date=now + timedelta(days=130),
            vibration_threshold=4.0,
            temp_threshold=70.0,
            rated_output_units=80.0,
            output_unit_label="m³/hour"
        ),
        # Machine 10: Secondary CNC
        Machine(
            id="CNC-102",
            name="CNC-102 4-Axis Machining Centre",
            type="CNC Machining Centre",
            location="Line A - Precision Cell 2",
            status="NORMAL",
            description="Secondary 4-axis machining centre operating in parallel on transmission casing tap holes and alignment dowels.",
            equipment_category="CNC Machining Centre",
            manufacturer_model="BFW Chakra BMV 50 (Illustrative)",
            criticality="HIGH",
            health_score=95.0,
            last_maintenance_date=now - timedelta(days=40),
            next_maintenance_date=now + timedelta(days=80),
            vibration_threshold=2.8,
            temp_threshold=65.0,
            rated_output_units=100.0,
            output_unit_label="units/hour"
        )
    ]
    db.add_all(machines)
    db.commit()

    # -------------------------------------------------------------
    # 2. TELEMETRY: 24 HOURS OF TIMESTAMPED SAMPLES PER MACHINE
    # (49 points per machine = sampled every 30 minutes for 24 hours)
    # -------------------------------------------------------------
    telemetry_records = []
    # 48 half-hour intervals = 24.0 hours back to 0
    for step in range(48, -1, -1):
        ts = now - timedelta(minutes=step * 30)

        # M-204: Normal until last 3 hours (last 6 steps), then severe thermal & vibration spike
        if step > 6:
            m204_vib = round(1.8 + (step % 5) * 0.08, 2)
            m204_temp = round(52.0 + (step % 4) * 0.7, 1)
            m204_output = round(99.0 + (step % 3) * 0.5, 1)
            m204_anom = False
        else:
            # Degradation sequence: reaches 7.82 mm/s RMS and 88.4°C
            prog = 6 - step  # 0 to 6
            m204_vib = round(4.5 + prog * 0.55, 2)    # 4.5 -> 7.80 mm/s
            m204_temp = round(75.0 + prog * 2.2, 1)   # 75.0 -> 88.2°C
            m204_output = round(88.0 - prog * 4.4, 1) # 88.0 -> 61.6 m³/hr
            m204_anom = True

        telemetry_records.append(
            TelemetryRecord(
                machine_id="M-204",
                timestamp=ts,
                vibration_mm_s=m204_vib,
                temp_celsius=m204_temp,
                output_units_min=m204_output,
                is_anomaly=m204_anom
            )
        )

        # M-101 (CNC-101): Normal baseline, warning vibration fluctuation in last 4 steps
        if step > 4:
            m101_vib = round(1.2 + (step % 4) * 0.05, 2)
            m101_temp = round(44.0 + (step % 3) * 0.4, 1)
            m101_output = round(120.0 + (step % 2) * 0.5, 1)
            m101_anom = False
        else:
            # Spindle vibration elevated
            prog = 4 - step
            m101_vib = round(2.9 + prog * 0.22, 2)   # 2.9 -> 3.78 mm/s
            m101_temp = round(58.0 + prog * 1.5, 1)  # 58.0 -> 64.0°C
            m101_output = round(110.0 - prog * 3.0, 1)
            m101_anom = True

        telemetry_records.append(
            TelemetryRecord(
                machine_id="M-101",
                timestamp=ts,
                vibration_mm_s=m101_vib,
                temp_celsius=m101_temp,
                output_units_min=m101_output,
                is_anomaly=m101_anom
            )
        )

        # M-305 (CMP-301): Discharge overheating in last 6 steps
        if step > 6:
            m305_vib = round(1.4 + (step % 3) * 0.05, 2)
            m305_temp = round(68.0 + (step % 4) * 0.5, 1)
            m305_output = round(8.4 + (step % 2) * 0.05, 2)
            m305_anom = False
        else:
            prog = 6 - step
            m305_vib = round(2.8 + prog * 0.15, 2)
            m305_temp = round(84.0 + prog * 1.4, 1)  # 84.0 -> 92.4°C
            m305_output = round(7.8 - prog * 0.12, 2) # Pressure drop to 7.08 bar
            m305_anom = True

        telemetry_records.append(
            TelemetryRecord(
                machine_id="M-305",
                timestamp=ts,
                vibration_mm_s=m305_vib,
                temp_celsius=m305_temp,
                output_units_min=m305_output,
                is_anomaly=m305_anom
            )
        )

        # Baseline records for other assets (HYD-105, CON-401, WLD-202, MOT-110, CHL-501, PMP-102, CNC-102)
        other_configs = [
            ("HYD-105", 1.1, 46.0, 44.5),
            ("CON-401", 0.9, 38.0, 14.8),
            ("WLD-202", 0.6, 42.0, 59.0),
            ("MOT-110", 1.4, 58.0, 1475.0),
            ("CHL-501", 1.2, 41.0, 148.0),
            ("PMP-102", 1.3, 45.0, 79.5),
            ("CNC-102", 1.1, 47.0, 98.5)
        ]
        for m_id, b_vib, b_temp, b_out in other_configs:
            telemetry_records.append(
                TelemetryRecord(
                    machine_id=m_id,
                    timestamp=ts,
                    vibration_mm_s=round(b_vib + (step % 3) * 0.04, 2),
                    temp_celsius=round(b_temp + (step % 2) * 0.4, 1),
                    output_units_min=round(b_out + (step % 4) * 0.2, 1),
                    is_anomaly=False
                )
            )

    db.add_all(telemetry_records)
    db.commit()

    # -------------------------------------------------------------
    # 3. MAINTENANCE RECORDS (8 Real Historical Work Orders)
    # -------------------------------------------------------------
    maintenance_records = [
        # MNT-882: Crucial record for RCA agent correlation on M-204
        MaintenanceRecord(
            id="MNT-882",
            machine_id="M-204",
            timestamp=now - timedelta(days=420),
            component="Main Drive Bearing M-204-B",
            action_taken="Bearing Replacement & Synthetic Lubrication Flush",
            technician="Senior Tech R. Vance / Maintenance Eng. S. Deshmukh",
            notes="Replaced drive bearing M-204-B. Manufacturer specified lifetime: 12 months max under heavy production load. Next scheduled replacement was due 2 months ago."
        ),
        MaintenanceRecord(
            id="MNT-741",
            machine_id="M-204",
            timestamp=now - timedelta(days=180),
            component="Hydraulic Pressure Transducer",
            action_taken="Routine Sensor Calibration & Fluid Top-Up",
            technician="Maintenance Tech A. Gupta",
            notes="Calibrated pressure transducers. Coolant fluid levels verified clean. No physical mechanical wear noted at 6-month check."
        ),
        MaintenanceRecord(
            id="MNT-610",
            machine_id="M-101",
            timestamp=now - timedelta(days=65),
            component="Spindle Taper & Tool Clamping Collet",
            action_taken="Spindle Runout Calibration & Collet Cleanse",
            technician="Lead Tooling Eng. K. Chen",
            notes="Dynamic spindle runout calibrated to within 0.003 mm. Replaced worn clamping fingers."
        ),
        MaintenanceRecord(
            id="MNT-912",
            machine_id="M-305",
            timestamp=now - timedelta(days=90),
            component="Air Compressor Radiator & Air Filter",
            action_taken="2,000-Hour Preventive Maintenance Overhaul",
            technician="Utility Eng. P. Kulkarni",
            notes="Replaced intake air filter cartridge and flushed oil separator. Radiator fin cleaning recommended for next quarter."
        ),
        MaintenanceRecord(
            id="MNT-923",
            machine_id="HYD-105",
            timestamp=now - timedelta(days=120),
            component="Proportional Directional Control Valve",
            action_taken="Valve Seal Replacement & Hydraulic Oil Filtration",
            technician="Hydraulics Specialist R. Joshi",
            notes="Replaced leaking O-rings on manifold block. Oil cleanliness tested at NAS Class 7."
        ),
        MaintenanceRecord(
            id="MNT-934",
            machine_id="CON-401",
            timestamp=now - timedelta(days=30),
            component="Conveyor Drive Roller & Tension Belt",
            action_taken="Drive Belt Tensioning & Bearing Greasing",
            technician="Maintenance Tech M. Shinde",
            notes="Lubricated all 16 roller pillow block bearings with lithium complex grease. Belt tracking verified true."
        ),
        MaintenanceRecord(
            id="MNT-945",
            machine_id="WLD-202",
            timestamp=now - timedelta(days=15),
            component="Welding Gun Electrode & Cable Harness",
            action_taken="Electrode Tip Dressing & Shroud Cleaning",
            technician="Robotics Eng. V. Patil",
            notes="Dressed copper-chromium electrode caps. Inspected articulated wire feed liner for kinks."
        ),
        MaintenanceRecord(
            id="MNT-956",
            machine_id="CHL-501",
            timestamp=now - timedelta(days=45),
            component="Condenser Heat Exchanger Tubes",
            action_taken="Chemical Descaling & Refrigerant Charge Check",
            technician="HVAC Tech S. More",
            notes="Cleaned tube bundles using mild sulfamic acid. Refrigerant R-134a operating pressures confirmed at 3.4 bar / 11.2 bar."
        )
    ]
    db.add_all(maintenance_records)
    db.commit()

    # -------------------------------------------------------------
    # 4. STANDARD OPERATING PROCEDURES (8 Comprehensive SOPs)
    # -------------------------------------------------------------
    sops = [
        # SOP-M204-BEARING: Key procedure for demo incident
        SOPDocument(
            id="SOP-M204-BEARING",
            sop_code="SOP-M204-BEARING",
            title="PMP-204 Centrifugal Pump / Drive Bearing Degradation Response Procedure",
            target_component="Centrifugal Pump / Drive Bearing M-204-B",
            content_markdown="""# SOP-M204-BEARING: Drive Bearing Emergency Response
**Plant:** Pune Automotive Components Manufacturing Plant (Chakan MIDC)  
**Applicability:** Primary Coolant Circulation Pump PMP-204 / M-204  
**Target Component:** Main Drive Bearing M-204-B & Mechanical Seal Assembly

---

## 1. Initial Isolation & Operational Safeguards
- **Step 1.1**: Throttle pump flow setpoint by 40% via SCADA interface to relieve mechanical bearing stress.
- **Step 1.2**: Engage auxiliary coolant pump PMP-102 into parallel recirculation loop to maintain minimum 80 m³/hour line cooling flow.
- **Step 1.3**: Inspect thermal sensor PT-100 on front bearing bracket. If temperature exceeds 85°C, prepare for safe electrical isolation.

## 2. Containment & Temporary Thermal Mitigation
- **Step 2.1**: Inject high-viscosity synthetic lubricant flush `#LUB-SYN-900` into bearing chamber B via grease nipple.
- **Step 2.2**: Observe vibration spectrum via online accelerometer CH-02. Confirm vibration amplitude drops below 4.5 mm/s RMS.
- **Step 2.3**: Monitor motor winding current; ensure balanced 3-phase draw under 85 Amperes.

## 3. Maintenance Overhaul & Safe Bearing Replacement
- **Step 3.1**: Execute plant Lockout/Tagout (LOTO) protocol `#SOP-LOTO-SAFETY` on main 415V electrical breaker `MCC-B-PMP04`.
- **Step 3.2**: Depressurize suction and discharge isolation valves; lock valves in closed position with safety hasps.
- **Step 3.3**: Extract worn drive bearing M-204-B using hydraulic puller. Install spare spherical roller bearing `#BRG-M204-SPARE`.
- **Step 3.4**: Re-align pump shaft using laser alignment gauge (max allowable radial runout: 0.03 mm).
- **Step 3.5**: Execute 20-minute zero-load spin up test followed by step load ramp to 100% capacity.
"""
        ),
        SOPDocument(
            id="SOP-COOLING-PUMP",
            sop_code="SOP-COOLING-PUMP",
            title="Centrifugal Coolant Pump Pressure Loss & Circulation Backup Procedure",
            target_component="Coolant Impeller & Bypass Manifold",
            content_markdown="""# SOP-COOLING-PUMP: Coolant Circulation Loss Response
- **Step 1**: Switch coolant loop circulation to standby auxiliary pump PMP-102.
- **Step 2**: Inspect suction intake duplex strainer for swarf or particulate clogs.
- **Step 3**: Verify pressure differential transmitter across cartridge filtration bank (>0.8 bar indicates filter saturation).
- **Step 4**: Restore primary header pressure to 4.2 bar before resuming full-rate CNC machining cycles.
"""
        ),
        SOPDocument(
            id="SOP-POWER-GEN",
            sop_code="SOP-POWER-GEN",
            title="Industrial Switchgear & Motor Electrical Stability Protocol",
            target_component="Motor Control Centre & Inverter Drive",
            content_markdown="""# SOP-POWER-GEN: Electrical Power Stability Protocol
- **Step 1**: Verify 415V 3-phase line voltage balance across MCC busbars (max phase imbalance <1.5%).
- **Step 2**: Inspect variable frequency drive (VFD) DC bus voltage and braking chopper resistors.
- **Step 3**: Check earthing pit resistance (<1.0 Ohm) and motor terminal box gasket sealing.
"""
        ),
        SOPDocument(
            id="SOP-CMP301-OVERHEAT",
            sop_code="SOP-CMP301-OVERHEAT",
            title="CMP-301 Screw Air Compressor High Discharge Temperature Emergency Protocol",
            target_component="Air Compressor Cooler & Oil Thermostatic Valve",
            content_markdown="""# SOP-CMP301-OVERHEAT: Air Compressor Thermal Response
**Applicability:** CMP-301 Industrial Air Compressor (Utility Plant)

- **Step 1**: Verify air radiator cooling fan operation and clean external cooling matrix with compressed air wand.
- **Step 2**: Check compressor synthetic coolant oil level in sight glass while machine is running loaded.
- **Step 3**: Inspect thermostatic bypass valve `#TCV-301`; verify valve opens fully at 78°C to divert oil through cooler.
- **Step 4**: If discharge temperature exceeds 95°C, initiate controlled unload sequence and switch shop air supply to backup compressor CMP-302.
"""
        ),
        SOPDocument(
            id="SOP-CNC101-SPINDLE",
            sop_code="SOP-CNC101-SPINDLE",
            title="CNC-101 Spindle Vibration, Tool Runout & Bearing Balancing Protocol",
            target_component="CNC Spindle Cartridge & Tool Holder",
            content_markdown="""# SOP-CNC101-SPINDLE: CNC Spindle Vibration Diagnostic Procedure
**Applicability:** CNC-101 5-Axis Machining Centre (Line A)

- **Step 1**: Execute M05 spindle stop. Inspect BT40 tool holder taper and pull stud for debris, fretting, or pitting.
- **Step 2**: Mount dial test indicator on spindle nose; measure static radial runout (must be <0.003 mm).
- **Step 3**: Run spindle balancing routine at 2,000, 6,000, and 10,000 RPM using portable FFT vibration analyzer.
- **Step 4**: Check spindle chiller closed-circuit cooling water flow rate and jacket inlet temperature (18°C–20°C nominal).
"""
        ),
        SOPDocument(
            id="SOP-HYD105-PRESSURE",
            sop_code="SOP-HYD105-PRESSURE",
            title="HYD-105 Hydraulic Forming Press Valve & Pressure Drop Troubleshooting",
            target_component="Hydraulic Power Pack & Ram Proportional Valves",
            content_markdown="""# SOP-HYD105-PRESSURE: Hydraulic Press Pressure Stabilization
- **Step 1**: Lock press slide mechanically using safety arrestor ratchet pin.
- **Step 2**: Inspect main relief valve setpoint on central hydraulic block (target: 250 bar).
- **Step 3**: Check accumulator nitrogen pre-charge pressure (120 bar nominal).
- **Step 4**: Inspect cylinder piston gland seals for external weeping or internal bypass leakage.
"""
        ),
        SOPDocument(
            id="SOP-WLD202-WELD",
            sop_code="SOP-WLD202-WELD",
            title="WLD-202 Robotic Welding Cell Tip Dressing & Shielding Gas Verification",
            target_component="Robotic Welding Torch & Gas Flow Controller",
            content_markdown="""# SOP-WLD202-WELD: Robotic Welding Cell Quality Standard
- **Step 1**: Inspect copper contact tip orifice diameter; replace if worn by >0.2 mm over nominal wire gauge.
- **Step 2**: Verify Argon/CO2 shielding gas flow rate at torch nozzle (15–18 L/min).
- **Step 3**: Execute automatic weld torch cleaning and anti-spatter reaming cycle.
- **Step 4**: Run test weld bead coupon on scrap plate and verify weld penetration depth via macro-etch test.
"""
        ),
        SOPDocument(
            id="SOP-LOTO-SAFETY",
            sop_code="SOP-LOTO-SAFETY",
            title="Industrial Lockout / Tagout (LOTO) & Safe Isolation Standard",
            target_component="Plant-wide Electrical Breakers & Valve Stations",
            content_markdown="""# SOP-LOTO-SAFETY: Industrial Energy Isolation Protocol
**Standard:** OSHA 1910.147 / Indian Factories Act 1948 Safety Rules

- **Step 1 (Notify)**: Shift supervisor informs line operators of impending equipment shutdown.
- **Step 2 (Shut Down)**: Execute controlled equipment shutdown via operator console.
- **Step 3 (Isolate)**: Open main circuit breaker and close fluid isolation valves.
- **Step 4 (Lock & Tag)**: Attach individual red safety padlock and danger tag with technician contact details.
- **Step 5 (Dissipate)**: Discharge stored electrical capacitors and bleed hydraulic/pneumatic residual pressure.
- **Step 6 (Verify)**: Attempt restart to confirm zero energy state before maintenance personnel approach equipment.
"""
        )
    ]
    db.add_all(sops)
    db.commit()

    # -------------------------------------------------------------
    # 5. INCIDENTS (3 Active + 5 Historical = 8 Coherent Incidents)
    # Note: INC-M204-001 has newest created_at to be first in list.
    # -------------------------------------------------------------
    inc_m204 = Incident(
        id="INC-M204-001",
        machine_id="M-204",
        title="PMP-204 Centrifugal Pump Bearing Thermal Degradation",
        severity="CRITICAL",
        status="PENDING_APPROVAL",
        summary="Abnormal vibration spike (7.82 mm/s RMS vs 4.50 limit) and bearing temperature rise (88.4°C vs 75.0°C limit) detected on Coolant Circulation Pump PMP-204. Correlated with Maintenance Record MNT-882 indicating drive bearing lifetime exceeded by 2 months. Risk of catastrophic bearing seizure and Line B line trip.",
        created_at=now
    )

    inc_cmp = Incident(
        id="INC-CMP301-002",
        machine_id="M-305",
        title="CMP-301 Compressor Discharge Overheating & Pressure Fluctuation",
        severity="HIGH",
        status="INVESTIGATING",
        summary="Discharge air temperature reached 92.5°C (warning limit: 85.0°C) with discharge pressure falling to 7.08 bar on Air Compressor CMP-301. Likely cooling radiator airflow restriction or dirty air intake filters in Utility Bay 1.",
        created_at=now - timedelta(minutes=45)
    )

    inc_cnc = Incident(
        id="INC-CNC101-003",
        machine_id="M-101",
        title="CNC-101 Spindle Vibration & Machining Tolerance Drift",
        severity="MEDIUM",
        status="OPEN",
        summary="Spindle accelerometer detected harmonic vibration of 3.78 mm/s RMS during rough milling cycle on Cylinder Head Line A. Surface finish roughness tolerance degraded from Ra 0.8 to Ra 1.6.",
        created_at=now - timedelta(hours=2)
    )

    # 5 Historical Incidents (Resolved)
    hist_incidents = [
        Incident(
            id="INC-HYD105-004",
            machine_id="HYD-105",
            title="HYD-105 Hydraulic Forming Press Valve Gland Seal Weep",
            severity="MEDIUM",
            status="RESOLVED",
            summary="Hydraulic pressure dropped 15 bar during blank clamping stroke. Gland seal replaced under MNT-923.",
            created_at=now - timedelta(days=5),
            resolved_at=now - timedelta(days=5, hours=-2)
        ),
        Incident(
            id="INC-CON401-005",
            machine_id="CON-401",
            title="CON-401 Pallet Transfer Conveyor Drive Belt Tension Loss",
            severity="LOW",
            status="RESOLVED",
            summary="Belt slip caused 12-second pallet indexing delay. Belt retensioned under MNT-934.",
            created_at=now - timedelta(days=12),
            resolved_at=now - timedelta(days=12, hours=-1)
        ),
        Incident(
            id="INC-WLD202-006",
            machine_id="WLD-202",
            title="WLD-202 Robotic Welding Cell Tip Erosion Alert",
            severity="LOW",
            status="RESOLVED",
            summary="Automated vision inspection flagged marginal weld nugget diameter. Electrode cap dressed under MNT-945.",
            created_at=now - timedelta(days=18),
            resolved_at=now - timedelta(days=18, hours=-1)
        ),
        Incident(
            id="INC-MOT110-007",
            machine_id="MOT-110",
            title="MOT-110 Exhaust Fan Motor Winding Temperature Rise",
            severity="MEDIUM",
            status="RESOLVED",
            summary="Roof bay ambient thermal build-up caused motor winding temp to reach 72°C. Ventilation cowls cleaned.",
            created_at=now - timedelta(days=25),
            resolved_at=now - timedelta(days=25, hours=-3)
        ),
        Incident(
            id="INC-CHL501-008",
            machine_id="CHL-501",
            title="CHL-501 Chilled Water Flow Restriction Warning",
            severity="MEDIUM",
            status="RESOLVED",
            summary="Condenser fouling caused chiller COP to drop from 4.2 to 3.5. Chemical descaling completed under MNT-956.",
            created_at=now - timedelta(days=32),
            resolved_at=now - timedelta(days=32, hours=-4)
        )
    ]

    db.add_all([inc_m204, inc_cmp, inc_cnc] + hist_incidents)
    db.commit()

    # -------------------------------------------------------------
    # 6. EVIDENCE ITEMS FOR DEMO INCIDENTS
    # -------------------------------------------------------------
    evidence_items = [
        # Evidence for INC-M204-001
        Evidence(
            id="EVI-M204-01",
            incident_id="INC-M204-001",
            title="Telemetry Anomaly: High Vibration & Overheating Spike",
            description="Vibration amplitude increased from 1.80 mm/s baseline to 7.82 mm/s (+212%). Bearing temperature elevated from 52.0°C to 88.4°C (+33.4°C over nominal). Output coolant flow dropped from 99.0 to 61.6 m³/hour.",
            source_type="TELEMETRY_CORRELATION",
            confidence_score=94.5
        ),
        Evidence(
            id="EVI-M204-02",
            incident_id="INC-M204-001",
            title="Maintenance Record: Rated Bearing Lifespan Exceeded",
            description="Maintenance Log #MNT-882 records last drive bearing replacement 14 months ago. Manufacturer rated maximum continuous operational lifetime is 12 months under 24/7 automotive production load.",
            source_type="MAINTENANCE_LOG",
            confidence_score=91.0
        ),
        Evidence(
            id="EVI-M204-03",
            incident_id="INC-M204-001",
            title="Production Exposure: Line B Machining Stoppage Risk",
            description="Loss of primary cooling water circulation will trigger spindle thermal interlocks on 4 downstream CNC centres within 15 minutes, causing an estimated ₹3,06,000 in direct production value affected.",
            source_type="OPERATIONAL_HISTORY",
            confidence_score=96.0
        ),
        # Evidence for INC-CMP301-002
        Evidence(
            id="EVI-CMP301-01",
            incident_id="INC-CMP301-002",
            title="Discharge Air Thermal Limit Breach (92.5°C)",
            description="Discharge air sensor TT-301 breached the 85.0°C threshold, climbing to 92.5°C over a 3-hour period. Discharge air pressure degraded from 8.4 bar to 7.08 bar.",
            source_type="TELEMETRY_CORRELATION",
            confidence_score=89.0
        ),
        Evidence(
            id="EVI-CMP301-02",
            incident_id="INC-CMP301-002",
            title="Radiator Cooler Matrix External Fouling",
            description="Utility bay ambient dust accumulation on compressor cooling radiator matrix. Thermostatic bypass valve operating at maximum opening.",
            source_type="OPERATIONAL_HISTORY",
            confidence_score=84.0
        ),
        # Evidence for INC-CNC101-003
        Evidence(
            id="EVI-CNC101-01",
            incident_id="INC-CNC101-003",
            title="Spindle Harmonic Vibration Anomaly (3.78 mm/s RMS)",
            description="Spindle accelerometer detected 3.78 mm/s RMS vibration at 10,000 RPM spindle speed during face milling of aluminium cylinder heads.",
            source_type="TELEMETRY_CORRELATION",
            confidence_score=86.5
        )
    ]
    db.add_all(evidence_items)
    db.commit()

    # -------------------------------------------------------------
    # 7. ACTION RECOMMENDATIONS
    # -------------------------------------------------------------
    actions = [
        # Primary Action for INC-M204-001 (Human approval required)
        ActionRecommendation(
            id="ACT-M204-01",
            incident_id="INC-M204-001",
            sop_id="SOP-M204-BEARING",
            action_title="Throttle Pump Load & Execute Auxiliary Lubricant Injection",
            description="Step 1: Reduce PMP-204 pump hydraulic motor load to 25% capacity via SCADA setpoint. Step 2: Engage secondary coolant pump PMP-102 into parallel recirculation loop. Step 3: Inject high-viscosity synthetic lubricant flush #LUB-SYN-900 into bearing chamber B. Step 4: Dispatch emergency mechanical overhaul team with spare bearing #BRG-M204-SPARE.",
            priority="CRITICAL",
            human_approved=False
        ),
        # Action for INC-CMP301-002
        ActionRecommendation(
            id="ACT-CMP301-01",
            incident_id="INC-CMP301-002",
            sop_id="SOP-CMP301-OVERHEAT",
            action_title="Clean Radiator Matrix & Verify Thermostatic Valve Opening",
            description="Step 1: Clean external radiator cooling fins with compressed air wand. Step 2: Verify compressor oil level in sight glass. Step 3: Verify thermostatic bypass valve TCV-301 operates freely.",
            priority="HIGH",
            human_approved=False
        ),
        # Action for INC-CNC101-003
        ActionRecommendation(
            id="ACT-CNC101-01",
            incident_id="INC-CNC101-003",
            sop_id="SOP-CNC101-SPINDLE",
            action_title="Inspect Tool Holder Taper & Verify Spindle Runout",
            description="Step 1: Inspect BT40 tool holder taper for galling. Step 2: Measure static radial spindle runout with dial indicator. Step 3: Execute spindle dynamic balancing test at 6,000 RPM.",
            priority="MEDIUM",
            human_approved=False
        )
    ]
    db.add_all(actions)
    db.commit()

    # Seed baseline audit genesis events for INC-M204-001 with SHA-256 hash chaining
    from app.services.audit_service import AuditService
    AuditService.record_event(
        db=db,
        incident_id="INC-M204-001",
        actor_type="SYSTEM_MONITOR",
        actor_id="SCADA_Detector_ZScore",
        action_type="ANOMALY_BREACH_DETECTED",
        details={
            "machine_id": "M-204",
            "vibration_mm_s": 7.82,
            "vibration_threshold": 4.5,
            "temp_celsius": 88.4,
            "temp_threshold": 75.0,
            "severity": "CRITICAL",
            "detection": "Vibration harmonic breach (Z-score +3.83)"
        }
    )
    AuditService.record_event(
        db=db,
        incident_id="INC-M204-001",
        actor_type="AGENT_RUNTIME",
        actor_id="MultiAgentOrchestrator",
        action_type="RECOMMENDATION_FORMULATED",
        details={
            "incident_id": "INC-M204-001",
            "sop_code": "SOP-M204-BEARING",
            "plan": "Throttle PMP-204 pump hydraulic motor load to 25% capacity. Engage secondary pump PMP-102.",
            "estimated_production_loss_inr": 306000.0,
            "requires_human_approval": True
        }
    )

    print("Pune Automotive Components Manufacturing Plant dataset seeded successfully.")
    print("DEMO DATA — SIMULATED INDUSTRIAL ENVIRONMENT (Chakan MIDC, Pune)")


def seed_database():
    """Drop and recreate database with synthetic demo data."""
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        populate_seed_data(db)
    finally:
        db.close()


def seed_database_if_empty(db=None):
    """Seed initial demo data if Machine table is empty (idempotent for deployment)."""
    close_on_exit = False
    if db is None:
        db = SessionLocal()
        close_on_exit = True
    try:
        existing = db.query(Machine).first()
        if existing:
            return False
        populate_seed_data(db)
        return True
    finally:
        if close_on_exit:
            db.close()


if __name__ == "__main__":
    seed_database()
