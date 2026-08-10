import type { Metadata } from "next";

import { AboutProjectJournal } from "@/features/about/components/about-project-journal";

export const metadata: Metadata = {
  title: "关于回中诗社",
  description: "回中诗社的来源、四次迁徙、今天仍被维护的原因与以后准备留下的内容。",
};

export default function AboutPage() {
  return <AboutProjectJournal />;
}
