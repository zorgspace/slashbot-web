#!/usr/bin/env bash
set -euo pipefail

# Slashbot installer
# Usage: curl -fsSL https://getslashbot.com/install.sh | bash

REPO_OWNER="zorgspace"
REPO_NAME="slashbot"
BIN_NAME="slashbot"

VERSION="${1:-latest}"
INSTALL_DIR="${2:-/usr/local/bin}"

# Colors
VIOLET='\033[0;35m'
GREEN='\033[0;32m'
MUTED='\033[0;90m'
NC='\033[0m'

echo -e "${VIOLET}"
echo " ▄▄▄▄▄▄▄"
echo "▐░░░░░░░▌"
echo "▐░▀░░░▀░▌"
echo "▐░░░▄░░░▌"
echo "▐░░▀▀▀░░▌"
echo " ▀▀▀▀▀▀▀"
echo -e "${NC}"
echo -e "${VIOLET}Slashbot${NC} installer"
echo ""

# Get latest version if not specified
if [[ "$VERSION" == "latest" ]]; then
  echo -e "${MUTED}Fetching latest version...${NC}"
  VERSION=$(curl -fsSL "https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/releases/latest" | grep '"tag_name"' | head -1 | cut -d '"' -f4)
  if [[ -z "$VERSION" ]]; then
    echo "Error: Could not fetch latest version"
    exit 1
  fi
fi

echo -e "Installing ${VIOLET}slashbot ${VERSION}${NC}"
echo ""

# Detect OS
OS=$(uname | tr '[:upper:]' '[:lower:]')
case "$OS" in
  linux*) OS="linux" ;;
  darwin*) OS="darwin" ;;
  *) echo "Unsupported OS: $OS"; exit 1 ;;
esac

# Detect architecture
ARCH=$(uname -m)
case "$ARCH" in
  x86_64|amd64) ARCH="x64" ;;
  arm64|aarch64) ARCH="arm64" ;;
  *) echo "Unsupported architecture: $ARCH"; exit 1 ;;
esac

ASSET_NAME="${BIN_NAME}-${OS}-${ARCH}"
DOWNLOAD_URL="https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/${VERSION}/${ASSET_NAME}"

echo -e "${MUTED}● Downloading ${ASSET_NAME}...${NC}"
TEMP_FILE=$(mktemp)
if ! curl -fsSL "$DOWNLOAD_URL" -o "$TEMP_FILE"; then
  echo "Error: Download failed. Check if release exists: $DOWNLOAD_URL"
  rm -f "$TEMP_FILE"
  exit 1
fi

chmod +x "$TEMP_FILE"

echo -e "${MUTED}● Installing to ${INSTALL_DIR}...${NC}"
if [[ ! -w "$INSTALL_DIR" ]]; then
  sudo mv "$TEMP_FILE" "${INSTALL_DIR}/${BIN_NAME}"
else
  mv "$TEMP_FILE" "${INSTALL_DIR}/${BIN_NAME}"
fi

echo ""
echo -e "${GREEN}✓${NC} ${BIN_NAME} ${VERSION} installed successfully!"
echo ""
echo -e "${MUTED}Run 'slashbot' to get started${NC}"
echo -e "${MUTED}Documentation: https://github.com/${REPO_OWNER}/${REPO_NAME}${NC}"
