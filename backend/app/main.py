from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.excel_endpoints import router as excel_router
from app.api.session_endpoints import router as session_router
from app.api.charts import router as charts_router

app = FastAPI(title="Talk2Data BR", version="0.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(excel_router)
app.include_router(session_router)
app.include_router(charts_router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
