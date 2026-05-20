import os
from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Import database and routers
from app.database import engine, Base
from app.routes import predict, history

load_dotenv()

# Automatically create all SQLite database tables on application startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AI Disease Prediction System",
    description="A lightweight offline medical prediction assistant using local Ollama LLMs and FastAPI.",
    version="1.0.0"
)

# CORS configurations (for browser-based local API invocations)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Verify directory structures for static & templates
current_dir = os.path.dirname(os.path.abspath(__file__))
static_dir = os.path.join(current_dir, "static")
templates_dir = os.path.join(current_dir, "templates")

# Ensure static and templates directories exist
os.makedirs(static_dir, exist_ok=True)
os.makedirs(templates_dir, exist_ok=True)
os.makedirs(os.path.join(static_dir, "css"), exist_ok=True)
os.makedirs(os.path.join(static_dir, "js"), exist_ok=True)

# Mount static files
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# Jinja2 Templates setup
templates = Jinja2Templates(directory=templates_dir)

# Register backend routers
app.include_router(predict.router)
app.include_router(history.router)

# Main web interface route
@app.get("/", summary="Render Web Interface")
async def read_root(request: Request):
    """
    Renders the beautiful, responsive web interface for the AI Disease Prediction System.
    """
    return templates.TemplateResponse(request=request, name="index.html")
