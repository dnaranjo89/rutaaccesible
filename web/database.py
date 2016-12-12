from web import db
from web.models import ParkingSlot

def get_closest_parking_slots(location):
    parking_slots = ParkingSlot.query.filter_by(id=48).first()
    db.engine.execute('select * from parking_slot')
    print(parking_slots)

