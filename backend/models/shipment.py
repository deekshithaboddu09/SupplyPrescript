from pydantic import BaseModel, Field

class DecisionOption(BaseModel):
    id: str
    name: str
    cost: float = Field(ge=0)
    delay_days: float = Field(ge=0)

class DecisionRequest(BaseModel):
    shipment_id: str
    penalty: float = Field(ge=0)
    current_delay_days: float = Field(ge=0)
    options: list[DecisionOption]

class DecisionResult(BaseModel):
    option_id: str
    name: str
    extra_cost: float
    residual_penalty: float
    penalty_avoided: float
    net_benefit: float
    positive_roi: bool
