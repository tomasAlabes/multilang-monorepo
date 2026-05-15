"""Unit tests for the z-score detector. These run without codegen."""

from anomaly_detector.model import ZScoreDetector

BASELINE = [20.0, 21.0, 19.5, 20.5, 20.0, 21.0]


def test_flags_clear_outlier() -> None:
    verdict = ZScoreDetector(threshold=3.0).evaluate(40.0, BASELINE)
    assert verdict.anomalous
    assert verdict.score == 1.0


def test_accepts_normal_reading() -> None:
    verdict = ZScoreDetector(threshold=3.0).evaluate(20.7, BASELINE)
    assert not verdict.anomalous


def test_cold_start_is_not_anomalous() -> None:
    verdict = ZScoreDetector().evaluate(20.0, baseline=[])
    assert not verdict.anomalous
    assert verdict.expected == 20.0
