from pydantic import BaseModel


class StationBase(BaseModel):
    name: str
    transport_type: str


class Station(StationBase):
    id: int
    station_order: int

    class Config:
        from_attributes = True


class FareCalculationRequest(BaseModel):
    origin_station_id: int
    destination_station_id: int
    passenger_type: str  # 'regular', 'student', 'senior', 'pwd'
    ticket_type: str = "svc"  # 'sjt' or 'svc'


class FareCalculationResponse(BaseModel):
    fare: float
    original_fare: float
    discount_rate: float
    ticket_type: str
