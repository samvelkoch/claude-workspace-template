from pathlib import Path
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.core.config import settings

router = APIRouter()


@router.get("/charts/{filename}")
async def get_chart(filename: str) -> FileResponse:
    path = Path(settings.charts_dir) / filename
    if not path.exists() or path.suffix not in (".png", ".html"):
        raise HTTPException(status_code=404, detail="Chart not found")
    media_type = "image/png" if path.suffix == ".png" else "text/html; charset=utf-8"
    return FileResponse(path, media_type=media_type)
