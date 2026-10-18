from contextvars import ContextVar
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

TIMEZONE_HEADER = "X-Timezone"
DEFAULT_TIMEZONE_NAME = "UTC"

_request_timezone: ContextVar[ZoneInfo] = ContextVar(
    "request_timezone",
    default=ZoneInfo(DEFAULT_TIMEZONE_NAME),
)


def parse_timezone(name: str | None) -> ZoneInfo:
    """Resolve an IANA name (e.g. Europe/Warsaw); fall back to UTC if missing or invalid."""
    if not name:
        return ZoneInfo(DEFAULT_TIMEZONE_NAME)

    try:
        return ZoneInfo(name)
    except (ZoneInfoNotFoundError, ValueError, OSError):
        return ZoneInfo(DEFAULT_TIMEZONE_NAME)


def set_request_timezone(name: str | None) -> None:
    _request_timezone.set(parse_timezone(name))


def get_request_timezone() -> ZoneInfo:
    return _request_timezone.get()
