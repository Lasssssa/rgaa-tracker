from pydantic import BaseModel, ConfigDict


class CriterionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    thematic_id: int
    number: int
    code: str
    title: str
    url: str | None


class ThematicRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: int
    name: str
    criteria: list[CriterionRead]
