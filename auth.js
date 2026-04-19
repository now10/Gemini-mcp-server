export function authMiddleware(req, res, next) {
  const apiKey = req.headers["x-api-key"];

  if (!apiKey || apiKey !== process.env.MCP_SECRET) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  next();
}
