from fastapi import FastAPI
from app.routers.heroes import router as hero_router


app = FastAPI()

app.include_router(hero_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}
