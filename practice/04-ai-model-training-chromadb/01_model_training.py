"""QuickBite ETA — ML Model Training & ETA Prediction.

This script demonstrates training, serializing, and serving predictions with a scikit-learn model:
1. Generates 5,000 rows of synthetic food-delivery data (`distance_km`, `prep_time_min`, `rider_available`, `is_raining`).
2. Trains a `RandomForestRegressor` to predict delivery arrival time (`eta_min`) and serializes it to `eta_model.pkl` via `joblib`.
3. Loads the persisted model artifact, validates delivery order inputs with Pydantic (`Order`), and predicts ETA in minutes.

Run locally (from this folder):
    pip install -r requirements.txt
    python 01_model_training.py

Run with Docker Compose (from this folder):
    docker compose run --rm 01_model_training
"""

import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from pydantic import BaseModel
from sklearn.ensemble import RandomForestRegressor

# ---------------------------------------------------------------------------
# Sample Inputs
# ---------------------------------------------------------------------------
# ① Pick one or more delivery order scenarios below - uncomment alternatives to test
#   Watch how flipping `is_raining` from 0 to 1 adds ~9 minutes, or `rider_available` from 1 to 0 adds ~6 minutes.

# Option 1: Rainy evening delivery with a rider available (default -> ~40.5 min)
orders_to_predict = [
    {"distance_km": 4.5, "prep_time_min": 15.0, "rider_available": 1, "is_raining": 1},
]

# Option 2: Same order on a clear sunny day (no rain penalty -> ~31.5 min)
# orders_to_predict = [
#     {"distance_km": 4.5, "prep_time_min": 15.0, "rider_available": 1, "is_raining": 0},
# ]

# Option 3: Side-by-side comparison across weather and rider availability
# orders_to_predict = [
#     {"distance_km": 4.5, "prep_time_min": 15.0, "rider_available": 1, "is_raining": 0},
#     {"distance_km": 4.5, "prep_time_min": 15.0, "rider_available": 1, "is_raining": 1},
#     {"distance_km": 4.5, "prep_time_min": 15.0, "rider_available": 0, "is_raining": 1},
#     {"distance_km": 1.5, "prep_time_min": 8.0,  "rider_available": 1, "is_raining": 0},
# ]

MODEL_PATH = Path(os.getenv("MODEL_PATH", "/tmp/eta_model.pkl"))


# ---------------------------------------------------------------------------
# Step 1: Synthetic Data Generation & RandomForest Model Training
# ---------------------------------------------------------------------------
def train_and_save_model(model_path: Path) -> None:
    """Generate synthetic food-delivery data, train a RandomForestRegressor, and save it."""
    # ② Seed the random generator for reproducible synthetic training data
    np.random.seed(42)
    n = 5000

    df = pd.DataFrame({
        "distance_km": np.random.uniform(0.5, 12, n),
        "prep_time_min": np.random.uniform(5, 30, n),
        "rider_available": np.random.randint(0, 2, n),
        "is_raining": np.random.randint(0, 2, n),
    })

    # ③ Ground-truth formula: base + distance*3 + prep*0.7 + rain penalty + rider penalty + noise
    df["eta_min"] = (
        8
        + df.distance_km * 3
        + df.prep_time_min * 0.7
        + df.is_raining * 9
        + (1 - df.rider_available) * 6
        + np.random.normal(0, 2, n)
    )

    # ④ Fit RandomForestRegressor and persist the trained artifact with joblib
    X, y = df.drop(columns=["eta_min"]), df["eta_min"]
    model = RandomForestRegressor(n_estimators=60, random_state=42).fit(X, y)
    joblib.dump(model, model_path)
    print(f"Trained RandomForestRegressor on {n} synthetic orders -> saved to {model_path} ✅\n")


# ---------------------------------------------------------------------------
# Step 2: Pydantic Schema & ETA Inference
# ---------------------------------------------------------------------------
class Order(BaseModel):
    distance_km: float
    prep_time_min: float
    rider_available: int
    is_raining: int


def predict_eta(model: RandomForestRegressor, order: Order) -> dict:
    """Predict delivery ETA in minutes for a validated Order."""
    # ⑤ Convert the validated Pydantic model into a single-row DataFrame and run inference
    X = pd.DataFrame([order.model_dump()])
    eta = round(float(model.predict(X)[0]), 1)
    return {"eta_minutes": eta, "message": f"Your food arrives in {eta} min 🍔"}


# ---------------------------------------------------------------------------
# Execution
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    train_and_save_model(MODEL_PATH)
    loaded_model = joblib.load(MODEL_PATH)

    for i, raw_order in enumerate(orders_to_predict, start=1):
        order = Order(**raw_order)
        result = predict_eta(loaded_model, order)
        print(f"Order #{i}: {order.model_dump()}")
        print(f"Result  : {result}\n")

