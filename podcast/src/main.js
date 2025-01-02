import { config } from "dotenv";
import { resolve } from "node:path";

config({
  path: resolve("../.env"),
});

import { createAudioStreamFromText } from "./audio.js";
import { createPodcastScript } from "./llm.js";

const text = `
  Let me help you explain R strategies in the circular economy. It seems you're interested in the fundamental principles that help create a more sustainable and circular economic model.

  Here are the key R strategies that are commonly recognized in circular economy frameworks:

  Refuse - Choosing not to use resources when possible and preventing waste from being created in the first place. For example, declining unnecessary packaging or single-use items.

  Reduce - Minimizing the use of raw materials and energy in production and consumption. This includes designing products to use fewer resources and encouraging consumers to buy and use less.

  Reuse - Using products, components, or materials again for their original purpose without significant modification. Examples include refillable containers or second-hand items.

  Repair - Fixing and maintaining products to extend their lifespan and keep them functional for their original purpose. This includes making products easier to repair through better design.

  Refurbish - Restoring used products to a good working condition by replacing or repairing major components that are faulty or close to failure.

  Remanufacture - Taking a product apart, checking and cleaning all components, and reassembling it with some new parts to create a product that performs like new.

  Repurpose - Using a product or its components for a different purpose than its original function. For example, turning old tires into playground surfaces.

  Recycle - Processing materials to create new products, though often of lower quality than the original (downcycling). This should be the last resort among R strategies.
  `;

const podcastScript = await createPodcastScript(text);
await createAudioStreamFromText(podcastScript, "../output/podcast.mp3");
