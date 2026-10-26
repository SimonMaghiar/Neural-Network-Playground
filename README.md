# Neural Network Playground

An interactive course that takes complete beginners from a single neuron to the hardware and language models behind modern AI.

**Courses** (a numbered, step-by-step path):

1. **Why AI Runs on GPUs**: nine hands-on modules covering parallelism, matrix multiplication, the memory wall, the memory hierarchy, threads and warps, tiling, number precision and GPU sizing.
2. **How LLMs Work**: nine hands-on modules covering next-word prediction, tokenization, embeddings, attention, the transformer, sampling, the training stages, the KV cache and quantization.
3. **Running LLMs at Scale** (coming soon)
4. **What LLMs Are Used For** (coming soon)

**Lab** (hands-on workshops, outside the numbered path):

- **Neural Network Foundations**: guided lessons and a free playground where you watch neurons, weights and biases change as a network trains.

Each module has a plain-language introduction, an interactive simulation with a task, key takeaways, a short quiz and an optional technical deep dive.

> **Proprietary software. All rights reserved.** This code may not be copied, reused, modified or redistributed. See [License](#license).

## Features

- **Guided lessons.** Eight short lessons in plain language, each with a hands-on task. They cover what a neuron is, measuring mistakes, learning by small nudges, the step size (learning rate), why the bias matters, yes/no answers, and hidden layers.
- **Free playground.** Six example models: doubling a number (the model from `predit.js`), Celsius to Fahrenheit, AND, XOR, absolute value and a sine wave. You can add or remove hidden layers, change how many neurons they have, and pick each layer's activation function.
- **Live network diagram.** Line colour and thickness show each weight. Neuron colour shows its current output. After a single learning step, every weight and bias shows how much it changed.
- **Forward-pass animation.** Watch an answer flow through the network one layer at a time.
- **Inspector.** Click any neuron or connection to see its calculation with real numbers, which way the next learning step will nudge it, a slider to change it by hand, and a chart of how it changed during training.
- **Charts.** The mistake score (loss) over time, the learned curve against the training data, and a decision map with a truth table for the yes/no models.
- **Glossary.** Hover over any underlined term for a plain-language definition.

## Getting started

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Then open the URL Vite prints, usually <http://localhost:5173>.

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the development server              |
| `npm run build`   | Type-check, build and pre-render every page |
| `npm run preview` | Serve the production build locally        |
| `npm run lint`    | Run ESLint                                |

`predit.js` is the original standalone single-neuron script. You can run it with `node predit.js`.

## SEO and deployment

Every page has a real URL (`/gpu/tiling/`) and is pre-rendered at build time into its own HTML file, with the full lesson text, a unique title and description, a canonical URL, link-preview tags and schema.org structured data (Course, LearningResource, BreadcrumbList). The browser then takes over the same HTML (hydration), so after the first page, navigation happens without reloads.

- **Set the domain.** Put the public address in `.env` as `VITE_SITE_URL` (no trailing slash). The canonical URLs and `sitemap.xml` use it, and the build warns while it still points to the placeholder.
- **Build output.** `npm run build` writes `dist/` with one `index.html` per page, `404.html`, `sitemap.xml` and `robots.txt`. Deploy it to any static host (Netlify, Cloudflare Pages, Vercel, GitHub Pages, nginx). Do not configure a catch-all rewrite to `/index.html`: unknown URLs should get `404.html` with a real 404 status.
- **Old links.** Hash URLs such as `#/gpu/tiling` are redirected to `/gpu/tiling/` in the browser.
- **Browser-only state.** Saved progress is read with `useProgress()` (or after `useHydrated()` returns true), so the first render in the browser matches the pre-rendered HTML. New code that reads `localStorage` or `window` while rendering must do the same.
- **After launch.** Add the site to Google Search Console and submit `https://<your-domain>/sitemap.xml`.

### SEO to-do

What you need to do:

- [ ] **Set your domain** in `.env`: `VITE_SITE_URL=https://your-domain.com`. It's a placeholder now, so the canonical URLs and sitemap would point to the wrong address. The build prints a warning until you change it.
- [ ] **Set your contact email** in `.env`: `VITE_CONTACT_EMAIL=you@your-domain.com`. The Contact, Privacy and Terms pages show it, and the build warns while it is a placeholder.
- [ ] **Have the Privacy Policy and Terms of Use reviewed** (`src/pages/info/Privacy.tsx`, `Terms.tsx`). They describe the site as it is today: no accounts, cookies or analytics. Update them before adding accounts, analytics or payments.
- [ ] **Deploy `dist/` to a static host** (Netlify, Cloudflare Pages, Vercel or similar). Don't add a rule that sends every URL to `index.html`; unknown pages must get `404.html`.
- [ ] **After launch,** add the site to Google Search Console and submit the sitemap.

Still worth doing for ranking:

- [ ] **Link-preview image:** there isn't one yet.
- [ ] **Mobile check:** test the three-column module layout on a phone, since Google ranks by the mobile version.
- [ ] **Lab download size:** the lab is a large download (about 590 KB), which slows that page.
- [ ] **Content and backlinks:** what matters most from here is strong, search-focused content and links to the site from other websites.

## Project structure

```
src/
  nn/
    network.ts      Neural network engine: forward pass, backpropagation, gradient descent
    presets.ts      Example models and training data (free playground and lessons)
  lessons.tsx       Lesson content, tasks and which controls each step shows
  ui/
    Playground.tsx  Main workspace: toolbar, diagram, inputs, charts, inspector
    NetworkView.tsx Network diagram (React Flow)
    Inspector.tsx   Side panel explaining the selected neuron or connection
    LessonPanel.tsx Lesson sidebar with steps, tasks and navigation
    NeuronRecipe.tsx Single-neuron calculation card with hand-tuning sliders
    Charts.tsx      Loss chart, fit chart, decision map and truth table
    useTrainer.ts   Training loop and parameter history
    glossary.ts     Plain-language definitions used by hover tooltips
    TrackLayout.tsx Shared module page: intro, simulation, takeaways, quiz, deep dive
    Quiz.tsx        Multiple-choice check with explanations
    SiteHeader.tsx  Global header: logo, main menu and search
    SiteSearch.tsx  Search box with keyboard navigation ("/" to focus)
    SiteFooter.tsx  Global footer (full, or compact for narrow columns)
  pages/
    Home.tsx        Landing page with the learning path and track cards
    TrackOverview.tsx Course landing page (/gpu/): description and all modules
    NotFound.tsx    404 page
    InfoPageView.tsx Shared layout of the site pages below
    info/           About, Glossary, Contact, Privacy, Terms (list and SEO text in index.ts)
  tracks/
    catalog.ts      The courses (numbered by position) and the labs
    types.ts        Shared types: TrackMeta, ModuleContent, SimProps, …
    TrackPage.tsx   Generic page for any standard track (loads its content on demand)
    gpu/            Track 1
    llm/            Track 2
    serving/        Track 3 (outline only)
    apps/           Track 4 (outline only)
    foundations/    Lab: lessons and free playground (custom page)
  site.ts           Site name, domain, contact email and owner
  site.css          Global header, search box, footer and site pages
  search.ts         Search index (courses, modules, lab lessons, glossary, site pages) and ranking
  router.ts         URL routing (/gpu/tiling/) and in-site link handling
  routes.ts         Which page each URL shows, and the list of all pages
  seo.ts            Titles, descriptions, canonical URLs and structured data per page
  entry-server.tsx  Renders a page to HTML at build time (used by scripts/prerender.mjs)
  App.tsx           Routes to the home page, a course or lab, or the 404 page
scripts/
  prerender.mjs     Writes one HTML file per page, sitemap.xml and robots.txt
```

Every track lives in its own folder:

```
tracks/<track>/
  meta.ts         Title, colour, level and module list (small; used by the home page)
  content.tsx     Text, task, takeaways, quiz and deep dive for each module (loaded on first visit)
  sims/           One interactive simulation component per module
```

To add a track: create the folder with a `meta.ts` (set `loadContent: () => import('./content').then((m) => m.content)`), write `content.tsx` and the simulations, and add the track to `courses` or `labs` in `catalog.ts`. Course numbers follow the order of that list. Leaving out `loadContent` shows the track as "Coming soon".

## Built with

React, TypeScript, Vite, [React Flow](https://reactflow.dev/) (`@xyflow/react`), [Recharts](https://recharts.org/) and [Lucide](https://lucide.dev/) icons. These third-party libraries remain under their own licenses.

## License

Copyright � 2026 smbondrnet. All rights reserved.

This is proprietary software. No permission is granted to use, copy, modify, merge, publish, distribute, sublicense or sell any part of this code, or to create derivative works from it, without prior written permission from the copyright holder. See [LICENSE](LICENSE) for the full terms.
