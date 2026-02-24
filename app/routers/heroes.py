from fastapi import APIRouter, Depends
from app.schemas.hero import HeroResponse, HeroCreate, HeroFilter
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.db import get_db
from app.services.heroes_service import HeroService 
from typing import List


router = APIRouter(prefix="/heroes", tags=["Heroes"])

@router.post("/add", response_model=HeroResponse)
async def add_hero(data: HeroCreate, db: AsyncSession = Depends(get_db)):

    return await HeroService.add_hero(data, db)


@router.post("/choice", response_model=List[HeroResponse])
async def choice_hero(data: HeroFilter, db: AsyncSession = Depends(get_db)):

    return await HeroService.choice_hero(data, db)