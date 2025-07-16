from pydantic import BaseModel
from typing import List

from fastapi.middleware.cors import CORSMiddleware
class RequestState(BaseModel):
    message: List[str]
    allow_search: bool
    
    
from fastapi import FastAPI
from ai_agent import get_response_from_ai_agent

import os
allowed_url =os.getenv("ALLOWED_URL")

app= FastAPI(title="LangGraph AI Agent")
origins = [
   allowed_url
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/chat")
def chat_endpoint(request:RequestState):
    """_summary_
     Api end point to interact with the chatbot using langgraph and search tools
     It dynamically selects the model specified in the request
    """
    # if request.model_name not in ALLOWED_MODELS_NAME:
    #     return{"error":"Invalid model name please select a valid model "}
   
    query = request.message
    allow_search = request.allow_search
    response = get_response_from_ai_agent(query,allow_search)
    return response

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app,host="127.0.0.1",port=8000)