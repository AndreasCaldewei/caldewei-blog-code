import { writeFile } from "fs/promises";
import { resolve } from "path";

async function createAudioStreamFromText(
  script = [],
  outputPath = "../output/podcast.mp3",
) {
  const chunks = [];
  const requestIds = [];

  for (let i = 0; i < script.length; i++) {
    const { speaker, text } = script[i];
    const previousText = i > 0 ? script[i - 1].text : "";
    const nextText = i < script.length - 1 ? script[i + 1].text : "";

    let voice;
    if (speaker === "Andy") {
      voice = "TX3LPaxmHKxFdv7VOQHJ";
    } else if (speaker === "Lena") {
      voice = "Xb7hH8MSUJpSbSDYk0k2";
    } else {
      throw new Error("speaker not supported");
    }

    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voice}/stream`,
      {
        method: "POST",
        headers: {
          "xi-api-key": process.env.ELEVENLABS_API_KEY,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: `${text}`,
          model_id: "eleven_turbo_v2_5",
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
            style: 0.05,
            use_speaker_boost: true,
          },
          previous_text: previousText,
          next_text: nextText,
          previous_request_ids: requestIds.slice(-3),
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}}`);
    }

    // Get and store the request ID from response headers
    const requestId = response.headers.get("request-id");
    if (requestId) {
      requestIds.push(requestId);
    }

    const reader = response.body.getReader();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }

    // Add silence buffer after each segment except the last one
    if (i < script.length - 1) {
      const silenceBuffer = createSilenceBuffer();
      chunks.push(silenceBuffer);
    }
  }

  const content = Buffer.concat(chunks);
  try {
    await writeFile(outputPath, content);
    console.log(`Audio file saved successfully to: ${resolve(outputPath)}`);
    return content;
  } catch (error) {
    console.error("Error saving audio file:", error);
    throw error;
  }
}

// Pre-generated MP3 silence buffer (1 second of silence)
const SILENCE_BUFFER = Buffer.from([
  0xff,
  0xf3,
  0x48,
  0xc4, // Frame sync and header
  0x00,
  0x00,
  0x01,
  0xc0, // Frame length and flags
  0x00,
  0x00,
  0x00,
  0x00, // Audio data (silence)
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0x00,
  0xff,
  0xf3,
  0x48,
  0xc4, // Next frame header
  0x00,
  0x00,
  0x01,
  0xc0,
]);

function createSilenceBuffer(
  durationMs = 200 + Math.floor(Math.random() * 301),
) {
  // Calculate how many copies of the silence buffer we need
  // Our base buffer is 1 second, so we divide by 1000 to get the fraction needed
  const bufferCopies = Math.ceil(durationMs / 1000);
  const buffers = Array(bufferCopies).fill(SILENCE_BUFFER);
  return Buffer.concat(buffers);
}

export { createAudioStreamFromText };
