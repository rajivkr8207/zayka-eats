
# Food Delivery Platform — UI Theme & Design System

## 1. Design Direction

**Primary direction:** Minimalism + Bento Grid + Restrained Liquid Glass.

The interface should feel premium, appetizing, fast, and trustworthy.
Food photography should be the most expressive element. UI decoration
must never compete with food images, prices, or ordering actions.

### Style Blend

- **60% Minimalism:** Clear hierarchy, readable text, uncluttered screens.
- **25% Bento Grid:** Modular discovery sections, categories, promotions,
  recommendations, and featured restaurants.
- **10% Liquid Glass / Glassmorphism:** Floating navigation, overlays,
  sheets, map controls, and temporary surfaces.
- **5% Maximalism:** Campaign banners, seasonal promotions, and special
  brand moments only.

### Styles to Avoid as Primary UI

- **Skeuomorphism:** Avoid realistic textures, metallic knobs,
  and physical-object controls.
- **Neumorphism:** Avoid low-contrast soft-shadow controls,
  especially for critical actions.
- **Claymorphism:** Reserve playful 3D illustrations for empty states
  or onboarding.
- **Brutalism:** Reserve for limited campaigns and brand experiments.
- **Spatial UI:** Do not make the ordering flow dependent on 3D space,
  depth gestures, or immersive navigation.

---

## 2. Product Design Principles

1. Food imagery is the hero.
2. Ordering must be frictionless.
3. Accessibility comes before visual effects.
4. Dark mode is the default, but Light Mode must be designed properly.
5. Theme selection is user-controlled and persists across sessions.
6. Motion is subtle, purposeful, and respects reduced-motion settings.
7. Use glass and blur effects sparingly.
8. Maintain responsive layouts across mobile, tablet, and desktop.
9. Keep restaurant, dish, price, rating, and delivery information easy to scan.
10. Prioritize usability, performance, and conversion over decorative design.

---

## 3. Theme Modes

Provide three theme preferences:

- **Dark** — Default for first-time users.
- **Light** — User-selected bright theme.
- **System** — Follows operating system preference.

### Default Behavior

- Default theme: `dark`
- Theme selector: Settings / Profile
- Persist user-selected theme.
- Apply theme without page reload.
- Avoid flashing the wrong theme during initial loading.
- Test every component in both themes.
- Never force dark mode after the user has selected light mode.

### Theme Switching

Theme switching should update all semantic tokens globally:

- Backgrounds
- Cards
- Text
- Borders
- Icons
- Shadows
- Inputs
- Modals
- Navigation
- Status indicators

---

## 4. Color Palette

The primary brand color is orange.

Orange should represent actions, emphasis, selected states,
and important highlights. Do not use orange everywhere.

### 4.1 Dark Theme — Default

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#121212` | Main application background |
| `surface` | `#1B1B1B` | Cards and main panels |
| `surface-elevated` | `#242424` | Raised cards and dialogs |
| `surface-overlay` | `#2B2B2B` | Popovers and overlays |
| `text-primary` | `#F5F5F5` | Main text and headings |
| `text-secondary` | `#A3A3A3` | Supporting text |
| `text-muted` | `#777777` | Metadata |
| `border` | `#303030` | Dividers and outlines |
| `border-strong` | `#454545` | Active borders |
| `brand` | `#FF8A26` | Primary actions |
| `brand-hover` | `#FFA34D` | Hover state |
| `brand-pressed` | `#E87412` | Pressed state |
| `brand-soft` | `#3A2618` | Soft brand backgrounds |
| `success` | `#36C98F` | Success states |
| `warning` | `#FFC15A` | Warnings |
| `error` | `#FF5B5B` | Errors |
| `info` | `#62B5FF` | Information |
| `rating` | `#FFC857` | Rating stars |
| `price` | `#F5F5F5` | Food prices |
| `scrim` | `rgba(0,0,0,0.64)` | Modal backdrop |

### 4.2 Light Theme

