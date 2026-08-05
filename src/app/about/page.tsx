import type { Metadata } from "next";

import { AboutProjectJournal } from "@/features/about/components/about-project-journal";

export const metadata: Metadata = {
  title: "关于回中诗社",
  description: "回中诗社杂诗集的来源、继续维护的原因、网站重写历程与当前版本记录。",
};

export default function AboutPage() {
  return <AboutProjectJournal />;
}
