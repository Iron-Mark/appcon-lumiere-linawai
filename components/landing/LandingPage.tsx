import dynamic from "next/dynamic";
import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { Features } from "./Features";
import { Verification } from "./Verification";
import { GetStarted } from "./GetStarted";
import { SocialProof } from "./SocialProof";
import { Faq } from "./Faq";
import { Footer } from "./Footer";

const Playground = dynamic(
  () => import("./Playground").then((mod) => ({ default: mod.Playground })),
  {
    loading: () => (
      <section
        id="try-it"
        aria-busy="true"
        aria-label="Loading interactive demo"
        className="landing-section"
      >
        <div className="mx-auto max-w-6xl">
          <div className="h-[28rem] animate-pulse rounded-xl bg-paper-inset/50 motion-reduce:animate-none" />
        </div>
      </section>
    ),
  },
);

/**
 * Public one-page landing. Primary path: Open Linaw → /onboarding.
 * Full-bleed editorial paper — not wrapped in product sidebar.
 */
export function LandingPage() {
  return (
    <div className="landing-shell relative min-h-screen w-full max-w-[100vw] overflow-x-hidden bg-paper text-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
      <Navbar />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <Verification />
        <Playground />
        <SocialProof />
        <GetStarted />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
