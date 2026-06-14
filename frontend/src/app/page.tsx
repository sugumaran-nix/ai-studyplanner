import { redirect } from "next/navigation";

// Root "/" redirects to the dashboard
export default function HomePage() {
  redirect("/dashboard");
}
