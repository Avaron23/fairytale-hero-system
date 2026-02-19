from app.models.hero import Hero
from app.schemas.hero import HeroCreate, HeroResponse
from sqlalchemy.ext.asyncio import AsyncSession


class HeroService:

    @staticmethod
    async def add_hero(data: HeroCreate, db: AsyncSession) -> HeroResponse:

        payload = data.model_dump()
        payload["gender"] = data.gender.value
        payload["height"] = data.height.value
        payload["age"] = data.age.value

        db_hero = Hero(**payload)

        db.add(db_hero)
        await db.commit()
        await db.refresh(db_hero)

        return HeroResponse.model_validate(db_hero)