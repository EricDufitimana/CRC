export default function handler(req, res) {
  // Simple health check endpoint
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
}
