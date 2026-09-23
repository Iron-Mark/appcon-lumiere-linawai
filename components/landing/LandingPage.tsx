import { Navbar } from "./Navbar";
import { Hero } from "./Hero";
import { HowItWorks } from "./HowItWorks";
import { Features } from "./Features";
import { Verification } from "./Verification";
import { Playground } from "./Playground";
import { GetStarted } from "./GetStarted";
import { Faq } from "./Faq";
import { Footer } from "./Footer";

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
        <GetStarted />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}

export default LandingPage;
