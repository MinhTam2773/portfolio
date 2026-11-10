# Liquid glass behind text on the sky

Approved 2026-11-09 from the brainstorm mockups (option E).

## Problem

White text on the brightest part of the dusk sky (behind Education to Experience, and on the
project pages) is around 2:1. Flat navy panels fixed the contrast but looked templated, and a
darker sky dulled the art.

## Design

- One shared style, `.sky-panel` in `app/globals.css`: nearly clear glass with a faint
  white-to-violet tint, a bright rim on the top-left edge, a soft drop shadow, and the sky
  behind it blurred a little, darkened and more saturated.
- Used on the home page for the two award cards, one pane around the project list and the
  bullets under each job; on project pages for The Challenge, The Solution, case-study cards,
  the sidebar and Keep Exploring cards. Headings stay on the sky.
- Inside the glass only, body text and small labels use the sans (Geist, medium). Headings and
  everything outside the glass keep the serif.
- The project list loses its hover wash (a light band across the row); the title still slides.

## Constraints

- Body text inside the glass reaches 4.5:1 at its brightest spot, measured on rendered pixels.
  The glass's darkening is tuned until it does.
- The blur stays small. Phones (under 768 px wide) get a slightly stronger tint and no blur.
  Desktop frame rate is compared with and without the blur, and the numbers are reported.
