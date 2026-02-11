from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)

    people_favorites = db.relationship(
        "FavoritePeople", back_populates="user", cascade="all, delete-orphan"
    )
    planet_favorites = db.relationship(
        "FavoritePlanet", back_populates="user", cascade="all, delete-orphan"
    )

    def serialize(self):
        return {"id": self.id, "username": self.username, "email": self.email}


class People(db.Model):
    __tablename__ = "people"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    gender = db.Column(db.String(50), nullable=True)
    birth_year = db.Column(db.String(20), nullable=True)
    eye_color = db.Column(db.String(50), nullable=True)

    favorited_by = db.relationship(
        "FavoritePeople", back_populates="people", cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "gender": self.gender,
            "birth_year": self.birth_year,
            "eye_color": self.eye_color,
        }


class Planet(db.Model):
    __tablename__ = "planets"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    climate = db.Column(db.String(120), nullable=True)
    terrain = db.Column(db.String(120), nullable=True)
    population = db.Column(db.String(120), nullable=True)

    favorited_by = db.relationship(
        "FavoritePlanet", back_populates="planet", cascade="all, delete-orphan"
    )

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "climate": self.climate,
            "terrain": self.terrain,
            "population": self.population,
        }


class FavoritePeople(db.Model):
    __tablename__ = "favorite_people"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    people_id = db.Column(db.Integer, db.ForeignKey("people.id"), nullable=False)

    user = db.relationship("User", back_populates="people_favorites")
    people = db.relationship("People", back_populates="favorited_by")

    __table_args__ = (db.UniqueConstraint("user_id", "people_id"),)

    def serialize(self):
        return {"id": self.id, "type": "people", "item": self.people.serialize()}


class FavoritePlanet(db.Model):
    __tablename__ = "favorite_planet"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    planet_id = db.Column(db.Integer, db.ForeignKey("planets.id"), nullable=False)

    user = db.relationship("User", back_populates="planet_favorites")
    planet = db.relationship("Planet", back_populates="favorited_by")

    __table_args__ = (db.UniqueConstraint("user_id", "planet_id"),)

    def serialize(self):
        return {"id": self.id, "type": "planet", "item": self.planet.serialize()}
