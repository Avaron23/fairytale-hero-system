from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from enum import Enum


# Enum - ы
class HeightEnum(str, Enum):
    high = "высокий"
    medium = "средний"
    low = "низкий"

class AgeEnum(str, Enum):
    young = "молодой"
    adult = "взрослый"
    old = "старый"

class GenderEnum(str, Enum):
    male = "мужской"
    female = "женский"
    other = "другой"

# Pydantic схемы
class HeroCreate(BaseModel):
    name: str
    gender: GenderEnum
    height: HeightEnum
    age: AgeEnum
    character: List[str]
    traits: List[str]
    
class HeroResponse(HeroCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)

class HeroFilter(BaseModel):
    gender: Optional[GenderEnum] 
    height: Optional[HeightEnum]
    age: Optional[AgeEnum]
    character: Optional[List[str]]
    traits: Optional[List[str]]