# THE PROMPTOR™ AI Song Blueprint upgrade

## Goal
Turn The Promptor from a long prompt form into a premium, clearly differentiated production workspace built around one signature promise: **Build production-ready AI song blueprints.**

## Locked creative direction
- Brand lockup: **THE PROMPTOR™** with **by Blacure** as the endorsement.
- Visual system: **Carbon Copper** — near-black and graphite surfaces, copper controls, warm ivory text, restrained highlights.
- Typography: **Archivo Black** for brand and major headings; **Hind** for product text and controls.
- Product composition: **Sleek Studio Dark** interpreted as a studio console: modular control sections on the left, live blueprint output on the right, tactile states, minimal glow.
- Motion: subtle meter sweeps, active-section illumination, and short panel transitions with reduced-motion support.

## 1. Premium brand system
- Replace the current gold-gradient treatment with semantic Carbon Copper tokens for surfaces, text, borders, controls, focus, status, and shadows.
- Load the selected fonts correctly and apply a consistent wordmark, navigation, button, field, badge, panel, and status language across every screen.
- Preserve the existing Blacure logo, but make **THE PROMPTOR™** the strongest first-viewport signal.
- Standardize product naming: **AI Song Blueprint Studio**, **Generate Blueprint**, **Standard Blueprint**, and **Pro Studio Blueprint**.

## 2. Homepage rewrite for commercial impact
- Rebuild the opening around **THE PROMPTOR™ by Blacure**, “Build production-ready AI song blueprints,” the 10-free offer, and one primary action: **Build Your First Blueprint**.
- Show the full production chain visually: Genre → Subgenre → Era → Mood → BPM → Key → Rhythm → Bass → Instruments → Vocals → Harmony → Arrangement → Mix → Dynamics → Stereo → References → Optimization.
- Upgrade the current before/after example into product proof that exposes the decisions inside the finished blueprint.
- Explain why this is not a blank chatbot through structured producer controls, compatible decisions, repeatable output, and dedicated engine optimization.
- Clarify Standard versus Pro Studio and the existing $0 / $5 / $19.99 offers without changing payment rules.
- Retain the comment form and existing working destinations.

## 3. Full AI Song Blueprint workflow
- Replace the twelve-section accordion with five scannable console phases:
  1. **Foundation** — title, format, genre, subgenre, era, mood, BPM, key.
  2. **Rhythm & Sound** — drum character, rhythm pattern, bass character, instrumentation.
  3. **Voice & Harmony** — vocal type, performance, register/texture direction, extras, harmony character.
  4. **Arrangement** — song length, hook, vocal format, structure, arrangement, dynamics arc.
  5. **Mix & Delivery** — production style, mix character, sonic finish, stereo character, reference traits, avoid rules, AI-engine optimization.
- Add the missing blueprint fields and curated options: era, vocal register/texture, harmony, dynamics, stereo image, reference traits, and optimization mode.
- Keep Standard choices available to guests and credit users; clearly mark advanced Pro Studio controls and enforce the same access rules during generation.
- Add phase completion, a concise selection summary, reset/randomize controls, and a persistent **Generate Blueprint** action.
- Rework the output into a live blueprint inspector with technical metadata, structured sections, copy/save feedback, saved blueprints, and streaming state.
- Preserve the current 10-free limit, credit deductions, subscription checks, streaming, retries, saving, and upgrade behavior.

## 4. Generation quality and safety
- Extend client and server validation for every new field, with bounded curated values rather than unrestricted text where possible.
- Feed all blueprint decisions into both guest and signed-in generation paths, including the streaming path.
- Update Standard output to remain concise and usable; update Pro Studio output to include the expanded production, dynamics, stereo, and optimization guidance.
- Keep artist imitation and copyrighted lyric restrictions, instrument matching, credit refunds, and subscriber rate limits intact.

## 5. Screen-by-screen commercial upgrade
- **Blueprint Studio:** signature console workflow, clearer free/credit status, fewer competing top actions, stronger Standard/Pro distinction.
- **Lyrics:** adopt the same console shell and visual language while keeping its existing lyric-specific controls and behavior.
- **Pricing:** compare blueprint depth and Pro Studio value, correct conflicting purchase copy, and distinguish credit top-ups from downloadable prompt packs.
- **Sign in:** reduce generic card styling and reinforce the value users return to after authentication.
- **Account:** present membership, credits, downloads, and activity as one compact studio account view.
- **Checkout return:** align success, pending, and failure states with the premium system and provide the clearest next action.
- **Shared navigation:** make product destinations, account state, and current plan readable without crowding mobile screens.

## 6. Validation
- Verify every new control changes visibly, survives randomize/reset behavior, and reaches the generated blueprint.
- Test guest, signed-in credit, and Pro Studio paths without changing billing or entitlement rules.
- Check desktop and mobile layouts for sticky-panel behavior, readable controls, button wrapping, and no overflow or overlap.
- Verify copy, save, generated output, pricing links, authentication links, checkout return, and all route metadata.
- Confirm the preview builds without errors and key screens have no runtime or console errors.

## Technical notes
- Extend the existing prompt option model, builder, generation validators, and both prompt-generation endpoints rather than introducing a second workflow.
- Keep colors and visual effects in semantic global tokens; keep controls on the existing design-system components.
- Break the large builder and route into focused phase, console-header, blueprint-summary, and output components while preserving current business logic.
- No new database tables, payment products, audio generation, Suno/Udio API connection, Prompt DNA scoring, project library, or version-history system are included in this milestone.
