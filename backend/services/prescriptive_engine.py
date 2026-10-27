from backend.models.shipment import DecisionOption, DecisionResult

def evaluate_option(penalty: float, current_delay_days: float, option: DecisionOption) -> DecisionResult:
    """Estimate avoided delay penalty minus intervention cost.

    This is a transparent demo rule, not a trained ML model. It assumes penalty
    falls linearly with the fraction of delay days removed.
    """
    base_penalty = max(0.0, float(penalty))
    current_days = max(0.0, float(current_delay_days))
    residual_days = max(0.0, float(option.delay_days))
    residual_ratio = min(1.0, residual_days / current_days) if current_days > 0 else 0.0
    residual_penalty = round(base_penalty * residual_ratio, 2)
    avoided = round(base_penalty - residual_penalty, 2)
    cost = round(float(option.cost), 2)
    net = round(avoided - cost, 2)
    return DecisionResult(
        option_id=option.id, name=option.name, extra_cost=cost,
        residual_penalty=residual_penalty, penalty_avoided=avoided,
        net_benefit=net, positive_roi=net > 0,
    )

def evaluate_options(penalty: float, current_delay_days: float, options: list[DecisionOption]) -> list[DecisionResult]:
    results = [evaluate_option(penalty, current_delay_days, option) for option in options]
    return sorted(results, key=lambda result: result.net_benefit, reverse=True)
