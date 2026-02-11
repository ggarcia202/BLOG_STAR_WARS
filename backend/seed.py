from models import db, User, People, Planet


def seed_data():
    if User.query.count() == 0:
        db.session.add_all(
            [
                User(username="luke_fan", email="luke@starwars.com"),
                User(username="leia_fan", email="leia@starwars.com"),
            ]
        )

    if People.query.count() == 0:
        db.session.add_all(
            [
                People(
                    name="Luke Skywalker",
                    gender="male",
                    birth_year="19BBY",
                    eye_color="blue",
                ),
                People(
                    name="Leia Organa",
                    gender="female",
                    birth_year="19BBY",
                    eye_color="brown",
                ),
                People(
                    name="Darth Vader",
                    gender="male",
                    birth_year="41.9BBY",
                    eye_color="yellow",
                ),
            ]
        )

    if Planet.query.count() == 0:
        db.session.add_all(
            [
                Planet(
                    name="Tatooine",
                    climate="arid",
                    terrain="desert",
                    population="200000",
                ),
                Planet(
                    name="Alderaan",
                    climate="temperate",
                    terrain="grasslands, mountains",
                    population="2000000000",
                ),
                Planet(
                    name="Hoth",
                    climate="frozen",
                    terrain="tundra, ice caves",
                    population="unknown",
                ),
            ]
        )

    db.session.commit()
