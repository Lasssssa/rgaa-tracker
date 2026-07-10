"""Domain-level exceptions.

Services raise these plain Python exceptions to express *business* failures
without knowing anything about HTTP. A single handler registered in ``main.py``
translates them into HTTP responses, so the web framework stays at the edge.
"""


class DomainError(Exception):
    """Base class for all business-rule errors."""


class EntityNotFoundError(DomainError):
    """Raised when a requested entity does not exist.

    ``entity`` is the human-readable name used in the API message, e.g.
    ``EntityNotFoundError("Project")`` -> "Project not found".
    """

    def __init__(self, entity: str) -> None:
        self.entity = entity
        super().__init__(f"{entity} not found")


class InvalidFileError(DomainError):
    """Raised when an uploaded file is rejected (wrong type, too large...).

    Translated to HTTP 400 by the handler in ``main.py``.
    """
