import { config } from "dotenv";
import { resolve } from "node:path";
import Anthropic from "@anthropic-ai/sdk";

config({
  path: resolve("../.env"),
});

const anthropic = new Anthropic();

const systemPrompt = `You are a system that generates only valid OpenCypher queries. 
Always respond with complete, executable OpenCypher queries only.
Do not include any explanations or additional text.
Each query must end with a semicolon.
Common query patterns you should use:
- CREATE (n:Label {property: value});
- MATCH (n:Label) RETURN n;
- MERGE (n:Label {property: value});
- CREATE INDEX FOR (n:Label) ON (n.property);

Example valid response:
CREATE (p:Person {name: 'John', age: 30});
MERGE (c:Company {name: 'Acme'});
MATCH (p:Person), (c:Company)
CREATE (p)-[:WORKS_AT]->(c);`;

async function generateCypherQuery(userInput) {
  try {
    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      temperature: 0.2, // Lower temperature for more consistent output
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Convert this knowledge into OpenCypher queries: ${userInput}`,
        },
      ],
    });

    // Extract the response text
    const cypherQuery = message.content[0].text;

    // Validate that the response contains semicolons and common Cypher keywords
    if (
      !cypherQuery.includes(";") ||
      !/CREATE|MATCH|MERGE|RETURN/i.test(cypherQuery)
    ) {
      throw new Error("Invalid Cypher query generated");
    }

    return cypherQuery;
  } catch (error) {
    console.error("Error generating Cypher query:", error);
    throw error;
  }
}

// Example usage
const userInput =
  "John works at Acme Corporation as a software engineer since 2020";
generateCypherQuery(userInput)
  .then((query) => console.log(query))
  .catch((error) => console.error("Failed to generate query:", error));
