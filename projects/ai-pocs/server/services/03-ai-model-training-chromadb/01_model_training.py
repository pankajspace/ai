"""QuickBite ETA — ML Model Training & ETA Prediction Service.

This service demonstrates training, serializing, and serving predictions with a scikit-learn model:
1. Generates 5,000 rows of synthetic food-delivery data (`distance_km`, `prep_time_min`, `rider_available`, `is_raining`).
2. Trains a `RandomForestRegressor` to predict delivery arrival time (`eta_min`) and caches `eta_model.pkl` via `joblib`.
3. Loads the persisted model artifact, validates delivery order inputs with Pydantic (`ModelTrainingRequest`), and returns ETA in minutes.
"""

import os
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from pydantic import BaseModel
from sklearn.ensemble import RandomForestRegressor

MODEL_PATH = Path(os.getenv("MODEL_PATH", "/tmp/eta_model.pkl"))
_cached_model = None


# ---------------------------------------------------------------------------
# Request & Response Schemas (Pydantic)
# ---------------------------------------------------------------------------
class ModelTrainingRequest(BaseModel):
    """Input payload for QuickBite ETA model prediction."""

    distance_km: float = 4.5
    prep_time_min: float = 15.0
    rider_available: int = 1
    is_raining: int = 1


class ModelTrainingResponse(BaseModel):
    """Output payload containing order features, predicted ETA, and status message."""

    distance_km: float
    prep_time_min: float
    rider_available: int
    is_raining: int
    eta_minutes: float
    message: str


# ---------------------------------------------------------------------------
# Model Training & Persistence
# ---------------------------------------------------------------------------
def get_or_train_model() -> RandomForestRegressor:
    """Load the trained RandomForestRegressor from disk, or train and save it on first use."""
    global _cached_model
    if _cached_model is not None:
        return _cached_model

    # ① Train and persist eta_model.pkl if it does not exist yet
    if not MODEL_PATH.exists():
        np.random.seed(42)
        n = 5000

        df = pd.DataFrame({
            "distance_km": np.random.uniform(0.5, 12, n),
            "prep_time_min": np.random.uniform(5, 30, n),
            "rider_available": np.random.randint(0, 2, n),
            "is_raining": np.random.randint(0, 2, n),
        })

        # ② Ground-truth formula: base + distance*3 + prep*0.7 + rain penalty + rider penalty + noise
        df["eta_min"] = (
            8
            + df.distance_km * 3
            + df.prep_time_min * 0.7
            + df.is_raining * 9
            + (1 - df.rider_available) * 6
            + np.random.normal(0, 2, n)
        )

        # ③ Fit RandomForestRegressor and save artifact with joblib
        X, y = df.drop(columns=["eta_min"]), df["eta_min"]
        model = RandomForestRegressor(n_estimators=60, random_state=42).fit(X, y)
        joblib.dump(model, MODEL_PATH)

    # ④ Load the persisted model artifact from disk
    _cached_model = joblib.load(MODEL_PATH)
    return _cached_model


# ---------------------------------------------------------------------------
# Core Service Logic
# ---------------------------------------------------------------------------
def predict_delivery_eta(
    distance_km: float = 4.5,
    prep_time_min: float = 15.0,
    rider_available: int = 1,
    is_raining: int = 1,
) -> dict:
    """Predict delivery ETA in minutes using the trained RandomForestRegressor."""
    # ⑤ Load (or train) the model and run inference on the single-row order DataFrame
    model = get_or_train_model()
    order_row = {
        "distance_km": float(distance_km),
        "prep_time_min": float(prep_time_min),
        "rider_available": 1 if int(rider_available) else 0,
        "is_raining": 1 if int(is_raining) else 0,
    }
    X = pd.DataFrame([order_row])
    eta = round(float(model.predict(X)[0]), 1)

    return {
        **order_row,
        "eta_minutes": eta,
        "message": f"Your food arrives in {eta} min 🍔",
    }

