from flask import render_template

from web.database import get_closest_parking_slots
from web.models import Location
from web import webapp, db


@webapp.route('/')
@webapp.route('/index')
def index():
    get_closest_parking_slots(Location(3,4))
    user = {'nickname': 'David'}  # fake user
    return render_template('index.html',
                           title='Home',
                           user=user)
