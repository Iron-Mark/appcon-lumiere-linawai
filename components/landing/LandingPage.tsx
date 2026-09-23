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
 * Demo sections use illustrative copy only; the app adapts user content
 * through lib/adapt in /read. Visual direction: warm paper, ink, olive.
 */
export function LandingPage() {
  return (
    <>
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
    </>
  );
}

export default LandingPage;
