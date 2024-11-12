export function getBaseUrl() {
  if (process.env.VERCEL_ENV === "production") {
    return "https://jean-technologies.vercel.app";
  }
  if (process.env.VERCEL_ENV === "development" && process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}
