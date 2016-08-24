from web import db
from web.models import ParkingSlot

def get_closest_parking_slots(location):
    parking_slots = ParkingSlot.query.filter_by(id=48).first()
    db.engine.execute('select * from parking_slot')
    print(parking_slots)


'''
http://www.plumislandmedia.net/mysql/haversine-mysql-nearest-loc/

SELECT id, pos_lat, pos_long,
      111.045* DEGREES(ACOS(COS(RADIANS(latpoint))
                 * COS(RADIANS(pos_lat))
                 * COS(RADIANS(longpoint) - RADIANS(pos_long))
                 + SIN(RADIANS(latpoint))
                 * SIN(RADIANS(pos_lat)))) AS distance_in_km
 FROM parking_slot
 JOIN (
     SELECT  39.472  AS latpoint,  -6.40567 AS longpoint
   ) AS p ON 1=1
 ORDER BY distance_in_km
 LIMIT 15;
'''