| Token | Hex | Usage |
|---|---|---|
| `bg` | `#F7F7F4` | Main background |
| `surface` | `#FFFFFF` | Cards and panels |
| `surface-elevated` | `#FFFFFF` | Elevated cards |
| `surface-overlay` | `#F0F0ED` | Popovers and overlays |
| `text-primary` | `#1C1C1C` | Main text |
| `text-secondary` | `#737373` | Supporting text |
| `text-muted` | `#888888` | Metadata |
| `border` | `#E5E5E0` | Dividers and outlines |
| `border-strong` | `#D1D1CB` | Active borders |
| `brand` | `#F47B20` | Primary actions |
| `brand-hover` | `#DB6B16` | Hover state |
| `brand-pressed` | `#C65C0C` | Pressed state |
| `brand-soft` | `#FFF0E2` | Soft brand backgrounds |
| `success` | `#16845D` | Success states |
| `warning` | `#9A6400` | Warnings |
| `error` | `#C83232` | Errors |
| `info` | `#176CB5` | Information |
| `rating` | `#A56C00` | Rating stars |
| `price` | `#1C1C1C` | Food prices |
| `scrim` | `rgba(0,0,0,0.40)` | Modal backdrop |

### 4.3 Color Usage Rules

- Orange is for actions and emphasis.
- Do not use orange for every icon or heading.
- Primary buttons use orange with a readable dark label.
- Status colors must be paired with text or icons.
- Rating stars use the rating color.
- Prices use strong text color and typography.
- Avoid low-contrast gray text.
- Validate contrast against WCAG 2.2 AA.
- Normal text contrast target: at least 4.5:1.
- Large text contrast target: at least 3:1.

---

## 5. Typography

### Font Family

Recommended primary font:

- **Inter**

Alternatives:

- Geist
- Manrope
- System Sans-serif

### Font Weights

| Weight | Value | Usage |
|---|---:|---|
| Regular | 400 | Body text |
| Medium | 500 | Labels and navigation |
| Semibold | 600 | Card titles |
| Bold | 700 | Headings |

### Typography Scale

| Token | Size | Line Height | Usage |
|---|---:|---:|---|
| `text-xs` | 12px | 16px | Fine metadata |
| `text-sm` | 14px | 20px | Supporting labels |
| `text-base` | 16px | 24px | Body and forms |
| `text-md` | 18px | 26px | Emphasized body |
| `text-lg` | 20px | 28px | Card titles |
| `text-xl` | 24px | 32px | Section headings |
| `text-2xl` | 30px | 38px | Page headings |
| `text-3xl` | 36px | 44px | Marketing headings |

### Typography Rules

- Use tabular numerals for prices, totals, times, and order numbers.
- Avoid long blocks of uppercase text.
- Maintain readable line height.
- Use bold text sparingly.
- Avoid using too many font sizes on one screen.

---

## 6. Spacing System

Use a 4px base spacing system.

| Token | Value |
|---|---:|
| `space-1` | 4px |
| `space-2` | 8px |
| `space-3` | 12px |
| `space-4` | 16px |
| `space-5` | 20px |
| `space-6` | 24px |
| `space-8` | 32px |
| `space-10` | 40px |
| `space-12` | 48px |
| `space-16` | 64px |

### Layout Padding

- Mobile: 16px
- Spacious mobile: 20px
- Tablet: 24px
- Desktop: 32px
- Maximum content width: 1200px–1440px

Maintain consistent gaps between sections and components.

---

## 7. Border Radius

| Token | Value | Usage |
|---|---:|---|
| `radius-sm` | 8px | Chips and compact controls |
| `radius-md` | 12px | Inputs and small cards |
| `radius-lg` | 16px | Standard cards |
| `radius-xl` | 20px | Featured cards |
| `radius-2xl` | 24px | Promotional panels |
| `radius-pill` | 999px | Tags and pills |

Avoid excessive rounding.

Use consistent radius values for each component family.

---

## 8. Shadows and Elevation

### Dark Mode Shadows

```css
--shadow-card: 0 6px 24px rgba(0, 0, 0, 0.24);
--shadow-popover: 0 10px 30px rgba(0, 0, 0, 0.30);
--shadow-modal: 0 16px 48px rgba(0, 0, 0, 0.40);
```

### Light Mode Shadows

```css
--shadow-card: 0 4px 16px rgba(20, 20, 20, 0.06);
--shadow-popover: 0 8px 24px rgba(20, 20, 20, 0.08);
--shadow-modal: 0 16px 40px rgba(20, 20, 20, 0.12);
```

### Elevation Levels

- `elevation-0`: Flat background.
- `elevation-1`: Card separation.
- `elevation-2`: Dropdowns and popovers.
- `elevation-3`: Modals and dialogs.

Dark theme cards should rely more on surfaces and borders
than on heavy shadows.

