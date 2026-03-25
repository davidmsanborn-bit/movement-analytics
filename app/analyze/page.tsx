import { redirect } from "next/navigation";

/**
 * Squat is the only movement in MVP — send /analyze to the squat flow.
 */
export default function AnalyzePage() {
  redirect("/analyze/squat");
}
