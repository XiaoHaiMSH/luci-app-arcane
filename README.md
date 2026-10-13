# arcane / luci-app-arcane

把两个目录放进你的 feed（或 package/ 下）：

    arcane/            后端：源码编译 前端(pnpm) + 后端(Go) -> 单个二进制
    luci-app-arcane/   LuCI 界面（中文直写，无 po 文件）

首次编译：

    make package/arcane/download V=s
    # PKG_HASH 已填入 v2.15.1 的 sha256；升级版本时需重新计算
    make package/arcane/compile V=s

注意：
- 编译需要联网（pnpm / go mod / 可能自动下载更高版本 Go 工具链）。
- 编译占用内存较大，建议 GitHub Actions 的 runner 至少 7GB 内存。
