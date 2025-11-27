export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>

      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p>
            Our comprehensive Terms of Service are currently being finalized. By using Write Great Notes,
            you agree to comply with all applicable healthcare regulations including HIPAA.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p>
            For questions about our Terms of Service, please contact us at{" "}
            <a href="mailto:legal@writegreatnotes.ai" className="text-jordy-blue hover:underline">
              legal@writegreatnotes.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
