
// Parse request body only once
export async function parseRequestOnce(req: Request) {
  if (req.headers.get("content-type")?.includes("application/json")) {
    try {
      // Clone the request before consuming the body
      const clonedReq = req.clone();
      const body = await clonedReq.json();
      return { body, originalRequest: req };
    } catch (error) {
      console.error("Error parsing request body:", error);
      throw new Error("Invalid JSON in request body");
    }
  }
  return { body: {}, originalRequest: req };
}
