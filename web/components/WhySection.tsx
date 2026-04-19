import SectionHead from "./SectionHead";

export default function WhySection() {
  return (
    <section className="border-t border-border py-[72px]">
      <SectionHead kicker="Why" title="Inspect. Google. Check if free. Repeat." />
      <div className="mx-auto max-w-[640px] text-center text-[17px] leading-[1.6] text-dim">
        <p>
          That&rsquo;s the workflow for every font on every site. Inspect the
          CSS, search the name, verify the license, find a free alternative.{" "}
          <strong className="text-text-strong">wtfont does all of it once</strong>{" "}
          and hands back copy-paste code.
        </p>
      </div>
    </section>
  );
}
