# OMWGod Ideas Backlog

This file stores side ideas that should be discussed after the general user flow is complete. Items here are not automatically approved for development.

## User Location and Cultural Context

### Idea
Ask where the user is from early enough to adapt the experience and support future local services.

### Potential Uses
- Show funeral traditions and venue examples that are relevant to the user's region.
- Use suitable language, currency, date formats, and budget ranges.
- Explain local practical constraints and regulations when the product later adds serious planning features.
- Recommend funeral services available in the user's area if the product introduces that feature.
- Support culturally relevant religious and non-religious ceremony options.

### UX Recommendation
Do not lead the experience with a formal country form. Consider asking after the first playful interaction or during account saving:

`Where in the world are we planning this masterpiece?`

Allow:
- Country or region
- City as optional
- `Rather not say`
- Manual correction of all recommendations

### Guardrails
- Do not infer personal preferences from nationality or ethnicity.
- Location should influence available examples, local rules, language, prices, and service availability, not decide the user's taste.
- Ask permission before using precise location.
- Do not collect GPS location when country or city is enough.
- Do not sell sensitive location or funeral-preference data.
- Any future provider recommendation must be clearly labelled and must disclose paid placement or commission.
- The product must not promise that a recommended provider will be available decades later.

## Avatar DEI and Inclusion

### Status
The current Avatar creator is a flow prototype, not the final inclusive character system.

### Requirements for the Full Version
- Broad and continuous skin-tone choices rather than four fixed tones.
- Hair textures and protective hairstyles across different cultures.
- No forced male/female category.
- Multiple body shapes and gender expressions.
- Optional glasses, hearing aids, wheelchairs, mobility aids, scars, facial hair, head coverings, and religious or cultural clothing.
- Avoid value-loaded names for skin tone, body shape, facial features, and hairstyles.
- Make every category optional.
- Keep the default setup fast while offering an expanded customization mode.

### Possible Interaction Model
- `Quick me`: finish in about 20 seconds.
- `Make it accurate`: open advanced controls.
- Use an inclusive colour spectrum or a larger, carefully designed tone palette for skin colour.
- Use sliders only where continuous adjustment improves expression, such as eye size or face proportions.
- Do not turn the first step into a complicated character editor that blocks the main experience.

## Review Timing

Review these ideas after the complete prototype flow exists:

Landing → Avatar → Venue → remaining customization → live preview → result → share → account → trusted people.
