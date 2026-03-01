# Git 推送指南

按照以下步骤将代码推送到 GitHub：

## 步骤 1：初始化 Git 仓库

在项目根目录下打开终端（PowerShell 或 CMD），执行：

```bash
cd "D:\Program Files (x86)\ticket_global_melon_3.0_ManifestV3 (2)\ticket_global_melon_3.0_ManifestV3"
git init
```

## 步骤 2：添加所有文件

```bash
git add .
```

## 步骤 3：提交代码

```bash
git commit -m "Initial commit: Melon Ticket 自动抢票插件 v3.0.0"
```

## 步骤 4：在 GitHub 上创建仓库

1. 登录 GitHub
2. 点击右上角的 "+" 号，选择 "New repository"
3. 填写仓库名称（例如：`ticket_global_melon_3.0`）
4. 选择 Public 或 Private
5. **不要**勾选 "Initialize this repository with a README"
6. 点击 "Create repository"

## 步骤 5：添加远程仓库并推送

将 `YOUR_USERNAME` 和 `YOUR_REPO_NAME` 替换为您的 GitHub 用户名和仓库名：

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

## 如果遇到问题

### 问题 1：需要配置 Git 用户信息

```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 问题 2：需要身份验证

如果推送时要求输入用户名和密码，可以使用 Personal Access Token：

1. 访问 GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 生成新 token，勾选 `repo` 权限
3. 推送时，用户名输入您的 GitHub 用户名，密码输入 token

### 问题 3：使用 SSH 方式（推荐）

如果您配置了 SSH 密钥：

```bash
git remote set-url origin git@github.com:YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

## 后续更新代码

当您修改代码后，使用以下命令推送更新：

```bash
git add .
git commit -m "描述您的更改"
git push
```

## 完整命令示例

```bash
# 1. 进入项目目录
cd "D:\Program Files (x86)\ticket_global_melon_3.0_ManifestV3 (2)\ticket_global_melon_3.0_ManifestV3"

# 2. 初始化仓库
git init

# 3. 添加文件
git add .

# 4. 提交
git commit -m "Initial commit: Melon Ticket 自动抢票插件 v3.0.0"

# 5. 添加远程仓库（替换为您的仓库地址）
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 6. 推送到 GitHub
git branch -M main
git push -u origin main
```
