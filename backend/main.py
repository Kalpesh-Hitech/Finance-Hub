from fastapi import Depends, FastAPI
from helper import get_current_user
from routes import router
from fastapi.middleware.cors import CORSMiddleware
from finance import financerouter
app = FastAPI()
origins = [
    "http://localhost:5173",  
    "http://127.0.0.1:5173",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,           
    allow_credentials=True,
    allow_methods=["*"],             
    allow_headers=["*"],             
)
app.include_router(router)
app.include_router(financerouter,  dependencies=[Depends(get_current_user)])