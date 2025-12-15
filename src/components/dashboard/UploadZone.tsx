import UploadButton from "../UploadButton";

/**
 * Thin wrapper around the existing UploadButton-based dialog/dropzone.
 * This keeps the dashboard layout clean and matches the v2 component
 * architecture described in the technical design doc.
 */
export const UploadZone = () => {
  return <UploadButton />;
};


