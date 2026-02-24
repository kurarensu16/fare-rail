from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import os

import models
import schemas
import database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI(title="FareRail API")

# Allow all origins in dev; set CORS_ORIGINS env var in production (comma-separated)
cors_origins_env = os.getenv("CORS_ORIGINS", "*")
cors_origins = cors_origins_env.split(",") if cors_origins_env != "*" else ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/stations", response_model=List[schemas.Station])
def get_stations(
    transport: Optional[str] = None, db: Session = Depends(database.get_db)
):
    query = db.query(models.Station)
    if transport:
        query = query.filter(models.Station.transport_type == transport.upper())
    return query.order_by(models.Station.station_order).all()


@app.post("/calculate_fare", response_model=schemas.FareCalculationResponse)
def calculate_fare(
    req: schemas.FareCalculationRequest, db: Session = Depends(database.get_db)
):
    fare_record = (
        db.query(models.Fare)
        .filter(
            models.Fare.origin_station_id == req.origin_station_id,
            models.Fare.destination_station_id == req.destination_station_id,
        )
        .first()
    )

    if not fare_record:
        raise HTTPException(
            status_code=404, detail="Fare route not found between these stations"
        )

    # Pick fare based on ticket type
    if req.ticket_type == "sjt":
        original_fare = fare_record.sjt_fare
    else:
        original_fare = fare_record.svc_fare

    # Check for discount
    discount_rate = 0.0
    if req.passenger_type.lower() != "regular":
        discount_record = (
            db.query(models.Discount)
            .filter(models.Discount.passenger_type == req.passenger_type.lower())
            .first()
        )
        if discount_record:
            discount_rate = discount_record.discount_rate

    final_fare = round(original_fare * (1.0 - discount_rate), 2)

    return {
        "fare": final_fare,
        "original_fare": original_fare,
        "discount_rate": discount_rate,
        "ticket_type": req.ticket_type,
    }


@app.get("/fare_matrix")
def get_fare_matrix(
    transport: Optional[str] = None, db: Session = Depends(database.get_db)
):
    query = db.query(models.Fare)

    if transport:
        station_ids = [
            s.id
            for s in db.query(models.Station)
            .filter(models.Station.transport_type == transport.upper())
            .all()
        ]
        query = query.filter(models.Fare.origin_station_id.in_(station_ids))

    fares = query.all()
    result = []
    for f in fares:
        result.append(
            {
                "id": f.id,
                "origin_station_id": f.origin_station_id,
                "destination_station_id": f.destination_station_id,
                "origin_name": f.origin.name,
                "destination_name": f.destination.name,
                "sjt_fare": f.sjt_fare,
                "svc_fare": f.svc_fare,
            }
        )
    return result
