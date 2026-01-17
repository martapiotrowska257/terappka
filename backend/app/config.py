class Config:
    SQLALCHEMY_DATABASE_URI = 'mysql+mysqlconnector://terappka:admin1@localhost:3306/terappka_db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_SECRET_KEY = 'your_jwt_secret_key_here'