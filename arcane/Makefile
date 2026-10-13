# SPDX-License-Identifier: BSD-3-Clause

include $(TOPDIR)/rules.mk

PKG_NAME:=arcane
PKG_VERSION:=2.15.1
PKG_RELEASE:=1

PKG_SOURCE:=$(PKG_NAME)-$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://codeload.github.com/getarcaneapp/arcane/tar.gz/v$(PKG_VERSION)?
PKG_HASH:=cc99866518c8e66481164d9d0de3c8b3149ce349c31114d2fc2981af6ac16fd1
PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)

PKG_LICENSE:=BSD-3-Clause
PKG_LICENSE_FILES:=LICENSE
PKG_MAINTAINER:=Your Name <you@example.com>

PKG_BUILD_DEPENDS:=golang/host node/host
PKG_BUILD_PARALLEL:=1

include $(INCLUDE_DIR)/package.mk

# OpenWrt ARCH -> GOARCH（上游发布目标：amd64 / arm64 / 386 / armv7 / riscv64）
ifeq ($(ARCH),aarch64)
  ARCANE_GOARCH:=arm64
else ifeq ($(ARCH),x86_64)
  ARCANE_GOARCH:=amd64
else ifeq ($(ARCH),i386)
  ARCANE_GOARCH:=386
  ARCANE_GOENV:=GO386=sse2
else ifeq ($(ARCH),arm)
  ARCANE_GOARCH:=arm
  ARCANE_GOENV:=GOARM=7
else ifeq ($(ARCH),riscv64)
  ARCANE_GOARCH:=riscv64
endif

ARCANE_CFG:=github.com/getarcaneapp/arcane/backend/v2/internal/config

define Package/arcane
  SECTION:=utils
  CATEGORY:=Utilities
  TITLE:=Arcane 现代化 Docker 管理面板
  URL:=https://getarcane.app
  DEPENDS:=@(aarch64||x86_64||i386||riscv64||arm) +dockerd +ca-bundle
endef

define Package/arcane/description
  Arcane 是一个现代化的 Docker 管理 Web 面板，支持容器、镜像、网络、
  存储卷以及 Compose 项目管理。ARM 仅支持 ARMv7 及以上。
endef

define Package/arcane/conffiles
/etc/config/arcane
endef

define Build/Compile
	cd $(PKG_BUILD_DIR) && \
	    export PATH="$(STAGING_DIR_HOSTPKG)/bin:$$$$PATH" && \
	    export HOME="$(PKG_BUILD_DIR)/.home" && \
	    export npm_config_cache="$(PKG_BUILD_DIR)/.npm-cache" && \
	    export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 CI=1 && \
	    mkdir -p "$$$$HOME" && \
	    PNPM_SPEC="$$$$(node -p 'require("./package.json").packageManager || "pnpm"' | sed 's/+.*//')" && \
	    npm install -g --no-audit --no-fund --prefix "$(PKG_BUILD_DIR)/.tools" "$$$$PNPM_SPEC" && \
	    export PATH="$(PKG_BUILD_DIR)/.tools/bin:$$$$PATH" && \
	    pnpm install --frozen-lockfile && \
	    pnpm --dir frontend run build
	if [ ! -f "$(PKG_BUILD_DIR)/backend/frontend/dist/index.html" ]; then \
	    if [ -f "$(PKG_BUILD_DIR)/frontend/dist/index.html" ]; then \
	        rm -rf "$(PKG_BUILD_DIR)/backend/frontend/dist" && \
	        cp -a "$(PKG_BUILD_DIR)/frontend/dist" "$(PKG_BUILD_DIR)/backend/frontend/dist"; \
	    else \
	        echo "frontend dist not found" >&2; exit 1; \
	    fi; \
	fi
	GO_BIN="$$$$(ls -1 $(STAGING_DIR_HOSTPKG)/lib/go-*/bin/go $(STAGING_DIR_HOSTPKG)/bin/go 2>/dev/null | head -n1)"; \
	[ -n "$$$$GO_BIN" ] || GO_BIN=go; \
	cd $(PKG_BUILD_DIR)/backend && \
	    env GOOS=linux GOARCH=$(ARCANE_GOARCH) $(ARCANE_GOENV) CGO_ENABLED=0 \
	        GOTOOLCHAIN=auto GOFLAGS="-buildvcs=false -modcacherw" \
	        GOPATH="$(PKG_BUILD_DIR)/.gopath" \
	        GOCACHE="$(PKG_BUILD_DIR)/.gocache" \
	        GOMODCACHE="$(PKG_BUILD_DIR)/.gomodcache" \
	        "$$$$GO_BIN" build -trimpath \
	        -ldflags "-w -s -buildid= -X $(ARCANE_CFG).Version=$(PKG_VERSION) -X $(ARCANE_CFG).Revision=openwrt" \
	        -o "$(PKG_BUILD_DIR)/arcane-bin" ./cmd
endef

define Package/arcane/install
	$(INSTALL_DIR) $(1)/usr/bin
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/arcane-bin $(1)/usr/bin/arcane

	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) ./files/arcane.init $(1)/etc/init.d/arcane

	$(INSTALL_DIR) $(1)/etc/config
	$(INSTALL_CONF) ./files/arcane.config $(1)/etc/config/arcane
endef

$(eval $(call BuildPackage,arcane))
