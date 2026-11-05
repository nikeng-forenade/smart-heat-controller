"""Minimal stand-in for the POSIX ``resource`` module (Windows test env only).

``homeassistant.util.resource`` calls ``resource.getrlimit``/``setrlimit`` to
raise the file-descriptor limit. Windows has no ``resource`` module; returning a
generous fake limit is enough for the test harness.

Installed by ``scripts/setup_test_env.ps1``. Never installed on Linux/macOS.
"""

from __future__ import annotations

import sys

if not sys.platform.startswith("win"):
    raise ImportError(
        "windows-posix-shims must not shadow the real resource module on this platform"
    )

RLIMIT_NOFILE = 0
RLIMIT_AS = 1
RLIM_INFINITY = -1


class error(OSError):
    """Mirror of the POSIX exception type."""


def getrlimit(which):  # noqa: ANN001, ANN201
    return (8192, RLIM_INFINITY)


def setrlimit(which, limits):  # noqa: ANN001, D103
    return None
