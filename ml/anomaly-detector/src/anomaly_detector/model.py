"""Anomaly detection model for greenhouse sensor telemetry.

A deliberately simple z-score detector: a reading is anomalous when it
deviates from its per-sensor rolling baseline by more than `threshold`
standard deviations. The gRPC surface is decoupled from this class, so a
trained model (e.g. IsolationForest) can be swapped in without touching
the service layer.
"""

from dataclasses import dataclass

import numpy as np


@dataclass(frozen=True)
class Verdict:
    """Outcome of scoring a single reading."""

    anomalous: bool
    score: float  # confidence in [0, 1]
    expected: float


class ZScoreDetector:
    def __init__(self, threshold: float = 3.0) -> None:
        self.threshold = threshold

    def evaluate(self, value: float, baseline: list[float]) -> Verdict:
        """Score `value` against a baseline window of recent readings."""
        if len(baseline) < 2:
            # Cold start: not enough history to judge.
            return Verdict(anomalous=False, score=0.0, expected=value)

        window = np.asarray(baseline, dtype=float)
        mean = float(window.mean())
        std = float(window.std())
        z = 0.0 if std == 0.0 else abs(value - mean) / std
        score = min(z / self.threshold, 1.0)
        return Verdict(anomalous=z > self.threshold, score=score, expected=mean)