Avoid excessive glow effects.

---

## 9. UI Component Guidelines

### 9.1 Buttons

#### Primary Button

- Orange background.
- Dark readable text.
- Semibold font.
- Radius: 12px–16px.
- Minimum height: 44px.
- Recommended mobile height: 48px.
- Used for main actions.

Examples:

- Add to Cart
- Checkout
- Place Order
- Confirm Address

#### Secondary Button

- Surface background.
- Visible border.
- Primary text color.

#### Ghost Button

- Transparent background.
- No permanent border.
- Surface fill on hover.

#### Destructive Button

- Error color.
- Clearly labeled.
- Used for remove, cancel, or destructive actions.

Disabled states must be distinguishable and must not rely
only on opacity.

---

### 9.2 Search Bar

- Surface background.
- Visible border.
- Search icon.
- Secondary-colored placeholder.
- Primary-colored focus border.
- Visible keyboard focus.
- Rounded corners: 12px–16px.

Search must remain easy to locate on the homepage.

---

### 9.3 Food Cards

- Food image first.
- Image aspect ratio: 4:3 or 16:10.
- Consistent cropping.
- Surface background.
- Border: 1px subtle.
- Radius: 16px–20px.
- Food name.
- Price.
- Optional rating.
- Favorite action.
- Add-to-cart action where appropriate.

Avoid placing text over busy food images unless a gradient
or scrim ensures readability.

---

### 9.4 Restaurant Cards

Display:

- Restaurant image.
- Restaurant name.
- Cuisine type.
- Rating.
- Delivery estimate.
- Offer, if available.
- Distance, if available.

Keep metadata compact and readable.

Do not display fabricated ratings, fees, delivery times,
or distances.

---

### 9.5 Category Chips

- Neutral surface.
- Subtle border.
- Comfortable touch target.
- Selected state uses brand-soft background.
- Selected text uses brand color.
- Horizontal scrolling on mobile.

---

### 9.6 Bottom Navigation

Recommended navigation:

- Home
- Explore
- Orders
- Favorites
- Profile

Rules:

- Icon with text label.
- Active item uses brand accent.
- Inactive items use secondary text.
- Minimum touch target: 44px.
- Safe-area aware.
- Liquid Glass may be used on the container.
- Always provide a readable solid fallback.

---

### 9.7 Cart

- Clear item list.
- Quantity controls.
- Item subtotal.
- Delivery fee.
- Taxes.
- Discount.
- Total.
- Checkout CTA.

The checkout button must remain easy to locate.

Use a sticky cart summary when helpful, without covering
important content.

---

### 9.8 Checkout

- Minimal distractions.
- Clear address.
- Delivery instructions.
- Payment method.
- Item summary.
- Bill details.
- Final total.
- Primary Place Order button.

Avoid glass effects on important checkout content.

---

### 9.9 Modals and Bottom Sheets

Use glass effects selectively.

Recommended:

- Translucent background.
- Subtle backdrop blur.
- Thin border.
- Dark/light scrim.
- Solid readable modal content.
- Clear close action.

Glass effects should never reduce text contrast.

---

### 9.10 Alerts and Order Status

Use:

- Success for confirmed orders.
- Warning for important cautions.
- Error for failed actions.
- Info for updates.

Every status must include text and/or an icon.

Do not rely on color alone.

---

## 10. UI Styles — Where to Use Them

| UI Style | Recommended Usage | Avoid |
|---|---|---|
| Minimalism | Main UI, navigation, menu, checkout, forms | Making the UI empty or generic |
| Bento Grid | Home discovery, promotions, categories | Dense checkout forms |
| Liquid Glass | Floating navigation, overlays, map controls | Every card and surface |
| Glassmorphism | Modals, sheets, overlays | Main text and menu content |
| Neumorphism | Minor decorative controls | Critical buttons and forms |
| Skeuomorphism | Small novelty elements | Main application design |
| Claymorphism | Onboarding and empty-state illustrations | Dense menus and lists |
| Brutalism | Special campaigns and brand pages | Everyday ordering flow |
| Maximalism | Festival promotions and banners | Navigation and checkout |
| Spatial UI | Future experiments and optional showcases | Required ordering flow |

---

## 11. Homepage Structure

Recommended homepage sequence:

