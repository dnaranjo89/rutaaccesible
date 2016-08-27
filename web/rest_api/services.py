from flask import jsonify
from flask.ext.restful import reqparse
from flask_restful import Resource, Api

from web import webapp
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
        lat = parser.add_argument('lat', type=float)
        lng = parser.add_argument('lng', type=float)
        eee = parser.parse_args()

        return ParkingSlot.query.filter_by(id=id).first().serialize


# api.add_resource(ParkingSlotListAPI, '/api/v1.0/parking_slot')
api.add_resource(ParkingSlotAPI, '/api/v1.0/parking_slot/<int:id>')
api.add_resource(ClosestParkingSlotAPI, '/api/v1.0/parking_slot')
