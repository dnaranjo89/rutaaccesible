from flask import jsonify
from flask_restful import Resource, Api

from web import webapp
from web.models import ParkingSlot

api = Api(webapp)

class ParkingSlotResource(Resource):
    def get(self):
        parking_slots = ParkingSlot.query.all()
        return jsonify([parking_slot.serialize for parking_slot in parking_slots])

api.add_resource(ParkingSlotResource, '/test_api')
