from app.models.hero import Hero
from app.schemas.hero import HeroCreate, HeroResponse, HeroFilter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, any_
from typing import List


class HeroService:


    @staticmethod
    async def add_hero(data: HeroCreate, db: AsyncSession) -> List[HeroResponse]:

        payload = data.model_dump()
        payload["gender"] = data.gender.value
        payload["height"] = data.height.value
        payload["age"] = data.age.value

        db_hero = Hero(**payload)

        db.add(db_hero)
        await db.commit()
        await db.refresh(db_hero)

        return HeroResponse.model_validate(db_hero)
    

    @staticmethod
    async def choice_hero(data: HeroFilter, db: AsyncSession) -> HeroResponse:

        query = select(Hero)

        # Фильтры по полям с одним значением
        if data.gender:
            query = query.where(Hero.gender == data.gender.value)

        if data.height:
            query = query.where(Hero.height == data.height.value)

        if data.age:
            query = query.where(Hero.age == data.age.value)

        # Фильтры по характеру
        if data.character:
            for ch in data.character:
                query = query.where(ch.lower() == any_(Hero.character))

        # Фильтр по признакам
        if data.traits:
            for tr in data.traits:
                query = query.where(tr.lower() == any_(Hero.traits))

        result = await db.execute(query)
        heroes = result.scalars().all()

        return [HeroResponse.model_validate(h) for h in heroes]