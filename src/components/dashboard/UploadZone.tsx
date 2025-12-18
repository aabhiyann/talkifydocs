import UploadButton from "../UploadButton";

/**
 * UploadZone component for the dashboard.
 * Uses the UploadButton (which embeds the drag-and-drop area and dialog).
 * This matches the spec while reusing the existing upload UX.
 */
export const UploadZone = () => {
  return <UploadButton />;
};
