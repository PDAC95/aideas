import PageMeta from "@/seo/PageMeta";
// HERO swapped: AIDEAS uses the Index 7 hero on top of the Index 2 home layout
// per the v1.3 reorg decision (2026-05-21). Original Index 2 hero
// (`@/shared/sections/index-2/Section1`) is intentionally NOT imported.
import HeroSection from "@/shared/sections/index-7/Section1";
import Section2 from "@/shared/sections/index-2/Section2";
import Section3 from "@/shared/sections/index-2/Section3";
import Section4 from "@/shared/sections/index-2/Section4";
import Section5 from "@/shared/sections/index-2/Section5";
import Section6 from "@/shared/sections/index-2/Section6";
import Section7 from "@/shared/sections/index-2/Section7";
import Section8 from "@/shared/sections/index-2/Section8";
import Section9 from "@/shared/sections/index-2/Section9";
import Section10 from "@/shared/sections/index-2/Section10";
import Section11 from "@/shared/sections/index-2/Section11";
import Section12 from "@/shared/sections/index-2/Section12";
import Section13 from "@/shared/sections/index-2/Section13";

export default function HomePage() {
  return (
    <>
      <PageMeta title="AIDEAS — AI automation for Ontario SMBs" />
      <HeroSection />
      <Section2 />
      <Section3 />
      <Section4 />
      <Section5 />
      <Section6 />
      <Section7 />
      <Section8 />
      <Section9 />
      <Section10 />
      <Section11 />
      <Section12 />
      <Section13 />
    </>
  );
}
