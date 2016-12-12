from sqlalchemy.engine.url import URL


DB_NAME = "rutaaccesible"

SQLALCHEMY_DATABASE_URI = URL(drivername='mysql', host='localhost',
                              database=DB_NAME,
                              query={'read_default_file': '~/.my.cnf'}
                              )
