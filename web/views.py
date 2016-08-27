from flask import render_template

from web.database import get_closest_parking_slots
from web.models import Location, ParkingSlot
from web import webapp, db


@webapp.route('/index')
@webapp.route('/')
def index():
    get_closest_parking_slots(Location(3,4))
    return render_template('index.html')

@webapp.route('/test')
def test():
    parking_slots = ParkingSlot.query.all()
    return render_template('index.html',
                           parking_slots=parking_slots)
