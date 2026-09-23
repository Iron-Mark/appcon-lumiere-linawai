import { redirect } from "next/navigation";

/** Legacy in-app home — start at My Content. */
export default function HomePage() {
  redirect("/content");
}