1. Location selector and profile.
2. Search bar.
3. Promotional banner.
4. Food categories.
5. Popular restaurants.
6. Recommended dishes.
7. Nearby restaurants.
8. Best-rated restaurants.
9. Special offers.
10. Bottom navigation.

### Bento Grid Usage

Use Bento Grid for:

- Featured restaurants.
- Special promotions.
- Food categories.
- Curated collections.
- Trending dishes.
- Seasonal campaigns.

Do not force every section into a bento layout.

Use conventional lists and horizontal rails for repeated restaurant
and food browsing.

---

## 12. Navigation Structure

### Bottom Navigation

- Home
- Explore/Search
- Orders
- Favorites
- Profile

### Cart Access

Cart should be accessible during browsing.

When items are added, display a contextual cart summary
with item count and subtotal.

Cart should not make the bottom navigation ambiguous.

---

## 13. Motion and Interaction

- Transition duration: 150ms–220ms.
- Smooth hover and focus states.
- Subtle press feedback.
- Lightweight animations.
- Avoid exaggerated bouncing.
- Use skeleton loaders for food cards and restaurant lists.
- Food image transitions must not delay interaction.
- Respect `prefers-reduced-motion`.
- Avoid continuously animated backgrounds.

---

## 14. Accessibility

- Target WCAG 2.2 AA.
- Normal text contrast: minimum 4.5:1.
- Large text contrast: minimum 3:1.
- Touch targets: at least 44×44px where practical.
- Visible keyboard focus.
- Accessible labels for icon-only buttons.
- Meaningful alt text for food images.
- Empty alt for decorative imagery.
- Support zoom and text scaling.
- Form errors must identify the field and explain the issue.
- Status indicators must not rely on color alone.
- Validate orange button contrast in both themes.

---

## 15. Responsive Design

### Mobile

- Single-column layout.
- Horizontal category scrolling.
- Horizontal restaurant rails.
- Bottom navigation.
- Sticky cart/checkout summary.
- Touch-friendly controls.
- Safe-area support.

### Tablet

- Increase grid density.
- Two-column layouts where appropriate.
- Maintain readable card widths.

### Desktop

- Centered content.
- Max-width container.
- Two- or three-column restaurant grids.
- Split menu/cart layout when useful.
- Search and key actions remain discoverable.
- Do not simply stretch mobile cards.

---

## 16. Semantic Theme Tokens

Components must use semantic tokens rather than hardcoded colors.

Recommended tokens:

```text
background
surface
surface-elevated
surface-overlay

text-primary
text-secondary
text-muted

border
border-strong

brand
brand-hover
brand-pressed
brand-soft

success
warning
error
info
rating
price
scrim
```

Components should consume these tokens.

Avoid hardcoding color values inside individual components
so theme switching remains consistent and maintainable.

---

## 17. Design QA Checklist

Before releasing a screen:

- [ ] Dark mode is the default for new users.
- [ ] Light mode is designed and tested.
- [ ] System mode works if enabled.
- [ ] Theme preference persists.
- [ ] No flash of incorrect theme on initial load.
- [ ] Text contrast meets accessibility requirements.
- [ ] Food imagery is consistent and appetizing.
- [ ] Primary actions are clear.
- [ ] Card spacing is consistent.
- [ ] Border radius is consistent.
- [ ] Glass blur is limited.
- [ ] Hover states work.
- [ ] Pressed states work.
- [ ] Focus states work.
- [ ] Disabled states are clear.
- [ ] Loading states are defined.
- [ ] Error states are defined.
- [ ] Mobile touch targets are adequate.
- [ ] Sticky navigation does not obstruct content.
- [ ] Reduced-motion preference is respected.
- [ ] Mobile, tablet, and desktop layouts are tested.

---

## 18. Final Design Decision

Use **Minimalism as the foundation**,
**Bento Grid for food discovery**,
and **Liquid Glass for selected floating elements and overlays**.

### Default Theme

- Mode: Dark
- Background: `#121212`
- Surface: `#1B1B1B`
- Elevated Surface: `#242424`
- Primary Brand: `#FF8A26`
- Text: `#F5F5F5`
- Secondary Text: `#A3A3A3`
- Border: `#303030`

### User Theme Options

- Dark
- Light
- System (optional)

The interface should feel premium because it is well-spaced,
well-structured, responsive, and built around great food imagery.

**Do not add visual effects just for decoration.
Every effect must serve usability, hierarchy, or brand identity.**
