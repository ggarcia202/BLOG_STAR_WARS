import os

from flask import Flask, jsonify
from flask_cors import CORS

from models import db, User, People, Planet, FavoritePeople, FavoritePlanet
from seed import seed_data


def create_app():
    app = Flask(__name__)
    CORS(app)

    db_path = os.getenv("DATABASE_URL", "sqlite:///starwars_blog.db")
    app.config["SQLALCHEMY_DATABASE_URI"] = db_path
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["CURRENT_USER_ID"] = int(os.getenv("CURRENT_USER_ID", "1"))

    db.init_app(app)

    with app.app_context():
        db.create_all()
        seed_data()

    @app.get("/")
    def index():
        return (
            jsonify(
                {
                    "msg": "Star Wars Blog API running",
                    "endpoints": [
                        "/people",
                        "/people/<people_id>",
                        "/planets",
                        "/planets/<planet_id>",
                        "/users",
                        "/users/favorites",
                        "/favorite/people/<people_id>",
                        "/favorite/planet/<planet_id>",
                    ],
                }
            ),
            200,
        )

    @app.get("/people")
    def get_people():
        people = People.query.all()
        return jsonify([person.serialize() for person in people]), 200

    @app.get("/people/<int:people_id>")
    def get_person(people_id):
        person = People.query.get(people_id)
        if not person:
            return jsonify({"msg": "Person not found"}), 404
        return jsonify(person.serialize()), 200

    @app.get("/planets")
    def get_planets():
        planets = Planet.query.all()
        return jsonify([planet.serialize() for planet in planets]), 200

    @app.get("/planets/<int:planet_id>")
    def get_planet(planet_id):
        planet = Planet.query.get(planet_id)
        if not planet:
            return jsonify({"msg": "Planet not found"}), 404
        return jsonify(planet.serialize()), 200

    @app.get("/users")
    def get_users():
        users = User.query.all()
        return jsonify([user.serialize() for user in users]), 200

    @app.get("/users/favorites")
    def get_user_favorites():
        user = User.query.get(app.config["CURRENT_USER_ID"])
        if not user:
            return jsonify({"msg": "Current user not found"}), 404

        favorites = [
            *[favorite.serialize() for favorite in user.people_favorites],
            *[favorite.serialize() for favorite in user.planet_favorites],
        ]
        return jsonify(favorites), 200

    @app.post("/favorite/people/<int:people_id>")
    def add_people_favorite(people_id):
        user_id = app.config["CURRENT_USER_ID"]
        user = User.query.get(user_id)
        person = People.query.get(people_id)

        if not user:
            return jsonify({"msg": "Current user not found"}), 404
        if not person:
            return jsonify({"msg": "Person not found"}), 404

        exists = FavoritePeople.query.filter_by(user_id=user_id, people_id=people_id).first()
        if exists:
            return jsonify({"msg": "Favorite already exists"}), 409

        favorite = FavoritePeople(user_id=user_id, people_id=people_id)
        db.session.add(favorite)
        db.session.commit()
        return jsonify({"msg": "Favorite person created"}), 201

    @app.post("/favorite/planet/<int:planet_id>")
    def add_planet_favorite(planet_id):
        user_id = app.config["CURRENT_USER_ID"]
        user = User.query.get(user_id)
        planet = Planet.query.get(planet_id)

        if not user:
            return jsonify({"msg": "Current user not found"}), 404
        if not planet:
            return jsonify({"msg": "Planet not found"}), 404

        exists = FavoritePlanet.query.filter_by(user_id=user_id, planet_id=planet_id).first()
        if exists:
            return jsonify({"msg": "Favorite already exists"}), 409

        favorite = FavoritePlanet(user_id=user_id, planet_id=planet_id)
        db.session.add(favorite)
        db.session.commit()
        return jsonify({"msg": "Favorite planet created"}), 201

    @app.delete("/favorite/people/<int:people_id>")
    def delete_people_favorite(people_id):
        user_id = app.config["CURRENT_USER_ID"]
        favorite = FavoritePeople.query.filter_by(user_id=user_id, people_id=people_id).first()
        if not favorite:
            return jsonify({"msg": "Favorite person not found"}), 404

        db.session.delete(favorite)
        db.session.commit()
        return jsonify({"msg": "Favorite person deleted"}), 200

    @app.delete("/favorite/planet/<int:planet_id>")
    def delete_planet_favorite(planet_id):
        user_id = app.config["CURRENT_USER_ID"]
        favorite = FavoritePlanet.query.filter_by(user_id=user_id, planet_id=planet_id).first()
        if not favorite:
            return jsonify({"msg": "Favorite planet not found"}), 404

        db.session.delete(favorite)
        db.session.commit()
        return jsonify({"msg": "Favorite planet deleted"}), 200

    return app


app = create_app()

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)
