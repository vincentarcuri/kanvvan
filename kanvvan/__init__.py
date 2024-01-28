import os

from flask import Flask

def create_app():
    app = Flask(__name__, instance_relative_config=True)
    app.config.from_mapping(
        DATABASE=os.path.join(app.instance_path, "kanvvan.sqlite")
    )

    try:
        os.makedirs(app.instance_path)
    except OSError:
        pass
    
    from . import db
    db.init_app(app)

    from . import home
    app.register_blueprint(home.bp)
    app.add_url_rule("/", endpoint="index")


    return app