import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="AI Projects API")

# Enable CORS for cross-container / frontend access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Item(BaseModel):
    title: str
    description: str | None = None


# Sample in-memory data
items: list[dict[str, object]] = [
    {"id": 1, "title": "First Project", "description": "Demo FastAPI service"},
]


@app.get("/")
def read_root():
    return {"message": "AI Projects Server is running", "status": "ok"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


@app.get("/api/items")
def get_items():
    return items


@app.post("/api/items", status_code=201)
def create_item(item: Item):
    new_id = len(items) + 1
    new_item = {"id": new_id, "title": item.title, "description": item.description}
    items.append(new_item)
    return new_item


@app.get("/api/items/{item_id}")
def get_item(item_id: int):
    for item in items:
        if item["id"] == item_id:
            return item
    raise HTTPException(status_code=404, detail="Item not found")


if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    host = os.getenv("HOST", "0.0.0.0")
    uvicorn.run("main:app", host=host, port=port, reload=True)
