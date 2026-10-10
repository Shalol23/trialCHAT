import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { Overview } from "@/components/overview";
import { Methodology, About } from "@/components/research-sections";
import { Results } from "@/components/results";
import { Demo } from "@/components/demo";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return <><SiteHeader/><main id="main"><Hero/><Overview/><Methodology/><Results/><Demo/><About/></main><SiteFooter/></>;
}
