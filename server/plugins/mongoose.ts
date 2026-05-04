import mongoose from "mongoose";

export default defineNitroPlugin(async () => {
  const config = useRuntimeConfig();
  const uri = config.mongodbUri || process.env.MONGODB_URI;

  if (!uri) {
    console.warn("[mongoose] MONGODB_URI is not set — skipping connection");
    return;
  }

  try {
    await mongoose.connect(uri as string);
    console.log("[mongoose] Connected to MongoDB");
  } catch (e) {
    console.error("[mongoose] Connection failed:", e);
  }
});
