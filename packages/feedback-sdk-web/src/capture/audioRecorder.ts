export class AudioRecorder {
  private recorder?: MediaRecorder;
  private chunks: Blob[] = [];
  private stream?: MediaStream;

  async start() {
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.recorder = new MediaRecorder(this.stream, { mimeType: "audio/webm" });
    this.chunks = [];

    this.recorder.ondataavailable = (event) => {
      if (event.data.size > 0) this.chunks.push(event.data);
    };
    this.recorder.start();
  }

  async stop() {
    if (!this.recorder) throw new Error("Recorder not started");

    const done = new Promise<Blob>((resolve) => {
      this.recorder!.onstop = () => resolve(new Blob(this.chunks, { type: "audio/webm" }));
    });

    this.recorder.stop();
    this.stream?.getTracks().forEach((track) => track.stop());
    return done;
  }
}
