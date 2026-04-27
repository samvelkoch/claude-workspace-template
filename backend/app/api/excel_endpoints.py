from fastapi import APIRouter, File, HTTPException, UploadFile
from app.excel_br.parser import parse_excel

router = APIRouter(prefix="/excel", tags=["excel"])

_ALLOWED_EXTENSIONS = {".xlsx", ".xls"}
_MAX_SIZE_BYTES = 50 * 1024 * 1024


@router.post("/upload")
async def upload_excel(file: UploadFile = File(...)) -> dict:
    filename = file.filename or ""
    ext = "." + filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in _ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Только .xlsx и .xls файлы")
    content = await file.read()
    if len(content) > _MAX_SIZE_BYTES:
        raise HTTPException(status_code=413, detail="Файл больше 50 МБ")
    try:
        info = parse_excel(content, filename)
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Не удалось прочитать файл: {e}")
    return info
