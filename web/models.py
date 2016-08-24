from collections import namedtuple

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

