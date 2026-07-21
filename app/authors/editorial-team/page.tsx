import { permanentRedirect } from "next/navigation";
import { EDITORIAL_PROFILE_URL } from "@/lib/editorial";

export default function Page() {
  permanentRedirect(EDITORIAL_PROFILE_URL);
}
