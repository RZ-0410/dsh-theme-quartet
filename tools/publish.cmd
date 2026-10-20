@echo off
setlocal
cd /d "%~dp0.."

echo [1/4] check manifest
node -e "const p=require('./package.json');if(!p.dsh||!p.dsh.bundle||!p.dsh.client){console.error('  FAIL: dsh.bundle / dsh.client missing');process.exit(1)}console.log('  '+p.name+'@'+p.version+'  dsh.bundle='+p.dsh.bundle.patch+'  client='+p.dsh.client.platform)"
if errorlevel 1 goto fail

echo.
echo [2/4] npm publish --access public
echo       (paste the 6-digit code from your authenticator when asked)
call npm publish --access public
if errorlevel 1 goto fail

echo.
echo [3/4] remove the 0.0.0-stage placeholder
call npm unpublish dsh-theme-quartet@0.0.0-stage --force

echo.
echo [4/4] verify
call npm view dsh-theme-quartet version
call npm dist-tag ls dsh-theme-quartet

echo.
echo Done. Package page: https://www.npmjs.com/package/dsh-theme-quartet
goto end

:fail
echo.
echo Publish failed.
echo   EOTP  -> rerun with the code inline:  npm publish --access public --otp=123456
echo   E403  -> the npm account owns the name, check 2FA mode on npmjs.com
echo   other -> see the npm error above
endlocal
exit /b 1

:end
endlocal
