export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-4">
          Last updated: {new Date().toLocaleDateString()}
        </p>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
          <p>
            Our comprehensive Privacy Policy is currently being finalized. We take your privacy seriously
            and are committed to protecting your personal health information in compliance with HIPAA regulations.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Contact</h2>
          <p>
            For privacy-related questions or concerns, please contact us at{" "}
            <a href="mailto:privacy@writegreatnotes.ai" className="text-jordy-blue hover:underline">
              privacy@writegreatnotes.ai
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
