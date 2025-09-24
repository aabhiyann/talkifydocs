import MaxWidthWrapper from "@/components/MaxWidthWrapper";

export default function StyleGuide() {
  return (
    <section className="py-24">
      <MaxWidthWrapper>
        <h1 className="text-display-lg mb-8 bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">Style Guide</h1>

        <div className="space-y-12">
          <section>
            <h2 className="text-heading-xl mb-4">Colors</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                "primary-500",
                "primary-600",
                "secondary-500",
                "accent-500",
                "error-500",
                "warning-500",
                "success-500",
              ].map((c) => (
                <div key={c} className="rounded-xl p-4 border border-secondary-200 dark:border-secondary-700">
                  <div className={`h-10 rounded-md bg-${c}`}></div>
                  <p className="mt-2 text-body-sm">{c}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-heading-xl mb-4">Typography</h2>
            <div className="space-y-4">
              <p className="text-display-lg">Display Large</p>
              <p className="text-heading-xl">Heading XL</p>
              <p className="text-heading-lg">Heading LG</p>
              <p className="text-body-lg">Body LG</p>
              <p className="text-body-md">Body MD</p>
              <p className="text-body-sm">Body SM</p>
            </div>
          </section>

          <section>
            <h2 className="text-heading-xl mb-4">Utilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="glass p-6 rounded-2xl">Glass</div>
              <div className="gradient-primary p-6 rounded-2xl text-white">Gradient Primary</div>
              <div className="shadow-strong p-6 rounded-2xl">Shadow Strong</div>
            </div>
          </section>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}


