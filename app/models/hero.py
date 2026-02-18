from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Integer
from sqlalchemy.dialects.postgresql import ARRAY
from app.db.base import Base
from typing import List


class Hero(Base):
    __tablename__ = "heroes"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String, unique=True)
    gender: Mapped[str] = mapped_column(String)
    height: Mapped[str] = mapped_column(String)
    age: Mapped[str] = mapped_column(String)
    character: Mapped[List[str]] = mapped_column(ARRAY(String))
    traits: Mapped[List[str]] = mapped_column(ARRAY(String))
