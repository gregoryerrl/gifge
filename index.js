const express = require("express");
const {registerFont, createCanvas} = require("canvas");
const GIFEncoder = require("gif-encoder");
const path = require("path");

const app = express();

registerFont(path.join(__dirname, "DejaVuSans.ttf"), {family: "DejaVuSans"});

function createFrame(
  timeStr,
  width = 400,
  height = 200,
  bgColor = "#000000",
  textColor = "#FF0000"
) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  ctx.font = '30px "DejaVuSans"';
  ctx.fillStyle = textColor;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  ctx.fillText(timeStr, width / 2, height / 2);

  return ctx.getImageData(0, 0, width, height).data;
}

app.get("/generate-countdown", (req, res) => {
  try {
    const hours = parseInt(req.query.hours) || 0;
    const minutes = parseInt(req.query.minutes) || 0;
    const seconds = parseInt(req.query.seconds) || 0;
    const duration = Math.min(parseInt(req.query.duration) || 60, 60);
    const width = parseInt(req.query.width) || 400;
    const height = parseInt(req.query.height) || 200;
    const bgColor = req.query.bgColor || "#000000";
    const textColor = req.query.textColor || "#FF0000";
    const fps = parseInt(req.query.fps) || 1;

    res.setHeader("Content-Type", "image/gif");
    res.setHeader("Content-Disposition", 'inline; filename="countdown.gif"');
    res.setHeader("Cache-Control", "no-store");

    const encoder = new GIFEncoder(width, height);
    const buffers = [];

    encoder.setFrameRate(fps);
    encoder.setQuality(10);
    encoder.setRepeat(0);

    encoder.on("data", (buffer) => buffers.push(buffer));
    encoder.on("end", () => {
      const completeGif = Buffer.concat(buffers);
      res.end(completeGif);
    });

    encoder.writeHeader();

    const totalTimeSeconds = hours * 3600 + minutes * 60 + seconds;
    const totalFrames = Math.min(duration * fps, totalTimeSeconds * fps);

    for (let frame = 0; frame <= totalFrames; frame++) {
      const remainingSeconds = totalTimeSeconds - Math.floor(frame / fps);
      const h = Math.floor(remainingSeconds / 3600);
      const m = Math.floor((remainingSeconds % 3600) / 60);
      const s = remainingSeconds % 60;

      const timeStr = `${h.toString().padStart(2, "0")}:${m
        .toString()
        .padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
      const frameData = createFrame(timeStr, width, height, bgColor, textColor);
      encoder.addFrame(frameData);
    }

    encoder.finish();
  } catch (error) {
    console.error("Error generating GIF:", error);
    res.status(500).send("Error generating GIF");
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
