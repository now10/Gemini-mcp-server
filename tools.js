// Tool implementations
export const tools = {
  get_time: async () => {
    return new Date().toISOString();
  },

  echo: async ({ text }) => {
    return `Echo: ${text}`;
  }
};

// Tool definitions for Gemini
export const toolDefinitions = [
  {
    name: "get_time",
    description: "Get current server time",
    parameters: {
      type: "object",
      properties: {}
    }
  },
  {
    name: "echo",
    description: "Echo back user input",
    parameters: {
      type: "object",
      properties: {
        text: { type: "string" }
      },
      required: ["text"]
    }
  }
];
