"use client";

import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [status, setStatus] = useState("idle"); // idle | sending | done
  const [duplicate, setDuplicate] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);
  const errRef = useRef(null);

  useEffect(() => {
    // Scroll reveals
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

    // Limit activity picks to 2
    const actBoxes = document.querySelectorAll('input[name="act"]');
    const limit = (e) => {
      const checked = document.querySelectorAll('input[name="act"]:checked');
      if (checked.length > 2) e.target.checked = false;
    };
    actBoxes.forEach((cb) => cb.addEventListener("change", limit));

    return () => {
      io.disconnect();
      actBoxes.forEach((cb) => cb.removeEventListener("change", limit));
    };
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;

    const fd = new FormData(formRef.current);
    const payload = {
      firstName: (fd.get("fname") || "").toString().trim(),
      email: (fd.get("femail") || "").toString().trim(),
      phone: (fd.get("fphone") || "").toString().trim(),
      ageBand: fd.get("fage"),
      neighbourhood: fd.get("fhood"),
      nights: fd.getAll("night"),
      activities: fd.getAll("act"),
      website: fd.get("website") || "",
    };

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
    if (!payload.firstName || !emailOk || payload.nights.length < 1 || payload.activities.length < 1) {
      setError("Fill in your name and a valid email, and pick at least one night and one activity.");
      errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    setError("");
    setStatus("sending");
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        setDuplicate(Boolean(data.duplicate));
        setStatus("done");
      } else {
        setStatus("idle");
        setError(data.error || "Something broke on our end. Try again in a minute.");
        errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } catch {
      setStatus("idle");
      setError("Couldn't reach the server. Check your connection and try again.");
      errRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  return (
    <>
      {/* ============ NAV ============ */}
      <nav className="nav" aria-label="Main">
        <div className="wrap nav-in">
          <a className="wordmark" href="#top">
            <span className="slot f" aria-hidden="true"></span>Regulars
          </a>
          <ul className="nav-links">
            <li><a href="#how">How it works</a></li>
            <li><a href="#activities">Activities</a></li>
            <li><a href="#rules">The rules</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li className="keep"><a className="btn btn-hot" href="#apply">Claim a spot</a></li>
          </ul>
        </div>
      </nav>

      {/* ============ HERO ============ */}
      <header className="hero" id="top">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow rise d1">Toronto · Pilot 001 · Crews of six</p>
            <h1>
              <span className="rise d1" style={{ display: "block" }}>Same crew.</span>
              <span className="rise d2" style={{ display: "block" }}>Same night.</span>
              <span className="rise d3" style={{ display: "block" }}><span className="accent">Every week.</span></span>
            </h1>
            <p className="hero-sub rise d4">
              Regulars places you in a <strong>fixed crew of six</strong> that meets weekly for something
              worth leaving the house for — bouldering, 5-a-side, a run that ends at a pub.
              No swiping. No mixers. No new strangers every week. <strong>One standing plan, held for you.</strong>
            </p>
            <div className="hero-ctas rise d4">
              <a className="btn btn-hot" href="#apply">Claim an open spot</a>
              <a className="btn btn-ghost" href="#how">How it works</a>
            </div>
          </div>

          {/* signature element: the standing reservation */}
          <div className="card-zone rise d5">
            <article className="crew-card" aria-label="Example crew card">
              <div className="cc-head">
                <span>Standing reservation</span>
                <span style={{ display: "flex", alignItems: "center", gap: 8 }}><span className="dot"></span>Active</span>
              </div>
              <div className="cc-body">
                <h3 className="cc-title">Crew 07 — The Junction</h3>
                <div className="cc-rows">
                  <div className="cc-row"><span className="k">When</span><span className="v">Tuesdays · 7:00 PM · Weekly</span></div>
                  <div className="cc-row"><span className="k">What</span><span className="v">Bouldering</span></div>
                  <div className="cc-row"><span className="k">Where</span><span className="v">Climbing gym, Junction Triangle</span></div>
                  <div className="cc-row"><span className="k">After</span><span className="v">Pint around the corner</span></div>
                </div>
                <div className="cc-roster">
                  <span className="slots" aria-label="5 of 6 roster spots filled">
                    <span className="slot f"></span><span className="slot f"></span><span className="slot f"></span>
                    <span className="slot f"></span><span className="slot f"></span><span className="slot hot"></span>
                  </span>
                  <span className="cc-open">1 spot open</span>
                </div>
                <a className="cc-cta" href="#apply">Take the last slot →</a>
              </div>
            </article>
          </div>
        </div>
      </header>

      {/* ============ STRIP ============ */}
      <div className="strip" role="presentation">
        <div className="wrap strip-in">
          <span>Bouldering</span><span className="slot f"></span>
          <span>5-a-side</span><span className="slot f"></span>
          <span>Run + pint</span><span className="slot f"></span>
          <span>Cards &amp; games</span><span className="slot f"></span>
          <span>Toronto · Summer 2026</span>
        </div>
      </div>

      {/* ============ MANIFESTO ============ */}
      <section className="manifesto">
        <div className="wrap">
          <p className="sec-label reveal">Why this works</p>
          <h2 className="reveal">Nobody flakes on a crew.</h2>
          <div className="mani-grid">
            <div className="mani-copy reveal">
              <p className="kicker">&ldquo;We should hang soon&rdquo; is where plans go to die.</p>
              <p>
                You know the loop. Someone asks the group chat who&apos;s free. Calendars never line up.
                The plan dissolves. Repeat monthly until everyone quietly stops asking.
              </p>
              <p>
                Regulars flips it: <strong>the plan already exists, and it repeats.</strong> Same six guys,
                same activity, same night, every week. Your name is on the roster. Nothing to organize,
                nothing to negotiate — just show up.
              </p>
              <p>
                And no, this isn&apos;t a friend-making app. It&apos;s a standing plan.{" "}
                <strong>The friends are a side effect.</strong>
              </p>
            </div>
            <div className="reveal">
              <div className="hours" aria-label="Hours required to form a friendship">
                <div className="hour-row"><span className="hour-n">50<span style={{ fontSize: ".45em" }}>h</span></span><span className="hour-t">To make a casual friend</span></div>
                <div className="hour-row"><span className="hour-n">90<span style={{ fontSize: ".45em" }}>h</span></span><span className="hour-t">To make a real one</span></div>
                <div className="hour-row"><span className="hour-n">200<span style={{ fontSize: ".45em" }}>h</span></span><span className="hour-t">To make a close one</span></div>
                <p className="hour-note">— Hall, J. (2018), University of Kansas. A weekly crew banks 2–3 hours a week on autopilot. Do the math.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============ HOW IT WORKS ============ */}
      <section className="how" id="how">
        <div className="wrap">
          <p className="sec-label reveal">The system</p>
          <h2 className="reveal">Show up. That&apos;s the whole job.</h2>
          <div className="steps">
            <div className="step reveal">
              <span className="step-n">Step 01</span>
              <span className="step-t">Tell us your nights</span>
              <span className="step-desc">A 90-second application: your neighbourhood, the nights you&apos;re free, your top two activities. That&apos;s it — no bio, no photos.</span>
            </div>
            <div className="step reveal">
              <span className="step-n">Step 02</span>
              <span className="step-t">Get placed in a crew</span>
              <span className="step-desc">We build crews of six — <strong>same area, same age band, mixed skill.</strong> You get a text within a week: your crew, your night, your spot.</span>
            </div>
            <div className="step reveal">
              <span className="step-n">Step 03</span>
              <span className="step-t">Same time, every week</span>
              <span className="step-desc">Your slot is held at a partner venue. A Regulars captain hosts the first weeks so it&apos;s never awkward — he books, he intros, he keeps score.</span>
            </div>
            <div className="step reveal">
              <span className="step-n">Step 04</span>
              <span className="step-t">The crew becomes yours</span>
              <span className="step-desc">Around week 12 we hand over the slot, the group chat, and the ritual. <strong>You&apos;re regulars now.</strong> We step out.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============ ACTIVITIES ============ */}
      <section className="acts" id="activities">
        <div className="wrap">
          <p className="sec-label reveal">Pick your poison</p>
          <h2 className="reveal">Built for doing, not talking.</h2>
          <div className="act-grid reveal">
            <article className="act">
              <div className="act-top">
                <h3 className="act-name">Bouldering</h3>
                <span className="act-tag">Tue / Thu</span>
              </div>
              <p className="act-desc">No ropes, no partner needed, no experience required. You talk between climbs — which is exactly why it works. Junction &amp; Leslieville gyms.</p>
              <div className="act-foot"><span>Beginner-first</span><span className="forming">Crews forming · 2 open</span></div>
            </article>
            <article className="act">
              <div className="act-top">
                <h3 className="act-name">5-a-side</h3>
                <span className="act-tag">Wed / Sun</span>
              </div>
              <p className="act-desc">Small-pitch football, chatty pace, all touch levels. Turf at Monarch Park and Cherry Beach; dome in winter. Shins optional, trash talk included.</p>
              <div className="act-foot"><span>All skill levels</span><span className="forming">Crews forming · 1 open</span></div>
            </article>
            <article className="act">
              <div className="act-top">
                <h3 className="act-name">Run + pint</h3>
                <span className="act-tag">Mon / Thu</span>
              </div>
              <p className="act-desc">An easy 5K — conversation pace, no watches — that ends at the same pub every week. High Park and waterfront loops. The pint is the point.</p>
              <div className="act-foot"><span>Conversation pace</span><span className="forming">Crews forming · 3 open</span></div>
            </article>
            <article className="act">
              <div className="act-top">
                <h3 className="act-name">Cards &amp; games</h3>
                <span className="act-tag">Tue / Fri</span>
              </div>
              <p className="act-desc">Poker, euchre, or whatever the table votes — a held back-room table on Ossington. For the anti-cardio crowd. Stakes low, rivalries eternal.</p>
              <div className="act-foot"><span>Zero sweat</span><span className="forming">Crews forming · 2 open</span></div>
            </article>
          </div>
        </div>
      </section>

      {/* ============ RULES ============ */}
      <section className="rules" id="rules">
        <div className="wrap">
          <p className="sec-label reveal">The rules</p>
          <h2 className="reveal">The commitment is the product.</h2>
          <p className="rules-note reveal">
            Every &ldquo;maybe&rdquo; in a group chat quietly taxes everyone else&apos;s plans. Regulars works because{" "}
            <strong>your yes means something</strong> — and so does everyone else&apos;s.
          </p>
          <div className="rule-grid reveal">
            <div className="rule">
              <p className="rule-k">Rule 01</p>
              <h3 className="rule-t">The roster is fixed</h3>
              <p className="rule-d">Same six, every week. No rotating strangers, no drop-ins. Familiarity is the feature — week four beats week one, and week ten beats them both.</p>
            </div>
            <div className="rule">
              <p className="rule-k">Rule 02</p>
              <h3 className="rule-t">RSVP locks Sunday, 8 PM</h3>
              <p className="rule-d">One tap in the crew thread. By Monday morning, everyone knows exactly who&apos;s in. <strong>No day-of &ldquo;you guys still going?&rdquo;</strong></p>
            </div>
            <div className="rule">
              <p className="rule-k">Rule 03</p>
              <h3 className="rule-t">Ghost twice, lose the seat</h3>
              <p className="rule-d">Miss twice without a word and your slot goes to the waitlist. Harsh? A little. It&apos;s also why the other five show up — <strong>five guys are expecting you.</strong></p>
            </div>
            <div className="rule">
              <p className="rule-k">Rule 04</p>
              <h3 className="rule-t">The streak belongs to the crew</h3>
              <p className="rule-d">Crews keep a shared streak — full-roster weeks, best runs, standings against other crews. Nobody wants to be the reason Crew 07 lost to Crew 12.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ GRADUATION ============ */}
      <section className="grad">
        <div className="wrap grad-inner">
          <div>
            <p className="sec-label reveal">Our exit plan</p>
            <h2 className="reveal">Built to be deleted.</h2>
            <p className="reveal">
              Most apps are engineered to keep you on them. Regulars is engineered to make itself
              unnecessary. By week 12, the crew keeps the slot, the venue knows your order,
              and the group chat runs itself. <strong>We hand over the keys and step out.</strong>
            </p>
            <p className="reveal">
              You&apos;ll never doomscroll Regulars. There&apos;s no feed. There&apos;s a time, a place,
              and five guys expecting you.
            </p>
          </div>
          <div className="reveal">
            <blockquote className="grad-quote">
              &ldquo;If our app is the most-used thing on your phone, we&apos;ve failed.
              If it&apos;s the crew chat, we&apos;ve won.&rdquo;
              <span className="sig">— Pilot 001 founding note</span>
            </blockquote>
          </div>
        </div>
      </section>

      {/* ============ PILOT + FAQ ============ */}
      <section className="pilot" id="faq">
        <div className="wrap">
          <p className="sec-label reveal">Pilot 001 · Toronto</p>
          <h2 className="reveal">The fine print, up front.</h2>
          <div className="pilot-grid">
            <div className="reveal" aria-label="Pilot details">
              <div className="fact"><span className="k">First crews</span><span className="v">Week of July 20, 2026</span></div>
              <div className="fact"><span className="k">Who</span><span className="v">Men 20–30, all skill levels</span></div>
              <div className="fact"><span className="k">Where</span><span className="v">Junction · Ossington / Trinity Bellwoods · Leslieville · Liberty Village · Annex</span></div>
              <div className="fact"><span className="k">Cost</span><span className="v">Free during pilot — you cover your own pass or pint</span></div>
              <div className="fact"><span className="k">Commitment</span><span className="v">One night a week · 12-week season</span></div>
              <div className="fact"><span className="k">Spots</span><span className="v">48 across 8 crews — then waitlist</span></div>
            </div>
            <div className="reveal">
              <details>
                <summary>Is this a dating thing? <span className="plus">+</span></summary>
                <p>No. Crews exist for the activity and the standing plan. What you do with your other six nights is your business.</p>
              </details>
              <details>
                <summary>Why men 20–30? <span className="plus">+</span></summary>
                <p>Because that&apos;s where the numbers are worst — this demographic has seen the steepest drop in close friendships over the last 30 years, and almost nothing is built for it. <strong>Pilot 001 starts there.</strong> Other crews come later.</p>
              </details>
              <details>
                <summary>What if I&apos;m bad at the activity? <span className="plus">+</span></summary>
                <p>Perfect — most of the crew will be too. Crews are built mixed-skill and beginner-first on purpose. Nobody&apos;s keeping score except at the card table.</p>
              </details>
              <details>
                <summary>What if I don&apos;t click with my crew? <span className="plus">+</span></summary>
                <p>One free transfer to another crew, no questions asked. It happens; it&apos;s fine. What we won&apos;t do is shuffle you weekly — that defeats the whole point.</p>
              </details>
              <details>
                <summary>Is there even an app? <span className="plus">+</span></summary>
                <p>During the pilot: a text thread, a calendar hold, and a captain. On purpose. We&apos;re proving the crews work before we build software around them.</p>
              </details>
              <details>
                <summary>What happens after 12 weeks? <span className="plus">+</span></summary>
                <p>The slot, the venue relationship, and the group chat are yours to keep — free, forever. Most crews just... keep going. That&apos;s the win condition.</p>
              </details>
            </div>
          </div>
        </div>
      </section>

      {/* ============ APPLY ============ */}
      <section className="apply" id="apply">
        <div className="wrap">
          <p className="sec-label reveal">Applications open</p>
          <h2 className="reveal">Claim the open spot.</h2>
          <div className="form-shell reveal">
            <div className="form-head">
              <span>Pilot 001 application</span>
              <span className="slots" aria-hidden="true">
                <span className="slot f"></span><span className="slot f"></span><span className="slot f"></span>
                <span className="slot f"></span><span className="slot f"></span><span className="slot hot"></span>
              </span>
            </div>

            {status !== "done" ? (
              <form className="form-body" ref={formRef} onSubmit={handleSubmit} noValidate>
                <p className="f-error" ref={errRef} style={{ display: error ? "block" : "none" }}>{error}</p>

                <div className="f-row">
                  <label className="f-label" htmlFor="fname">First name</label>
                  <input type="text" id="fname" name="fname" autoComplete="given-name" required />
                </div>

                <div className="f-row">
                  <label className="f-label" htmlFor="femail">Email</label>
                  <input type="email" id="femail" name="femail" autoComplete="email" required />
                </div>

                <div className="f-row">
                  <label className="f-label" htmlFor="fphone">Phone <span className="opt">(optional — crew placement comes by text)</span></label>
                  <input type="tel" id="fphone" name="fphone" autoComplete="tel" />
                </div>

                {/* Honeypot — hidden from real users */}
                <div style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }} aria-hidden="true">
                  <label htmlFor="website">Website</label>
                  <input type="text" id="website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="f-row">
                  <label className="f-label" htmlFor="fage">Age band</label>
                  <select id="fage" name="fage" defaultValue="20–23">
                    <option>20–23</option>
                    <option>24–27</option>
                    <option>28–30</option>
                    <option>Outside 20–30 (waitlist for future crews)</option>
                  </select>
                </div>

                <div className="f-row">
                  <label className="f-label" htmlFor="fhood">Neighbourhood</label>
                  <select id="fhood" name="fhood" defaultValue="The Junction / High Park">
                    <option>The Junction / High Park</option>
                    <option>Ossington / Trinity Bellwoods</option>
                    <option>Leslieville / Riverside</option>
                    <option>Liberty Village / King West</option>
                    <option>The Annex / Koreatown</option>
                    <option>Elsewhere in Toronto</option>
                  </select>
                </div>

                <div className="f-row">
                  <span className="f-label" id="nightsLabel">Nights you can hold weekly</span>
                  <div className="chips" role="group" aria-labelledby="nightsLabel">
                    <label className="chip"><input type="checkbox" name="night" value="Mon" /><span>Mon</span></label>
                    <label className="chip"><input type="checkbox" name="night" value="Tue" /><span>Tue</span></label>
                    <label className="chip"><input type="checkbox" name="night" value="Wed" /><span>Wed</span></label>
                    <label className="chip"><input type="checkbox" name="night" value="Thu" /><span>Thu</span></label>
                    <label className="chip"><input type="checkbox" name="night" value="Fri" /><span>Fri</span></label>
                    <label className="chip"><input type="checkbox" name="night" value="Sun" /><span>Sun</span></label>
                  </div>
                </div>

                <div className="f-row">
                  <span className="f-label" id="actsLabel">Top activities — pick up to two</span>
                  <div className="chips" role="group" aria-labelledby="actsLabel">
                    <label className="chip"><input type="checkbox" name="act" value="Bouldering" /><span>Bouldering</span></label>
                    <label className="chip"><input type="checkbox" name="act" value="5-a-side" /><span>5-a-side</span></label>
                    <label className="chip"><input type="checkbox" name="act" value="Run + pint" /><span>Run + pint</span></label>
                    <label className="chip"><input type="checkbox" name="act" value="Cards" /><span>Cards &amp; games</span></label>
                  </div>
                  <p className="f-hint">We place on activity first, night second.</p>
                </div>

                <button className="f-submit" type="submit" disabled={status === "sending"}>
                  {status === "sending" ? "Sending…" : "Submit — take the open slot"}
                </button>
                <p className="f-fine">Applications reviewed in order. Placement by text within 48 hours. No spam, no feed, ever.</p>
              </form>
            ) : (
              <div className="success" style={{ display: "block" }} role="status">
                <p className="big">{duplicate ? "Already on the list." : "You're in the queue."}</p>
                <p>
                  {duplicate
                    ? "We've got your application on file — placement texts go out in order. Sit tight."
                    : "Application received. We'll text you within 48 hours with your crew number, your night, and your first session. Until then — keep the calendar loose."}
                </p>
                <span className="slots">
                  <span className="slot f"></span><span className="slot f"></span><span className="slot f"></span>
                  <span className="slot f"></span><span className="slot f"></span><span className="slot f"></span>
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer>
        <div className="wrap foot-in">
          <div className="foot-mark">Regulars<span style={{ color: "var(--hivis)" }}>.</span></div>
          <div className="foot-meta">
            A Toronto experiment in showing up<br />
            Pilot 001 · Summer 2026<br />
            <a href="mailto:crews@regulars.club">crews@regulars.club</a>
          </div>
        </div>
      </footer>
    </>
  );
}
