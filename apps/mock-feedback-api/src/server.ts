import express from "express";
import multer from "multer";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = Number(process.env.PORT ?? 8787);
type UploadedFiles = Record<string, Express.Multer.File[]>;

app.get("/health", (_request, response) => {
  response.json({ ok: true });
});

app.post(
  "/v1/feedback",
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "screenshot", maxCount: 1 },
    { name: "metadata", maxCount: 1 }
  ]),
  (request, response) => {
    const files = (request as express.Request & { files?: UploadedFiles }).files;
    const metadataRaw = request.body.metadata;
    if (typeof metadataRaw !== "string") {
      response.status(400).json({ error: "metadata must be a JSON string form field" });
      return;
    }

    let metadata: Record<string, unknown>;
    try {
      metadata = JSON.parse(metadataRaw) as Record<string, unknown>;
    } catch {
      response.status(400).json({ error: "metadata is not valid JSON" });
      return;
    }

    const id = crypto.randomUUID();
    const audioAttached = Array.isArray(files?.audio) && files.audio.length > 0;
    const screenshotAttached =
      Array.isArray(files?.screenshot) && files.screenshot.length > 0;

    console.info("feedback received", {
      id,
      metadata,
      audioAttached,
      screenshotAttached
    });

    response.status(202).json({
      id,
      status: "accepted"
    });
  }
);

app.listen(port, () => {
  console.log(`mock-feedback-api listening on http://localhost:${port}`);
});
