/**
 * imagekit.js — DEPRECATED shim
 *
 * ImageKit has been replaced by in-database blob storage (imagestore.js).
 * This file is kept only so that any legacy imports don't crash.
 * New code must import from '../services/imagestore' instead.
 */

function isImageKitConfigured() { return false }

async function uploadImageToImageKit() {
  throw new Error('ImageKit is disabled. Use services/imagestore.js for image uploads.')
}

async function deleteImageFromImageKit() {
  return { skipped: true }
}

module.exports = {
  imagekit: null,
  isImageKitConfigured,
  uploadImageToImageKit,
  deleteImageFromImageKit,
}
