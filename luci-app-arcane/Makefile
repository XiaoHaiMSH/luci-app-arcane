# SPDX-License-Identifier: BSD-3-Clause

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-arcane
PKG_VERSION:=2.15.1
PKG_RELEASE:=1
PKG_LICENSE:=BSD-3-Clause
PKG_MAINTAINER:=Your Name <you@example.com>

LUCI_TITLE:=LuCI support for Arcane
LUCI_DEPENDS:=+arcane
LUCI_PKGARCH:=all

include $(TOPDIR)/feeds/luci/luci.mk

$(eval $(call BuildPackage,luci-app-arcane))
