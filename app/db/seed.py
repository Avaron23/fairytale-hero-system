import asyncio
from sqlalchemy import select
from app.db.db import async_session_maker
from app.models.hero import Hero

# Нормализация характера в мужской род
GENDER_NORMALIZATION = {
    "злая": "злой",
    "добрая": "добрый",
    "смелая": "смелый",
    "хитрая": "хитрый",
    "умная": "умный",
    "сильная": "сильный",
    "мудрая": "мудрый",
    "красивая": "красивый",
}

def normalize_character(chars: list[str]) -> list[str]:
    result = []
    for c in chars:
        c = c.lower().strip()
        result.append(GENDER_NORMALIZATION.get(c, c))
    return result


heroes_data = [
    {
        "name": "леший",
        "height": "высокий",
        "age": "взрослый",
        "gender": "мужской",
        "character": ["хитрый", "непредсказуемый"],
        "traits": ["лесной", "магия", "зеленый"]
    },
    {
        "name": "баба яга",
        "height": "средний",
        "age": "старый",
        "gender": "женский",
        "character": ["злая", "хитрая"],
        "traits": ["магия", "метла", "лесная"]
    },
    {
        "name": "водяной",
        "height": "средний",
        "age": "взрослый",
        "gender": "мужской",
        "character": ["спокойный"],
        "traits": ["вода", "болото", "холод"]
    },
    {
        "name": "кощей",
        "height": "высокий",
        "age": "старый",
        "gender": "мужской",
        "character": ["злой", "коварный"],
        "traits": ["бессмертие", "магия", "кость"]
    },
    {
        "name": "жар-птица",
        "height": "средний",
        "age": "молодой",
        "gender": "женский",
        "character": ["добрая"],
        "traits": ["огонь", "крылья", "свет"]
    },
    {
        "name": "русалка",
        "height": "средний",
        "age": "молодой",
        "gender": "женский",
        "character": ["красивая", "добрая"],
        "traits": ["вода", "пение", "хвост"]
    },
    {
        "name": "домовой",
        "height": "низкий",
        "age": "старый",
        "gender": "мужской",
        "character": ["мудрый", "спокойный"],
        "traits": ["дом", "печь", "уют"]
    },
    {
        "name": "кикимора",
        "height": "низкий",
        "age": "взрослый",
        "gender": "женский",
        "character": ["злая", "хитрая"],
        "traits": ["болото", "тьма", "скрип"]
    },
    {
        "name": "змей горыныч",
        "height": "высокий",
        "age": "взрослый",
        "gender": "мужской",
        "character": ["яростный", "сильный"],
        "traits": ["огонь", "крылья", "три головы"]
    },
    {
        "name": "алконост",
        "height": "средний",
        "age": "взрослый",
        "gender": "женский",
        "character": ["добрая", "мудрая"],
        "traits": ["пение", "крылья", "райская птица"]
    },
    {
        "name": "сирин",
        "height": "средний",
        "age": "взрослый",
        "gender": "женский",
        "character": ["печальная", "мудрая"],
        "traits": ["пение", "крылья", "тайна"]
    },
    {
        "name": "полудница",
        "height": "высокий",
        "age": "взрослый",
        "gender": "женский",
        "character": ["злая"],
        "traits": ["жара", "поле", "солнце"]
    },
    {
        "name": "морозко",
        "height": "высокий",
        "age": "старый",
        "gender": "мужской",
        "character": ["строгий", "справедливый"],
        "traits": ["мороз", "лед", "зима"]
    },
    {
        "name": "ведьмак",
        "height": "высокий",
        "age": "взрослый",
        "gender": "мужской",
        "character": ["хитрый", "мудрый"],
        "traits": ["магия", "зелья", "меч"]
    },
    {
        "name": "берегиня",
        "height": "средний",
        "age": "взрослый",
        "gender": "женский",
        "character": ["добрая", "мудрая"],
        "traits": ["вода", "защита", "чистота"]
    }
]


async def seed():
    async with async_session_maker() as session:
        for hero in heroes_data:

            # нормализация характера
            hero["character"] = normalize_character(hero["character"])

            # проверка на существование
            result = await session.execute(
                select(Hero).where(Hero.name == hero["name"])
            )
            exists = result.scalar_one_or_none()

            if exists:
                print(f"Герой '{hero['name']}' уже существует, пропускаю")
                continue

            db_hero = Hero(**hero)
            session.add(db_hero)

        await session.commit()
        print("База успешно заполнена!")


if __name__ == "__main__":
    asyncio.run(seed())
