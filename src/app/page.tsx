import { redirect } from "@/i18n/navigation";
import { defaultLocale } from "@/i18n/routing";

export default function Home() {
  redirect({ href: "/", locale: defaultLocale });
}
