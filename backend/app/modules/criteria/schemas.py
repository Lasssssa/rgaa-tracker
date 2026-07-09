from pydantic import BaseModel, ConfigDict


class MethodologyTest(BaseModel):
    test: str
    content: str


class CriterionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    thematic_id: int
    number: int
    code: str
    title: str
    url: str | None
    methodology: list[MethodologyTest] | None


class ThematicRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    number: int
    name: str
    criteria: list[CriterionRead]


class ThematicBrief(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    number: int
    name: str


class CriterionListItem(BaseModel):
    """Lightweight criterion for pickers and lists: no methodology payload."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    title: str
    thematic: ThematicBrief
