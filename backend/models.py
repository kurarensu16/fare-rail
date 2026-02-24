from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Station(Base):
    __tablename__ = "stations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True, nullable=False)
    transport_type = Column(String, index=True, nullable=False)
    station_order = Column(Integer, nullable=False, default=0)


class Fare(Base):
    __tablename__ = "fares"

    id = Column(Integer, primary_key=True, index=True)
    origin_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    destination_station_id = Column(Integer, ForeignKey("stations.id"), nullable=False)
    sjt_fare = Column(Float, nullable=False)  # Single Journey Ticket
    svc_fare = Column(Float, nullable=False)  # Stored Value Card (Beep)

    origin = relationship("Station", foreign_keys=[origin_station_id])
    destination = relationship("Station", foreign_keys=[destination_station_id])


class Discount(Base):
    __tablename__ = "discounts"

    id = Column(Integer, primary_key=True, index=True)
    passenger_type = Column(String, unique=True, index=True, nullable=False)
    discount_rate = Column(Float, nullable=False)
