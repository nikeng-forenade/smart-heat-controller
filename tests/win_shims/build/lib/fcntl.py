"""Minimal stand-in for the POSIX ``fcntl`` module (Windows test env only).

Home Assistant's test harness pulls in ``homeassistant.runner``, which does a
top-level ``import fcntl``. Windows has no ``fcntl``, so the harness cannot even
be imported. The integration itself never touches this module; it exists only to
make ``pytest`` importable on Windows.

Installed by ``scripts/setup_test_env.ps1``. Never installed on Linux/macOS,
where the real module always wins.
"""

from __future__ import annotations

import sys

if not sys.platform.startswith("win"):
    raise ImportError(
        "windows-posix-shims must not shadow the real fcntl module on this platform"
    )

LOCK_SH = 1
LOCK_EX = 2
LOCK_NB = 4
LOCK_UN = 8
F_GETFD = 1
F_SETFD = 2
F_GETFL = 3
F_SETFL = 4
FD_CLOEXEC = 1


def flock(fd, operation):  # noqa: ANN001, ANN201
    return None


def ioctl(fd, request, arg=0, mutate_flag=True):  # noqa: ANN001, ANN201
    return 0


def fcntl(fd, cmd, arg=0):  # noqa: ANN001, ANN201
    return 0


def lockf(fd, cmd, length=0, start=0, whence=0):  # noqa: ANN001, ANN201
    return 0
