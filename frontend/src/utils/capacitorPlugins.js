/**
 * capacitorPlugins.js — Platform-aware abstraction layer for native Capacitor plugins.
 *
 * On native Android/iOS: uses @capacitor/camera and @capacitor/geolocation.
 * On web/browser:        falls back to standard browser APIs (input[type=file], navigator.geolocation).
 *
 * All functions are async and return plain JS objects so callers don't need
 * to know whether they're running on native or web.
 */

// Lazily import Capacitor so the web bundle doesn't break if plugins aren't loaded.
const getCapacitor = () => {
  try {
    return require("@capacitor/core").Capacitor;
  } catch {
    return null;
  }
};

const getCameraPlugin = () => {
  try {
    return require("@capacitor/camera");
  } catch {
    return null;
  }
};

const getGeolocationPlugin = () => {
  try {
    const mod = require("@capacitor/geolocation");
    return mod.Geolocation;
  } catch {
    return null;
  }
};

/**
 * Convert a base64 data URI to a File object (used after native camera capture).
 */
const dataUriToFile = (dataUri, filename = "leaf_capture.jpg") => {
  const [header, data] = dataUri.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i);
  return new File([array], filename, { type: mime });
};

/**
 * Open the native camera (or browser camera input as fallback).
 * Returns a File object ready to POST to the API, or null if cancelled.
 */
export const pickImageFromCamera = async () => {
  const Capacitor = getCapacitor();
  if (Capacitor && Capacitor.isNativePlatform()) {
    const camMod = getCameraPlugin();
    if (!camMod) return null;
    const { Camera, CameraResultType, CameraSource } = camMod;
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Camera,
        quality: 90,
        correctOrientation: true,
        allowEditing: false,
      });
      if (!photo?.dataUrl) return null;
      return dataUriToFile(photo.dataUrl, "camera_leaf.jpg");
    } catch (err) {
      // User cancelled
      console.log("Camera cancelled:", err);
      return null;
    }
  }
  // Web fallback: programmatically trigger a hidden input[capture]
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.setAttribute("capture", "environment");
    input.onchange = (e) => resolve(e.target.files?.[0] || null);
    input.oncancel = () => resolve(null);
    input.click();
  });
};

/**
 * Open the native photo gallery (or browser file picker as fallback).
 * Returns a File object, or null if cancelled.
 */
export const pickImageFromGallery = async () => {
  const Capacitor = getCapacitor();
  if (Capacitor && Capacitor.isNativePlatform()) {
    const camMod = getCameraPlugin();
    if (!camMod) return null;
    const { Camera, CameraResultType, CameraSource } = camMod;
    try {
      const photo = await Camera.getPhoto({
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Photos,
        quality: 90,
        correctOrientation: true,
        allowEditing: false,
      });
      if (!photo?.dataUrl) return null;
      return dataUriToFile(photo.dataUrl, "gallery_leaf.jpg");
    } catch (err) {
      console.log("Gallery cancelled:", err);
      return null;
    }
  }
  // Web fallback: standard file input
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => resolve(e.target.files?.[0] || null);
    input.oncancel = () => resolve(null);
    input.click();
  });
};

/**
 * Get the device's current GPS location.
 * Returns { lat, lon } or null on error/denial.
 */
export const getCurrentLocation = async () => {
  const Capacitor = getCapacitor();
  if (Capacitor && Capacitor.isNativePlatform()) {
    const Geo = getGeolocationPlugin();
    if (!Geo) return null;
    try {
      const pos = await Geo.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
      });
      return { lat: pos.coords.latitude, lon: pos.coords.longitude };
    } catch (err) {
      console.log("Native geolocation error:", err);
      return null;
    }
  }
  // Web fallback: browser Geolocation API
  return new Promise((resolve) => {
    if (!("geolocation" in navigator)) return resolve(null);
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      (err) => {
        console.log("Browser geolocation denied/error:", err);
        resolve(null);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
};

/**
 * Request native camera + location permissions up-front.
 * No-op on web (browsers handle permissions on-demand).
 */
export const requestPermissions = async () => {
  const Capacitor = getCapacitor();
  if (!Capacitor || !Capacitor.isNativePlatform()) return;

  const camMod = getCameraPlugin();
  const Geo = getGeolocationPlugin();

  const results = await Promise.allSettled([
    camMod?.Camera?.requestPermissions({ permissions: ["camera", "photos"] }),
    Geo?.requestPermissions({ permissions: ["location"] }),
  ]);

  results.forEach((r) => {
    if (r.status === "rejected") {
      console.warn("Permission request failed:", r.reason);
    }
  });
};
