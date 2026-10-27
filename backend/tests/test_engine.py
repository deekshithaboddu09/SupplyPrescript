from backend.models.shipment import DecisionOption
from backend.services.prescriptive_engine import evaluate_option, evaluate_options

def test_positive_net_benefit():
    option = DecisionOption(id="air", name="Air expedite", cost=24500, delay_days=0)
    result = evaluate_option(180000, 4, option)
    assert result.penalty_avoided == 180000
    assert result.net_benefit == 155500
    assert result.positive_roi is True

def test_accept_delay_has_zero_net_benefit():
    option = DecisionOption(id="wait", name="Accept delay", cost=0, delay_days=4)
    result = evaluate_option(180000, 4, option)
    assert result.penalty_avoided == 0
    assert result.net_benefit == 0
    assert result.positive_roi is False

def test_options_sorted_best_net_benefit_first():
    options = [
        DecisionOption(id="wait", name="Wait", cost=0, delay_days=4),
        DecisionOption(id="air", name="Air", cost=24500, delay_days=0),
    ]
    results = evaluate_options(180000, 4, options)
    assert results[0].option_id == "air"
