from app.models.hero import Hero
from app.schemas.hero import HeroCreate, HeroResponse, HeroFilter
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, any_
from typing import List


def normalize_trait(word: str) -> str:
    """
    Нормализует характеристику, убирая женские окончания русских прилагательных.
    Примеры: лесная -> лесной, красивая -> красивый, злая -> злой
    """
    word = word.lower().strip()
    
    # Убираем женские окончания
    if word.endswith('ная'):
        # лесная -> лесной, черная -> черный
        return word[:-3] + 'ной'
    elif word.endswith('ая'):
        # красивая -> красивый, добрая -> добрый, злая -> злой
        return word[:-2] + 'ый'
    elif word.endswith('яя'):
        # синяя -> синий
        return word[:-2] + 'ий'
    
    return word


class HeroService:

    @staticmethod
    async def add_hero(data: HeroCreate, db: AsyncSession) -> List[HeroResponse]:

        payload = data.model_dump()
        payload["gender"] = data.gender.value
        payload["height"] = data.height.value
        payload["age"] = data.age.value
        
        # Нормализуем характеры и трейты (убираем женские окончания)
        payload["character"] = [normalize_trait(ch) for ch in payload.get("character", [])]
        payload["traits"] = [normalize_trait(tr) for tr in payload.get("traits", [])]

        db_hero = Hero(**payload)

        db.add(db_hero)
        await db.commit()
        await db.refresh(db_hero)

        return HeroResponse.model_validate(db_hero)
    

    @staticmethod
    async def choice_hero(data: HeroFilter, db: AsyncSession) -> List[HeroResponse]:

        query = select(Hero)

        # Фильтры по полям с одним значением
        if data.gender:
            query = query.where(Hero.gender == data.gender.value)

        if data.height:
            query = query.where(Hero.height == data.height.value)

        if data.age:
            query = query.where(Hero.age == data.age.value)

        # Фильтры по характеру (нормализуем при поиске)
        if data.character:
            for ch in data.character:
                normalized_ch = normalize_trait(ch).lower()
                query = query.where(normalized_ch == any_(Hero.character))

        # Фильтр по признакам (нормализуем при поиске)
        if data.traits:
            for tr in data.traits:
                normalized_tr = normalize_trait(tr).lower()
                query = query.where(normalized_tr == any_(Hero.traits))

        result = await db.execute(query)
        heroes = result.scalars().all()

        return [HeroResponse.model_validate(h) for h in heroes]