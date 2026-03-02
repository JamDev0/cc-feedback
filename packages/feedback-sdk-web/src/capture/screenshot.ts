import html2canvas from "html2canvas";

export async function captureViewportScreenshot() {
  const canvas = await html2canvas(document.documentElement, {
    backgroundColor: null,
    useCORS: true,
    logging: false,
    ignoreElements: (element) =>
      element instanceof HTMLElement &&
      element.dataset.ccFeedbackOverlay === "true"
  });

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Failed to convert screenshot to blob"));
      else resolve(blob);
    }, "image/png");
  });
}
