from flask import jsonify
from flask.ext.restful import reqparse
from flask_restful import Resource, Api
from sqlalchemy import text

from web import webapp, db
from web.models import ParkingSlot

api = Api(webapp)


class ParkingSlotListAPI(Resource):
    def get(self):
        parking_slots = ParkingSlot.query.all()
        return jsonify([parking_slot.serialize for parking_slot in parking_slots])


class ParkingSlotAPI(Resource):
    def get(self, id):
        return ParkingSlot.query.filter_by(id=id).first().serialize


class ClosestParkingSlotAPI(Resource):
    def get(self):
        parser = reqparse.RequestParser()
        parser.add_argument('lat', type=float)
        parser.add_argument('lng', type=float)
        args = parser.parse_args()
        num_results = 5

        sql = text('SELECT id, pos_lat, pos_long, extra_info,'
                   '      111.045* DEGREES(ACOS(COS(RADIANS(latpoint))'
                   '                 * COS(RADIANS(pos_lat))'
                   '                 * COS(RADIANS(longpoint) - RADIANS(pos_long))'
                   '                 + SIN(RADIANS(latpoint))'
                   '                 * SIN(RADIANS(pos_lat)))) AS distance_in_km'
                   ' FROM parking_slot'
                   ' JOIN ('
                   '     SELECT  {}  AS latpoint,  {} AS longpoint'
                   '   ) AS p ON 1=1'
                   ' ORDER BY distance_in_km'
                   ' LIMIT {};'.format(args.lat, args.lng, num_results))
        result = db.session.execute(sql).first()
        response = {
            'lat': result[1],
            'lng': result[2],
            'info': result[3],
            'distance': result[4]
        }
        return jsonify(response)


# api.add_resource(ParkingSlotListAPI, '/api/v1.0/parking_slot')
api.add_resource(ParkingSlotAPI, '/api/v1.0/parking_slot/<int:id>')
api.add_resource(ClosestParkingSlotAPI, '/api/v1.0/parking_slot')
