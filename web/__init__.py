from flask import Flask
from flask_mysqldb import MySQL

webapp = Flask(__name__)
webapp.config.from_object('config')
db = MySQL(webapp)

from web import views, models

