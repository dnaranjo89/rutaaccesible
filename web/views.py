from flask import render_template

from web import webapp, db


@webapp.route('/')
@webapp.route('/index')
def index():
    cur = db.connection.cursor()
    cur.execute('''SELECT * FROM sakila.actor''')
    rv = cur.fetchall()
    user = {'nickname': 'David'}  # fake user
    return render_template('index.html',
                           title='Home',
                           user=user)
