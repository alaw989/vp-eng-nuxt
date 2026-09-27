# Evidence ledger

Every factual claim the site makes about VP & Associates, where it comes from, and
where it appears. A claim without a source here doesn't ship.
`tests/content-claims.spec.ts` fails the build if a removed claim comes back.

Last reviewed: 2026-09-27.

## Claims on the site

| Claim | Source | Confidence | Appears in |
|---|---|---|---|
| VP & Associates, Inc., Tampa, FL | Sunbiz filing P07000056163 (Florida profit corporation, filed 2007-05-09, Vuong Phan, President); public listings give 202 S 22nd St #209, Tampa, FL 33605 | High | Everywhere |
| Steel detailing since 2007 | CMS steel-detailing service text ("since 2007"); matches incorporation date | High | `pages/index.vue` stats, `pages/about.vue` banner, JSON-LD `foundingDate` |
| "Over 30 years of (combined) experience" | The firm's own copy on its pre-rebuild site; LinkedIn company page says "over 30 years of collective experience". This is staff experience, not firm age | Medium | Hero, home intro, about, footer, meta descriptions |
| PE registrations in FL, KY, MD, MI, PA, TN, VA | The firm's pre-rebuild WordPress site ("licensed in the states of Florida, Kentucky, Maryland, Michigan, Pennsylvania, Tennessee, and Virginia"). Its 2010 site (Wayback) lists FL PE #62111, KY #23945, MI #6201051076, TN #109693 | Medium: self-reported, current status not checked | `pages/about.vue` |
| Licensed Florida PE; signed and sealed drawings and calculations | 2010 site (FL PE #62111); pre-rebuild site describes sending "signed and sealed calculations" to fabricators | Medium | `pages/index.vue` card, hero `capability` variant |
| SDS2 detailing, ACAD, 3-D analysis; clients are industrial contractors, commercial architects, steel fabricators | The firm's own pre-rebuild site copy | High | About, careers, home intro |
| Testimonials | CMS testimonials, each with `testimonial_source` (Google Maps, Yellow Pages, Birdeye), shown on the card | High | Homepage slider |

## Removed claims ([NEEDS INPUT] from the client)

Each item was live without a source, or was contradicted by public records.
To restore one, get the evidence, add a row above, and narrow the pattern in
`tests/content-claims.spec.ts`.

| Removed claim | Why | Question for the client |
|---|---|---|
| "Trusted by Tampa Bay Since 1990", "30+ Years in Business" | Firm incorporated 2007; LinkedIn says founded 2006 | Did a predecessor firm exist before 2007? If so, under what name? |
| "500+ Projects Completed" | No source | Is there a project count you can stand behind? |
| "100% Client Satisfaction" | Contradicted: 15 public reviews average 3.9, with four 1-star | None. Don't restore |
| "10+ Team Members" | LinkedIn lists 2–10; the CMS team has 1 person | Current headcount? Should more team members be added to the CMS? |
| "100% Employee Owned", "100% Code Compliant" | No source | Is either true and documentable? |
| "Licensed & Insured … comprehensive coverage" | No source for insurance | Do you carry professional liability insurance you want to mention? |
| Footer "FL License #PEC-0001234" | Placeholder number presented as a real license | Firm Certificate of Authorization (CA) number, and PE number(s) to display. Candidate: FL PE #62111 (from the 2010 site); verify at https://www.myfloridalicense.com before publishing |
| AISC Certification, ISO 9001:2015, OSHA Certified, NCSEA, FES | No record anywhere. AISC and ACI certify fabricators and technicians, not design firms | Which memberships are current? The 2010 site listed ASCE, ACI, AISC membership |
| Client logos: Tampa General, Raymond James, Port Tampa Bay, Hillsborough County, City of Tampa, USF, Moffitt, TECO | No evidence any is a client | Which clients can be named publicly, with permission? |
| Four job openings with salaries, a benefits list (401(k) match, dental, life insurance), a six-step hiring process | Invented. The CMS has no positions endpoint | Are you hiring? Which benefits are real? |
| Six fallback testimonials (Michael Chen, Sarah Rodriguez, …) | Invented people | None. Don't restore |
| Facebook link to facebook.com | No company Facebook page found | Is there one? |

## CMS content to fix (WordPress, not code)

These live in https://cms.vp-associates.com/wp-admin and can't be fixed from the repo:

- **Structural Steel Design**: `service_standard` "AISC Certified", excerpt "AISC certified steel design…", body "Our team is AISC certified…". Suggest "AISC 360" and "designed to the AISC Specification".
- **Concrete Design**: `service_standard` "ACI Certified", excerpt "ACI certified concrete design…", body "We are ACI certified…". Suggest "ACI 318".
- **Seawall Design**: `service_standard` "Coastal Certified". Suggest "Coastal".
- **Steel Connection Design**: "over 7,000 tons of steel … structures reaching over 300 feet". Needs a source from the client.
- **Team, Vuong Phan**: bio is "Vuong is the man" and phone is `234234233`. Needs a real bio and number. The site now hides the call link for invalid numbers.

## Open questions

- **Phone number.** Public listings and the pre-rebuild site show (813) 247-3835; the new site uses (813) 486-2079 (commit a698412). Confirm which is current.
