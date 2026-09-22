import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GOOGLE_AI_KEY,
});

const SYSTEM_INSTRUCTION = `
You are an expert MERN stack developer with 10 years of experience.

You write modular, scalable, well-commented code following best practices.
You handle edge cases and errors properly.

IMPORTANT:
Always return valid JSON.
Never return Markdown.
Never wrap the JSON in \`\`\`json or other code fences.

Your response MUST have this structure:

{
  "text": "explanation of what you built",
  "fileTree": {},
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "node",
    "commands": ["server.js"]
  }
}

FILE TREE RULES:

Every file MUST use:

{
  "filename.ext": {
    "file": {
      "contents": "file content"
    }
  }
}

Nested folders MUST use nested objects.

Example:

{
  "src": {
    "components": {
      "Button.jsx": {
        "file": {
          "contents": "export default function Button() { return <button>Click</button> }"
        }
      }
    },
    "App.jsx": {
      "file": {
        "contents": "export default function App() { return <h1>Hello</h1> }"
      }
    }
  }
}

RULES:

- Folder nodes are plain objects.
- File nodes MUST contain "file" and "contents".
- NEVER use paths such as "src/App.jsx" as keys.
- NEVER return null or undefined file contents.
- ALWAYS include package.json when generating an application.
- package.json MUST contain all dependencies used by the generated code.
- ALWAYS include a start script.
- Generate complete working code.
- Do not leave TODO placeholders.
- Make imports match the generated file structure.
- Make frontend and backend code compatible.
- Handle errors properly.
- Use modern JavaScript.
- Prefer ES modules when appropriate.

PACKAGE.JSON RULES:

For Vite:

"start": "vite"

For React with react-scripts:

"start": "react-scripts start"

For Express:

"start": "node server.js"

If the user is only greeting you, return:

{
  "text": "Hello! How can I help you today? I can build Express APIs, React apps, MERN stacks, and more.",
  "fileTree": {},
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "node",
    "commands": ["server.js"]
  }
}
`;

// -----------------------------------------------------
// Safely extract JSON from Gemini response
// -----------------------------------------------------

function safeJsonParse(text) {
  if (!text || typeof text !== "string") {
    throw new Error("Gemini returned an empty response.");
  }

  // Remove Markdown code fences if Gemini adds them
  let cleaned = text
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();

  // First attempt
  try {
    return JSON.parse(cleaned);
  } catch (error) {
    // Continue with brace extraction
  }

  const start = cleaned.indexOf("{");

  if (start === -1) {
    throw new Error("Gemini did not return valid JSON.");
  }

  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let i = start; i < cleaned.length; i++) {
    const char = cleaned[i];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === "\\") {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === "{") {
      depth++;
    }

    if (char === "}") {
      depth--;

      if (depth === 0) {
        const jsonText = cleaned.slice(start, i + 1);

        try {
          return JSON.parse(jsonText);
        } catch (error) {
          throw new Error(
            "Gemini returned malformed JSON."
          );
        }
      }
    }
  }

  throw new Error("Gemini JSON response was incomplete.");
}

// -----------------------------------------------------
// Find package.json anywhere inside fileTree
// -----------------------------------------------------

function findPackageJson(tree) {
  if (!tree || typeof tree !== "object") {
    return null;
  }

  for (const [key, value] of Object.entries(tree)) {
    if (
      key === "package.json" &&
      value?.file?.contents !== undefined
    ) {
      return value;
    }

    if (
      value &&
      typeof value === "object" &&
      !value.file
    ) {
      const result = findPackageJson(value);

      if (result) {
        return result;
      }
    }
  }

  return null;
}

// -----------------------------------------------------
// Find application entry file
// -----------------------------------------------------

function findEntryFile(tree) {
  const candidates = [
    "server.js",
    "index.js",
    "app.js",
  ];

  for (const filename of candidates) {
    if (tree?.[filename]?.file?.contents) {
      return filename;
    }
  }

  return "server.js";
}

// -----------------------------------------------------
// Ensure package.json has a start script
// -----------------------------------------------------

function ensureStartScript(fileTree) {
  if (!fileTree) {
    return fileTree;
  }

  const packageNode = findPackageJson(fileTree);

  if (!packageNode) {
    return fileTree;
  }

  let packageJson;

  try {
    packageJson = JSON.parse(
      packageNode.file.contents
    );
  } catch (error) {
    packageJson = {};
  }

  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  if (!packageJson.scripts.start) {
    const dependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    if (dependencies["react-scripts"]) {
      packageJson.scripts.start =
        "react-scripts start";
    } else if (dependencies["vite"]) {
      packageJson.scripts.start = "vite";
    } else {
      packageJson.scripts.start =
        `node ${findEntryFile(fileTree)}`;
    }
  }

  packageNode.file.contents = JSON.stringify(
    packageJson,
    null,
    2
  );

  return fileTree;
}

// -----------------------------------------------------
// Generate result using Gemini Interactions API
// -----------------------------------------------------

export const generateResult = async (prompt) => {
  const maxRetries = 3;
  let delay = 2000;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `🤖 Sending request to Gemini (attempt ${attempt})...`
      );

      const interaction = await ai.interactions.create({
        model: "gemini-3.8-flash",

        input: [
          {
            type: "text",
            text: `${SYSTEM_INSTRUCTION}

USER REQUEST:
${prompt}`,
          },
        ],

        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: {
            type: "object",
            properties: {
              text: {
                type: "string",
              },

              fileTree: {
                type: "object",
              },

              buildCommand: {
                type: "object",
              },

              startCommand: {
                type: "object",
              },
            },
            required: [
              "text",
              "fileTree",
              "buildCommand",
              "startCommand",
            ],
          },
        },
      });

      const responseText = interaction.output_text;

      if (!responseText) {
        throw new Error(
          "Gemini returned an empty response."
        );
      }

      console.log("✅ Gemini response received");

      const parsed = safeJsonParse(responseText);

      if (!parsed || typeof parsed !== "object") {
        throw new Error(
          "Gemini returned an invalid response."
        );
      }

      if (parsed.fileTree) {
        parsed.fileTree = ensureStartScript(
          parsed.fileTree
        );
      }

      return parsed;

    } catch (error) {
      console.error(
        `❌ Gemini attempt ${attempt} failed:`,
        error.message
      );

      const message =
        error?.message?.toLowerCase() || "";

      const retryable =
        message.includes("503") ||
        message.includes("service unavailable") ||
        message.includes("high demand") ||
        message.includes("429") ||
        message.includes("quota") ||
        message.includes("resource exhausted");

      if (
        retryable &&
        attempt < maxRetries
      ) {
        console.log(
          `⏳ Retrying in ${delay / 1000} seconds...`
        );

        await new Promise((resolve) =>
          setTimeout(resolve, delay)
        );

        delay *= 2;

        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Gemini request failed after all retries."
  );
};