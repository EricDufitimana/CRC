export function CrpComingSoon({ title, blurb }: { title: string; blurb: string }) {
  return (
    <>
      <div className="crp-phead">
        <h1>{title}</h1>
      </div>
      <div className="crp-grid">
        <section className="crp-card c12">
          <div className="crp-chead">
            <h2>Coming soon</h2>
          </div>
          <div className="crp-empty">
            <p>{blurb}</p>
          </div>
        </section>
      </div>
    </>
  );
}
