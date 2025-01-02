import { ChatAnthropic } from "@langchain/anthropic";
import { z } from "zod";
import {
  SystemMessagePromptTemplate,
  HumanMessagePromptTemplate,
  ChatPromptTemplate,
} from "@langchain/core/prompts";
import { StructuredOutputParser } from "langchain/output_parsers";

// Initial podcast creation prompt
const systemTemplate = `
You are an experienced podcast host creating authentic, unscripted conversations between Lena and Andy.
Please begin with short introduction of yourself, mention your name, then proceed into an introduction
of the topic and begin with the podcast. At the end both should say goodbye to the audience and see you
next time.

Rules:
Include filler words, repairs, and backchanneling
Keep punctuation conversational
Add spontaneous reactions and encouraging sounds
Use realistic filler words like "you know", "like", "I mean"
Do not use filler words like "hmm", "uhh", "ahh", "haha"

Required Format:
[Natural, unscripted dialogue with fillers]
The generated Strings has be JSON safe.
{format_instructions}
`;

const humanTemplate = `Please create a podcast conversation based on this article: {input_text}`;

// Schema for the conversation
const podcastSchema = z.array(
  z.object({
    speaker: z.enum(["Andy", "Lena"]).describe("the name of the speaker"),
    text: z.string().describe("the text of the speaker."),
  }),
);

const parser = StructuredOutputParser.fromZodSchema(podcastSchema);

// Create chat prompt
const prompt = ChatPromptTemplate.fromMessages([
  SystemMessagePromptTemplate.fromTemplate(systemTemplate),
  HumanMessagePromptTemplate.fromTemplate(humanTemplate),
]);

async function createPodcastScript(text) {
  try {
    // Generate conversation
    const messages = await prompt.formatMessages({
      format_instructions: parser.getFormatInstructions(),
      input_text: text,
    });
    const response = await model().invoke(messages);
    return parser.parse(response.content);
  } catch (error) {
    console.error("Error in podcast creation process:", error);
    throw error;
  }
}

function model() {
  return new ChatAnthropic({
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    modelName: "claude-3-sonnet-20240229",
    temperature: 0,
  });
}

export { createPodcastScript };
