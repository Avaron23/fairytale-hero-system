from fastapi import APIRouter, Depends
from app.schemas.hero import HeroResponse, HeroCreate
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.db import get_db
from app.services.heroes_service import HeroService 


router = APIRouter(prefix="/heroes", tags=["Heroes"])

@router.post("/add", response_model=HeroResponse)
async def add_hero(data: HeroCreate, db: AsyncSession = Depends(get_db)):

    return await HeroService.add_hero(data, db)