import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

env_db_url = os.getenv("DATABASE_URL")

if not env_db_url:
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(backend_dir)
    db_file = os.path.join(root_dir, "zoom_clone.db")
    DATABASE_URL = f"sqlite:///{db_file}"
elif env_db_url.startswith("sqlite:///./"):
    backend_dir = os.path.dirname(os.path.abspath(__file__))
    root_dir = os.path.dirname(backend_dir)
    rel_path = env_db_url.replace("sqlite:///./", "")
    db_file = os.path.join(root_dir, rel_path)
    DATABASE_URL = f"sqlite:///{db_file}"
else:
    DATABASE_URL = env_db_url

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
