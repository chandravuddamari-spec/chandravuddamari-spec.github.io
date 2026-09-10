# Customization Guide

This guide will help you customize every aspect of your portfolio template.

## Table of Contents
1. [Quick Customization](#quick-customization)
2. [Color Schemes](#color-schemes)
3. [Content Sections](#content-sections)
4. [Typography](#typography)
5. [Layout & Spacing](#layout--spacing)
6. [Icons](#icons)
7. [Advanced Customization](#advanced-customization)

---

## Quick Customization

### 1. Basic Information
Edit `data/profile.json`:
```json
{
  "profile": {
    "name": "Your Name",
    "title": "Your Title",
    "bio": "Your bio"
  }
}
```

### 2. Colors
Edit `assets/css/styles.css` (lines 4-16):
```css
:root {
    --primary-color: #YourColor;
    --secondary-color: #YourColor;
    --bg-primary: #YourColor;
}
```

### 3. Resume Download
1. Add your PDF to `documents/Your_Name_Resume.pdf`
2. Update link in `index.html` (line 51)

---

## Color Schemes

### Predefined Color Schemes

#### Professional Teal & Beige (Current)
```css
--primary-color: #154D57;
--secondary-color: #B7A08B;
--bg-primary: #FEFAF7;
```

#### Modern Blue & Orange
```css
--primary-color: #2563eb;
--secondary-color: #f59e0b;
--bg-primary: #ffffff;
```

#### Elegant Purple & Pink
```css
--primary-color: #7c3aed;
--secondary-color: #ec4899;
--bg-primary: #faf5ff;
```

#### Tech Green & Dark
```css
--primary-color: #10b981;
--secondary-color: #6ee7b7;
--bg-primary: #f0fdf4;
```

#### Corporate Navy & Gold
```css
--primary-color: #1e3a8a;
--secondary-color: #fbbf24;
--bg-primary: #f8fafc;
```

### Hero Gradient

Update the hero background gradient in `styles.css` (line 185):

```css
.hero {
    background: linear-gradient(135deg, #Color1 0%, #Color2 50%, #Color3 100%);
}
```

**Examples:**
- Sunset: `linear-gradient(135deg, #ff6b6b 0%, #f06595 50%, #cc5de8 100%)`
- Ocean: `linear-gradient(135deg, #0ea5e9 0%, #06b6d4 50%, #14b8a6 100%)`
- Forest: `linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)`

---

## Content Sections

### Hero Section

#### Update Professional Summary
Edit `index.html` (lines 45-51):
```html
<p class="hero-description">
    Your professional summary here.
</p>
```

#### Update Achievement Badges
Edit `index.html` (lines 52-65):
```html
<div class="highlight-item">
    <i class="fas fa-icon-name"></i>
    <span>Your Achievement</span>
</div>
```

### About Section
Edit `index.html` (lines 73-85):
- Update bio paragraphs
- Modify statistics (Years, Metrics, etc.)

### Experience Section
All content comes from `data/experience.json`:
```json
{
  "title": "Job Title",
  "company": "Company Name",
  "period": "Month Year - Month Year",
  "location": "City, State",
  "description": "Brief description",
  "responsibilities": [
    "Achievement 1",
    "Achievement 2"
  ]
}
```

**Tips:**
- Use action verbs (Led, Developed, Increased, etc.)
- Include metrics (%, numbers, timeframes)
- Keep it concise (3-8 responsibilities per role)

### Skills Section
Edit `data/skills.json` to organize by categories:
```json
{
  "category": "Category Name",
  "icon": "fas fa-icon-name",
  "skills": ["Skill 1", "Skill 2"]
}
```

**Recommended Categories:**
- Programming Languages
- Frameworks & Libraries
- Tools & Platforms
- Databases
- Methodologies
- Soft Skills

### Projects Section
Edit `data/projects.json`:
```json
{
  "title": "Project Name",
  "description": "What it does",
  "technologies": ["Tech1", "Tech2"],
  "icon": "fas fa-icon",
  "github": "https://github.com/...",
  "demo": "https://..."
}
```

**Project Icon Suggestions:**
- Web apps: `fas fa-globe`
- Mobile apps: `fas fa-mobile-alt`
- APIs: `fas fa-server`
- Data projects: `fas fa-database`
- ML/AI: `fas fa-brain`
- Games: `fas fa-gamepad`

---

## Typography

### Fonts

To change fonts, update in `styles.css` (line 19):

```css
:root {
    --font-primary: 'Your Font', sans-serif;
}
```

**Popular Font Combinations:**

1. **Modern & Clean**
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
   ```
   ```css
   --font-primary: 'Inter', sans-serif;
   ```

2. **Professional**
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap">
   ```
   ```css
   --font-primary: 'Roboto', sans-serif;
   ```

3. **Elegant**
   ```html
   <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&display=swap">
   ```
   ```css
   --font-primary: 'Playfair Display', serif;
   ```

### Font Sizes

Update in `styles.css`:
```css
.hero-title { font-size: 3.5rem; }      /* Main heading */
.hero-subtitle { font-size: 2rem; }     /* Subheading */
.section-title { font-size: 2.5rem; }   /* Section titles */
```

---

## Layout & Spacing

### Spacing Scale
Edit in `styles.css` (lines 23-27):
```css
:root {
    --spacing-xs: 0.5rem;
    --spacing-sm: 1rem;
    --spacing-md: 2rem;
    --spacing-lg: 4rem;
    --spacing-xl: 6rem;
}
```

### Container Width
Change max content width (line 86):
```css
.container {
    max-width: 1200px;  /* Try: 1000px, 1400px */
}
```

### Section Padding
Adjust vertical spacing between sections:
```css
.about { padding: var(--spacing-xl) 0; }  /* Change --spacing-xl to --spacing-lg for tighter */
```

---

## Icons

This template uses [Font Awesome](https://fontawesome.com/icons).

### Icon Types

1. **Solid Icons** - `fas fa-icon-name`
   ```html
   <i class="fas fa-code"></i>
   <i class="fas fa-users"></i>
   <i class="fas fa-chart-line"></i>
   ```

2. **Brand Icons** - `fab fa-brand-name`
   ```html
   <i class="fab fa-github"></i>
   <i class="fab fa-linkedin"></i>
   <i class="fab fa-twitter"></i>
   ```

### Common Icons for Portfolios

**Skills Categories:**
- Code: `fas fa-code`
- Tools: `fas fa-toolbox`
- Cloud: `fas fa-cloud`
- Database: `fas fa-database`
- Mobile: `fas fa-mobile-alt`
- Web: `fas fa-globe`
- Design: `fas fa-palette`
- Analytics: `fas fa-chart-bar`

**Achievements:**
- Growth: `fas fa-chart-line`
- Team: `fas fa-users`
- Award: `fas fa-trophy`
- Speed: `fas fa-bolt`
- Quality: `fas fa-star`

**Contact:**
- Email: `fas fa-envelope`
- Phone: `fas fa-phone`
- Location: `fas fa-map-marker-alt`

---

## Advanced Customization

### Adding New Sections

1. **Add HTML in `index.html`:**
```html
<section id="new-section" class="new-section">
    <div class="container">
        <h2 class="section-title">Section Title</h2>
        <div class="section-content">
            <!-- Your content -->
        </div>
    </div>
</section>
```

2. **Add CSS in `styles.css`:**
```css
.new-section {
    padding: var(--spacing-xl) 0;
    background-color: var(--bg-primary);
}
```

3. **Add to Navigation:**
```html
<li><a href="#new-section" class="nav-link">New Section</a></li>
```

### Animations

**Custom Animation Duration:**
```css
.timeline-content {
    transition: all 0.5s ease;  /* Change 0.5s */
}
```

**Add New Animation:**
```css
@keyframes slideIn {
    from { transform: translateX(-100%); }
    to { transform: translateX(0); }
}

.my-element {
    animation: slideIn 1s ease;
}
```

### Responsive Breakpoints

Adjust breakpoints in `styles.css` (lines 858, 913):
```css
@media (max-width: 768px) { /* Tablet */ }
@media (max-width: 480px) { /* Mobile */ }
```

Add custom breakpoint:
```css
@media (max-width: 1024px) {
    /* Your styles for large tablets */
}
```

### Box Shadows

Change depth/shadow:
```css
:root {
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}
```

---

## Quick Reference

### File Locations
- **Colors:** `assets/css/styles.css` lines 4-16
- **Hero Content:** `index.html` lines 37-66
- **Work Experience:** `data/experience.json`
- **Skills:** `data/skills.json`
- **Projects:** `data/projects.json`
- **Education:** `data/education.json`
- **Contact Info:** `data/profile.json`

### Testing Changes
1. Save your file
2. Refresh browser (Ctrl+F5 for hard refresh)
3. Check browser console (F12) for errors

### Validation Tools
- **HTML:** https://validator.w3.org/
- **CSS:** https://jigsaw.w3.org/css-validator/
- **JSON:** https://jsonlint.com/

---

## Need Help?

1. Check the main README.md
2. Refer to Font Awesome documentation for icons
3. Use browser dev tools (F12) to inspect elements
4. Validate JSON files if content isn't loading

Happy customizing! 🎨
