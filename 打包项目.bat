@echo off
chcp 65001 >nul
echo ==========================================
echo    科研一站式导航 - 项目打包工具
echo ==========================================
echo.

echo [1/4] 检查项目文件...
if not exist "package.json" (
    echo ❌ 错误: 未找到 package.json 文件
    echo 请确保在项目根目录运行此脚本
    pause
    exit /b 1
)
echo ✓ 项目文件检查完成
echo.

echo [2/4] 清理旧文件...
if exist "research-nav.zip" del /f /q research-nav.zip
if exist "research-nav-deploy" rmdir /s /q research-nav-deploy
echo ✓ 清理完成
echo.

echo [3/4] 复制项目文件...
mkdir research-nav-deploy

echo 复制核心文件...
xcopy /E /I /Y public research-nav-deploy\public >nul
xcopy /E /I /Y admin research-nav-deploy\admin >nul
xcopy /E /I /Y server research-nav-deploy\server >nul
xcopy /Y package.json research-nav-deploy\ >nul
xcopy /Y ecosystem.config.js research-nav-deploy\ >nul
xcopy /Y README.md research-nav-deploy\ >nul
xcopy /Y DEPLOYMENT_GUIDE.md research-nav-deploy\ >nul

echo ✓ 文件复制完成
echo.

echo [4/4] 压缩项目...
echo 正在压缩，请稍候...
powershell -command "Compress-Archive -Path research-nav-deploy\* -DestinationPath research-nav.zip -Force"
if errorlevel 1 (
    echo ❌ 压缩失败
    pause
    exit /b 1
)

echo ✓ 压缩完成
echo.

echo 清理临时文件...
rmdir /s /q research-nav-deploy
echo ✓ 临时文件已清理
echo.

echo ==========================================
echo ✅ 打包完成！
echo ==========================================
echo.
echo 部署包位置: %cd%\research-nav.zip
echo.
echo 下一步操作:
echo  1. 登录宝塔面板: http://你的服务器IP:8888
echo  2. 进入文件管理
echo  3. 上传 research-nav.zip 到服务器
echo  4. 解压并运行部署脚本
echo.
echo 详细步骤请参考: DEPLOYMENT_GUIDE.md
echo.
echo ==========================================
pause
