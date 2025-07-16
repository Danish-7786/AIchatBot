from langchain_mcp_adapters.client import MultiServerMCPClient
from langgraph.prebuilt import create_react_agent
from langchain_groq import ChatGroq
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
load_dotenv()

import asyncio


import os
os.environ["GROQ_API_KEY"]=os.getenv("GROQ_API_KEY")
os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY")

def get_response_from_ai_agent(query,allow_search):  
     
    tools=[TavilySearch(max_results=2)] if allow_search else []
    model = ChatGroq(model="meta-llama/llama-4-maverick-17b-128e-instruct")
    agent = create_react_agent(
        model,tools
    )
    state={"messages":query}
    response = agent.invoke(state)
    messages = response.get("messages")
    ai_messages= messages[-1].content
    
    
    return ai_messages

