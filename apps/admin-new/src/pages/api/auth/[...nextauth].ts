// NOTE: This file has been replaced with tRPC-based authentication
// The authentication is now handled by the existing AuthContext and tRPC endpoints
// This file is kept for backwards compatibility but is no longer used

import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // This endpoint is no longer used as authentication is handled by tRPC
  // Return a 404 to indicate this endpoint is not available
  res.status(404).json({ error: "This endpoint is no longer used. Authentication is handled by tRPC." });
}
