from collections import namedtuple

from flask import jsonify
from sqlalchemy import text

from web import db


Location = namedtuple('Location', 'lat lng')


class ParkingSlot(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    pos_lat = db.Column(db.Float, nullable=False)
    pos_long = db.Column(db.Float, nullable=False)
    extra_info = db.Column(db.Text)

    def __init__(self, pos_lat, pos_long, extra_info):
        self.pos_lat = pos_lat
        self.pos_long = pos_long
        self.extra_info = extra_info

    @property
    def serialize(self):
       """Return object data in easily serializeable format"""
       return {
           'id': self.id,
           'pos_lat': self.pos_lat,
           'pos_long': self.pos_long,
           'extra_info': self.extra_info,
       }

    @staticmethod
    def get_closest(lat, lng):
        sql = text('SELECT id, pos_lat, pos_long, extra_info,'
                   '      111.045* DEGREES(ACOS(COS(RADIANS(latpoint))'
                   '                 * COS(RADIANS(pos_lat))'
                   '                 * COS(RADIANS(longpoint) - RADIANS(pos_long))'
                   '                 + SIN(RADIANS(latpoint))'
                   '                 * SIN(RADIANS(pos_lat)))) AS distance_in_km'
                   ' FROM parking_slot'
                   ' JOIN ('
                   '     SELECT  39.472  AS latpoint,  -6.40567 AS longpoint'
                   '   ) AS p ON 1=1'
                   ' ORDER BY distance_in_km'
                   ' LIMIT 15;')
        result = db.session.execute(sql).first()
        response = {
            'lat': result[1],
            'lng': result[2],
            'info': result[3],
            'distance': result[4]
        }
        return jsonify(response)





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


