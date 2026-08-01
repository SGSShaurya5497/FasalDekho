# FasalDekho Android Setup Guide

Convert the React web app into a native Android APK using CapacitorJS.

---

## Prerequisites

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18+ | https://nodejs.org |
| JDK | 11+ (17 or 21 recommended) | https://adoptium.net |
| Android Studio | Hedgehog+ | https://developer.android.com/studio |
| Android SDK Platform | API 33+ | (via Android Studio → SDK Manager) |

> **JDK tip:** Android Studio ships with a bundled JBR (JetBrains Runtime, OpenJDK 21) at `C:\Program Files\Android\Android Studio\jbr`. You can use this instead of installing a separate JDK.
> **Android Studio vs. CLI tools:** You can use the full Android Studio IDE **or** just the [command-line tools](https://developer.android.com/studio#command-tools). Android Studio is easier for beginners.

---

## 1. Configure `ANDROID_HOME` and `JAVA_HOME`

After installing Android Studio, set the environment variables in PowerShell:

```powershell
# Android SDK
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "$env:LOCALAPPDATA\Android\Sdk", "User")
[System.Environment]::SetEnvironmentVariable("PATH", "$env:PATH;$env:LOCALAPPDATA\Android\Sdk\tools;$env:LOCALAPPDATA\Android\Sdk\platform-tools", "User")

# Java — use Android Studio's bundled JDK (no separate install needed)
[System.Environment]::SetEnvironmentVariable("JAVA_HOME", "C:\Program Files\Android\Android Studio\jbr", "User")
[System.Environment]::SetEnvironmentVariable("PATH", "$env:JAVA_HOME\bin;$env:PATH", "User")
```

Restart your terminal, then verify:
```powershell
java -version   # should print openjdk 21.x
adb version     # should print ADB version
```

---

## 2. Configure Backend URL

Before building, edit `frontend/.env.production` and replace the placeholder with your deployed FastAPI backend URL:

```env
REACT_APP_API_BASE=https://your-server.com
REACT_APP_API_URL=https://your-server.com/predict
```

For local LAN testing (phone on same WiFi as your PC), use your machine's LAN IP:
```env
REACT_APP_API_BASE=http://192.168.1.XXX:8000
```

---

## 3. Install Dependencies

```powershell
cd "Crop Detection\frontend"
npm install --legacy-peer-deps
```

---

## 4. Build the React App

```powershell
npm run build
```

This creates the `build/` folder which Capacitor wraps in the Android WebView.

---

## 5. Initialize Capacitor (already done — skip if `capacitor.config.json` exists)

```powershell
npx cap init FasalDekho com.fasaldekho.app --web-dir build
```

---

## 6. Add the Android Platform (already done — skip if `android/` folder exists)

```powershell
npx cap add android
```

---

## 7. Sync Web Assets to Android

Run this **every time** you rebuild the React app:

```powershell
npx cap sync android
```

---

## 8. Add Android Permissions

After `npx cap add android`, edit `android/app/src/main/AndroidManifest.xml`.
Add inside the `<manifest>` tag (above `<application>`):

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
<uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
<!-- Legacy storage permission for Android < 13 -->
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
```

---

## 9. Build the APK

### Option A — Debug APK (fastest, no signing needed)

```powershell
cd android
.\gradlew assembleDebug
```

APK output: `android\app\build\outputs\apk\debug\app-debug.apk`

### Option B — Open in Android Studio

```powershell
npx cap open android
```

Then in Android Studio: **Build → Build Bundle(s) / APK(s) → Build APK(s)**

---

## 10. Install on Device

Enable **Developer Options** and **USB Debugging** on your Android phone, then:

```powershell
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

Or simply copy the `.apk` file to your phone and open it (enable "Install from unknown sources").

---

## Development Workflow

```
Edit React code
  -> npm run build
  -> npx cap sync android
  -> npx cap open android  (or .\gradlew assembleDebug)
  -> Install APK on device
```

For hot-reload during development (runs in browser):
```powershell
npm start
```

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `ANDROID_HOME not set` | Set env var as shown in Step 1 |
| `SDK location not found` | Open Android Studio -> SDK Manager -> copy SDK path -> set `ANDROID_HOME` |
| Camera not opening on device | Check app permissions in Android Settings |
| API calls failing on device | Use LAN IP (not `localhost`) in `.env` |
| `adb: command not found` | Add `platform-tools` to PATH |
| Build fails with Java errors | Ensure JDK 17 is active: `java -version` |

---

## App Details

| Property | Value |
|----------|-------|
| App ID | `com.fasaldekho.app` |
| App Name | FasalDekho |
| Min SDK | 22 (Android 5.1+) |
| Target SDK | 33 (Android 13) |
| Architecture | ARM64 + x86_64 |
