#!/usr/bin/env bash

set -euo pipefail

readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

source_optional() {
	local target_file="$1"
	if [[ -f "$target_file" ]]; then
		set +u
		# shellcheck disable=SC1090,SC1091
		source "$target_file" >/dev/null 2>&1
		set -u
	fi
}

require_command() {
	local cmd="$1"
	local error_msg="$2"
	if ! command -v "$cmd" >/dev/null 2>&1; then
		echo -e "${RED}[ERROR] '$cmd' was not found in WSL. ${error_msg}${NC}" >&2
		exit 1
	fi
}

source_optional "$HOME/.profile"
source_optional "$HOME/.bashrc"

if [[ -d "$HOME/.bun/bin" ]]; then
	export PATH="$HOME/.bun/bin:$PATH"
fi

source_optional "$HOME/.sdkman/bin/sdkman-init.sh"

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
# Release の zip では、まとめた dist/server.js を使う。clone したリポジトリでは、ソースを直接動かす。
SERVER_PATH="$SCRIPT_DIR/../dist/server.js"
if [[ ! -f "$SERVER_PATH" ]]; then
	SERVER_PATH="$SCRIPT_DIR/../src/daemon/main.ts"
fi

# Java などの処理系は、サーバーが設定ファイル(local-runner.settings.json)から決めて確かめる。
require_command "bun" "Install Bun inside WSL first."

echo -e "========================================"
echo -e "  Local Runner Server (WSL)"
echo -e "========================================"
echo -e "SERVER_PATH: $SERVER_PATH"
echo -e "RUNNER     : $(command -v bun)"
echo -e "========================================"

echo -e "${GREEN}Starting WSL local runner server...${NC}"

# serve は新しいコンソール窓(ConPTY)に直結して起動するため stdout は tty。
# ログはバッファされずリアルタイムに流れるので、特別なラッパーは不要。
exec bun "$SERVER_PATH" "$@"