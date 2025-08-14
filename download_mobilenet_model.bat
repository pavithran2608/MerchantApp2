@echo off
setlocal EnableExtensions EnableDelayedExpansion
echo ==================================================
echo  MobileNet TFLite Model Downloader (Non-interactive)
echo ==================================================
echo.

REM Ensure assets directory exists
if not exist "android\app\src\main\assets" mkdir "android\app\src\main\assets"

REM Clean any previous temp/downloads
if exist "mobilenet_model.zip" del /q "mobilenet_model.zip"
if exist "temp_extract" rmdir /s /q "temp_extract"

echo Downloading MobileNet V2 TFLite model (TensorFlow hosting)...
REM Use curl.exe to download (follows redirects with -L)
curl -L -o mobilenet_model.zip "https://storage.googleapis.com/download.tensorflow.org/models/mobilenet_v2_100_224_tflite_2018_10_02.zip"

if not exist "mobilenet_model.zip" (
  echo ❌ Could not download model archive. Aborting.
  exit /b 1
)

echo Extracting archive...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Expand-Archive -Path 'mobilenet_model.zip' -DestinationPath 'temp_extract' -Force"

if not exist "temp_extract" (
  echo ❌ Extraction failed. Aborting.
  del /q "mobilenet_model.zip" >nul 2>nul
  exit /b 1
)

echo Searching for .tflite file in extracted contents...
set "FOUND_TFLITE="
for /r "temp_extract" %%F in (*.tflite) do (
  set "FOUND_TFLITE=%%F"
  goto :FOUND
)

:FOUND
if "%FOUND_TFLITE%"=="" (
  echo ❌ No .tflite file found in archive.
  rmdir /s /q "temp_extract" >nul 2>nul
  del /q "mobilenet_model.zip" >nul 2>nul
  exit /b 1
)

echo Found: "%FOUND_TFLITE%"
set "TARGET=android\app\src\main\assets\mobilenet_v2_face_recognition.tflite"
copy /y "%FOUND_TFLITE%" "%TARGET%" >nul
if errorlevel 1 (
  echo ❌ Failed to copy model to assets.
  rmdir /s /q "temp_extract" >nul 2>nul
  del /q "mobilenet_model.zip" >nul 2>nul
  exit /b 1
)

echo Model copied to: %TARGET%

echo Cleaning up temporary files...
rmdir /s /q "temp_extract" >nul 2>nul
del /q "mobilenet_model.zip" >nul 2>nul

echo Done.
exit /b 0
