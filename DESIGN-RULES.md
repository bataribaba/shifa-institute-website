# Shifa design rules: avoid the "vibe coded" look

Mr. Faraaz added these rules on 2026-11-18. They come from the Aftermark AI "Vibe Coded Websites Report", which he pasted into the chat. They apply to the website, the learning platform and anything else Shifa builds.

## Things to remove (red flags)
- Purple gradients, neon glows, purple accents the brand does not use
- Sparkle icons, and emojis used as UI, in headings, on buttons or as bullets
- Hover effects on every card: lifting, rotating, bouncing, glows that look like a flashlight
- Fake or generic testimonials
- Social icons that link to "#", a site's home page, or a 404
- Huge icons over tiny text
- Generic fonts used without rhythm: heavy headings, thin body text, uneven line heights
- Semi-transparent blurred headers that clash with content scrolling under them
- Lottie animations, wiggles, overshoot, pop-in with no easing, scroll animations that stutter
- No loading states, buttons that freeze, blank gaps while content loads
- Components that move between pages, with changing button sizes, padding and container widths
- Grids that don't line up, uneven spacing, sticky elements that drift
- Too many different corner radii
- Copyright lines that are slightly wrong, meaningless taglines, crowded hero sections
- No OG image, a title of "Home", no meta description, no favicon
- Layouts that break on mobile, placeholder text left in, controls that don't work

## Fixes
1. Use a 4 or 8 point spacing scale everywhere, and never improvise a value.
2. Pick one heading font and one body font, with a fixed type ramp and fixed line heights.
3. Use a small palette, keep it high contrast, and only add an accent when it serves the hierarchy.
4. Pick one corner radius scale, one shadow or elevation style and one padding logic, and share them across every component.
5. Remove most animation. Keep hover effects subtle and never let them move the layout.
6. Fix mobile first, then polish desktop.
7. Give anything with a delay a loading state, and use skeletons for content that loads data.
8. Make the copy specific to what Shifa does, with one clear promise and no filler.
9. Test every button, link, tab, accordion and social icon.
10. Cut visual novelty and add clarity. Consistency is what makes a site look premium.

Before showing any page, check it against this list and fix what fails. If five or more items on the list apply, the page reads as vibe coded.
