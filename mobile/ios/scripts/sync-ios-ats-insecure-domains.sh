#!/usr/bin/env bash
# Syncs NSAppTransportSecurity/NSExceptionDomains in Carnival/Info.plist from repo-root .env:
#   IOS_ATS_INSECURE_HTTP_DOMAINS=comma,separated,hosts
# Empty value removes NSExceptionDomains. Invoked from sync-ios-metadata-from-env (pod post_install) and prebuild.

set -euo pipefail

IOS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
MOBILE_DIR="$(cd "${IOS_DIR}/.." && pwd)"
ROOT_ENV="${MOBILE_DIR}/../.env"
INFO_PLIST="${IOS_DIR}/Carnival/Info.plist"

if [[ ! -f "${INFO_PLIST}" ]]; then
  echo "[ATS] skip: ${INFO_PLIST} not found"
  exit 0
fi

python3 - "${ROOT_ENV}" "${INFO_PLIST}" <<'PY'
import sys
import plistlib
from pathlib import Path
from typing import List

root_env = Path(sys.argv[1])
info_plist = Path(sys.argv[2])


def read_env_list(path: Path, key: str) -> List[str]:
    if not path.is_file():
        return []
    raw = ""
    for line in path.read_text(encoding="utf-8", errors="replace").splitlines():
        s = line.strip()
        if not s or s.startswith("#"):
            continue
        if s.startswith(f"{key}="):
            raw = s.split("=", 1)[1].strip()
            if raw and raw[0] in "\"'":
                q = raw[0]
                raw = raw[1:].rstrip()
                if raw.endswith(q):
                    raw = raw[:-1]
            break
    if not raw:
        return []
    return [p.strip() for p in raw.split(",") if p.strip()]


domains = read_env_list(root_env, "IOS_ATS_INSECURE_HTTP_DOMAINS")
data = plistlib.loads(info_plist.read_bytes())
ats = dict(data.get("NSAppTransportSecurity") or {})

if not domains:
    ats.pop("NSExceptionDomains", None)
else:
    ats["NSExceptionDomains"] = {h: {"NSExceptionAllowsInsecureHTTPLoads": True} for h in domains}

data["NSAppTransportSecurity"] = ats
info_plist.write_bytes(plistlib.dumps(data))
if domains:
    print(f"[ATS] NSExceptionDomains set for: {', '.join(domains)}", file=sys.stderr)
else:
    print("[ATS] NSExceptionDomains removed (empty IOS_ATS_INSECURE_HTTP_DOMAINS)", file=sys.stderr)
PY
