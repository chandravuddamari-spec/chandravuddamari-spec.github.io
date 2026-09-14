// Portfolio renderer: every section is built from the JSON files in /data.

const $ = (selector, root = document) => root.querySelector(selector);

const escapeHTML = (value) =>
    String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

async function getJSON(path) {
    const response = await fetch(path);
    if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
    return response.json();
}

function setSectionTitle(id, text) {
    const title = $(`#${id} .section-title`);
    if (title && text) title.textContent = text;
}

// ==========================================================================
// Dates: "May 2025 - May 2026" -> { start, end } as absolute month indexes
// ==========================================================================
const MONTHS = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];

function parseMonth(text) {
    const value = text.trim().toLowerCase();
    if (/present|current|now/.test(value)) {
        const today = new Date();
        return today.getFullYear() * 12 + today.getMonth();
    }
    const match = value.match(/([a-z]{3})[a-z]*\.?\s+(\d{4})/);
    return match ? Number(match[2]) * 12 + MONTHS.indexOf(match[1]) : null;
}

function parsePeriod(period = '') {
    const [from, to] = period.split(/\s*[-–]\s*/);
    const start = parseMonth(from || '');
    if (start === null) return null;
    return { start, end: parseMonth(to || '') ?? start };
}

// Result figures (percentages, dollar amounts) get the highlighter.
const highlightMetrics = (text) =>
    escapeHTML(text).replace(/(\$\d[\d,.]*[KMB]?\+?|\d+(?:\.\d+)?%|one week to same day)/g, '<mark>$1</mark>');

// Only real, sourced logos are shown; without one the column stays empty.
const orgMark = (logo, alt, name) =>
    logo
        ? `<img class="org-logo" src="${escapeHTML(logo)}" alt="${escapeHTML(alt || name)} logo" width="56" height="56" loading="lazy">`
        : '<span class="org-logo-empty" aria-hidden="true"></span>';

// ==========================================================================
// Sections
// ==========================================================================
function renderSiteConfig(config) {
    document.title = config.meta.title;
    const setMeta = (selector, value) => $(selector)?.setAttribute('content', value);
    setMeta('meta[name="description"]', config.meta.description);
    setMeta('meta[name="author"]', config.meta.author);
    setMeta('meta[name="keywords"]', config.meta.keywords);
}

function renderNavigation(nav) {
    const brand = $('.nav-brand');
    brand.textContent = nav.brand.name;
    brand.href = nav.brand.href;

    const menu = $('#navMenu');
    menu.innerHTML = nav.menuItems
        .map((item) => `<li><a class="nav-link" href="${escapeHTML(item.href)}">${escapeHTML(item.label)}</a></li>`)
        .join('');

    const toggle = $('#navToggle');
    const setOpen = (open) => {
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    menu.addEventListener('click', (event) => {
        if (event.target.closest('a')) setOpen(false);
    });
}

function renderHero(hero) {
    $('#heroTitle').textContent = hero.title;
    $('#heroName').textContent = hero.name;
    $('#heroSummary').textContent = hero.summary;

    if (hero.avatarUrl) {
        $('#heroAvatar').innerHTML = `<img src="${escapeHTML(hero.avatarUrl)}" alt="${escapeHTML(hero.avatarAlt || hero.name)}" width="640" height="640" fetchpriority="high">`;
    }

    $('#heroCTA').innerHTML = hero.cta.buttons
        .map((b) => {
            const icon = b.icon ? `<i class="${escapeHTML(b.icon)}" aria-hidden="true"></i>` : '';
            const external = b.external ? ' target="_blank" rel="noopener"' : '';
            return `<a class="btn btn-${escapeHTML(b.type)}" href="${escapeHTML(b.href)}"${external}>${icon}${escapeHTML(b.text)}</a>`;
        })
        .join('');
}

// Two-lane timeline (work, study) drawn from the experience and education data.
function renderCareerChart(experiences, education) {
    const figure = $('#careerChart');
    // An empty chartLabel draws the bar without a label (used when two roles share one).
    const toItem = (lane, e, fallback) => ({
        lane,
        label: e.chartLabel ?? fallback,
        name: e.chartLabel || fallback,
        periodText: e.period,
        period: parsePeriod(e.period),
    });
    const items = [
        ...experiences.map((e) => toItem(0, e, `${e.title}, ${e.company}`)),
        ...education.map((e) => toItem(1, e, `${e.degree}, ${e.school}`)),
    ]
        .filter((item) => item.period)
        .sort((a, b) => a.period.start - b.period.start);

    if (!items.length) {
        figure.hidden = true;
        return;
    }

    const W = 1000, H = 262, LEFT = 84, RIGHT = 24, BAR = 14, ROW = 16, GAP = 12;
    const LANES = [{ name: 'Work', y: 118 }, { name: 'Study', y: 212 }];
    const firstYear = Math.floor(Math.min(...items.map((i) => i.period.start)) / 12);
    const lastYear = Math.floor(Math.max(...items.map((i) => i.period.end)) / 12) + 1;
    const x = (month) => LEFT + ((month - firstYear * 12) / ((lastYear - firstYear) * 12)) * (W - LEFT - RIGHT);

    const work = items.filter((i) => i.lane === 0);
    const latest = work.reduce((a, b) => (b.period.end > a.period.end ? b : a), work[0]);

    // Measure labels in the chart font so placement matches what is drawn.
    const ctx = document.createElement('canvas').getContext('2d');
    if (ctx) ctx.font = `500 12.5px ${getComputedStyle(document.body).getPropertyValue('--font-body').trim() || 'sans-serif'}`;
    const measure = (text) => (ctx ? ctx.measureText(text).width : text.length * 7.4);

    // Place labels latest-first, each starting at its bar or ending at it, so they share one row;
    // only a label with no room steps up a row and gets a leader line.
    const placed = [[], []];
    const layout = new Map();
    [...items].reverse().forEach((item) => {
        if (!item.label) return;
        const barX = x(item.period.start);
        const barEnd = Math.min(x(item.period.end + 1), W - RIGHT);
        const width = measure(item.label);
        const options = [
            { anchor: 'start', at: barX, start: barX, end: barX + width },
            { anchor: 'end', at: barEnd, start: barEnd - width, end: barEnd },
        ].filter((o) => o.start >= LEFT && o.end <= W - RIGHT);
        if (!options.length) options.push({ anchor: 'end', at: W - RIGHT, start: W - RIGHT - width, end: W - RIGHT });

        const taken = placed[item.lane];
        for (let row = 0; ; row++) {
            const fit = options.find((o) => taken.every((t) => t.row !== row || o.end + GAP <= t.start || o.start >= t.end + GAP));
            if (fit) {
                taken.push({ row, start: fit.start, end: fit.end });
                layout.set(item, { ...fit, row });
                break;
            }
        }
    });

    let svg = '';
    for (let year = firstYear; year <= lastYear; year++) {
        const gx = x(year * 12).toFixed(1);
        svg += `<line class="chart-grid" x1="${gx}" x2="${gx}" y1="24" y2="${H - 34}"/>`;
        if (year < lastYear) {
            svg += `<text class="chart-year" x="${x(year * 12 + 6).toFixed(1)}" y="${H - 10}" text-anchor="middle">${year}</text>`;
        }
    }
    LANES.forEach((lane) => {
        svg += `<text class="chart-lane" x="0" y="${lane.y + BAR - 2}">${lane.name}</text>`;
        svg += `<line class="chart-baseline" x1="${LEFT}" x2="${W - RIGHT}" y1="${lane.y + BAR}" y2="${lane.y + BAR}"/>`;
    });

    items.forEach((item, index) => {
        const { y } = LANES[item.lane];
        const barX = x(item.period.start);
        const barEnd = x(item.period.end + 1);
        const kind = item === latest ? 'bar-current' : item.lane === 0 ? 'bar-work' : 'bar-study';
        svg += `<rect class="chart-bar ${kind}" x="${barX.toFixed(1)}" y="${y}" width="${Math.max(barEnd - barX, 6).toFixed(1)}" height="${BAR}" rx="2" style="animation-delay:${index * 90}ms"/>`;

        const label = layout.get(item);
        if (!label) return;
        const labelY = y - 10 - label.row * ROW;
        if (label.row > 0) {
            svg += `<line class="chart-leader" x1="${label.at.toFixed(1)}" x2="${label.at.toFixed(1)}" y1="${labelY + 4}" y2="${y}"/>`;
        }
        svg += `<text class="chart-label" x="${label.at.toFixed(1)}" y="${labelY}"${label.anchor === 'end' ? ' text-anchor="end"' : ''}>${escapeHTML(item.label)}</text>`;
    });

    figure.insertAdjacentHTML(
        'beforeend',
        `<div class="chart-scroll"><svg viewBox="0 0 ${W} ${H}" aria-hidden="true" focusable="false">${svg}</svg></div>
         <ul class="visually-hidden chart-a11y">${items.map((i) => `<li>${escapeHTML(i.name)}, ${escapeHTML(i.periodText)}</li>`).join('')}</ul>`
    );

    // Label widths depend on the web font; redraw once it has loaded if it had not yet.
    if (document.fonts && document.fonts.status !== 'loaded' && !figure.dataset.waitingForFonts) {
        figure.dataset.waitingForFonts = 'true';
        document.fonts.ready.then(() => {
            figure.querySelectorAll('.chart-scroll, .chart-a11y').forEach((node) => node.remove());
            renderCareerChart(experiences, education);
        });
    }
}

function renderAbout(about, counts) {
    setSectionTitle('about', about.sectionTitle);
    $('#aboutText').innerHTML = about.paragraphs.map((p) => `<p>${escapeHTML(p)}</p>`).join('');
    $('#aboutStats').innerHTML = about.statistics
        .map((stat) => `<div class="stat"><dt>${escapeHTML(stat.label)}</dt><dd>${escapeHTML(counts[stat.value] ?? stat.value)}</dd></div>`)
        .join('');
}

function renderExperience(data) {
    setSectionTitle('experience', data.sectionTitle);
    $('#experienceTimeline').innerHTML = data.experiences
        .map((exp) => `
            <li class="role">
                ${orgMark(exp.logo, exp.logoAlt, exp.company)}
                <div>
                    <h3 class="role-title">${escapeHTML(exp.title)}</h3>
                    <p class="role-org">${escapeHTML(exp.company)}</p>
                </div>
                <p class="role-period">${escapeHTML(exp.period)}</p>
                <ul class="role-points">${(exp.responsibilities || []).map((r) => `<li>${highlightMetrics(r)}</li>`).join('')}</ul>
            </li>`)
        .join('');
}

function projectLink(url) {
    let host;
    try {
        host = new URL(url).hostname;
    } catch {
        return '';
    }
    const kinds = [
        ['github.com', 'fab fa-github', 'View repository'],
        ['loom.com', 'fas fa-play', 'Watch demo'],
        ['drive.google.com', 'fas fa-file-lines', 'Read the write-up'],
        ['powerbi.com', 'fas fa-chart-column', 'Open live report'],
    ];
    const [, icon, label] = kinds.find(([domain]) => host.endsWith(domain)) || [null, 'fas fa-arrow-up-right-from-square', 'Open project'];
    return `<a class="project-link" href="${escapeHTML(url)}" target="_blank" rel="noopener"><i class="${icon}" aria-hidden="true"></i>${label}</a>`;
}

function renderProjects(data) {
    setSectionTitle('projects', data.sectionTitle);
    const lede = $('#projectsLede');
    if (data.lede) lede.textContent = data.lede;
    else lede.hidden = true;

    const projects = data.projects.filter((p) => !p.hidden);
    $('#projectsGrid').innerHTML = projects
        .map((p) => {
            const links = [...new Set([p.github, p.demo].filter(Boolean))].map(projectLink).join('');
            const tags = p.technologies?.length
                ? `<ul class="project-tags">${p.technologies.map((t) => `<li class="tag">${escapeHTML(t)}</li>`).join('')}</ul>`
                : '';
            return `
            <article class="project${p.featured ? ' is-featured' : ''}">
                ${p.cover ? `<img class="project-cover" src="${escapeHTML(p.cover)}" alt="" width="1200" height="800" loading="lazy">` : ''}
                <div class="project-body">
                    <h3 class="project-title">${escapeHTML(p.title)}</h3>
                    <p class="project-desc">${escapeHTML(p.description)}</p>
                    ${tags}
                    ${links ? `<div class="project-links">${links}</div>` : ''}
                </div>
            </article>`;
        })
        .join('');
    return projects.length;
}

function renderSkills(data) {
    setSectionTitle('skills', data.sectionTitle);
    $('#skillsGrid').innerHTML = data.categories
        .map((c) => `
            <div class="skill-group">
                <h3>${escapeHTML(c.category)}</h3>
                <ul class="skill-list">${c.skills.map((s) => `<li class="skill">${escapeHTML(s)}</li>`).join('')}</ul>
            </div>`)
        .join('');
    return data.categories.reduce((total, c) => total + c.skills.length, 0);
}

function renderEducation(data) {
    setSectionTitle('education', data.sectionTitle);
    $('#educationGrid').innerHTML = data.education
        .map((edu) => `
            <li class="role">
                ${orgMark(edu.logo, edu.logoAlt, edu.school)}
                <div>
                    <h3 class="role-title">${escapeHTML(edu.degree)}</h3>
                    <p class="role-org">${escapeHTML(edu.school)}</p>
                </div>
                <p class="role-period">${escapeHTML(edu.period)}</p>
            </li>`)
        .join('');

    const certs = data.certifications || [];
    const block = $('#certifications');
    if (!certs.length) {
        block.hidden = true;
        return;
    }
    block.querySelector('h3').textContent = data.certificationsTitle || 'Certifications';
    block.querySelector('ul').innerHTML = certs
        .map((c) => `<li class="skill">${escapeHTML(c.name)}${c.issuer ? `, ${escapeHTML(c.issuer)}` : ''}</li>`)
        .join('');
}

function renderContact(data) {
    setSectionTitle('contact', data.sectionTitle);
    if (data.lede) $('#contactLede').textContent = data.lede;
    $('#contactInfo').innerHTML = data.contactInfo
        .map((info) => `
            <li class="contact-item">
                <a href="${escapeHTML(info.href)}">
                    <i class="${escapeHTML(info.icon)}" aria-hidden="true"></i>
                    <span><span class="visually-hidden">${escapeHTML(info.label)}: </span>${escapeHTML(info.value)}</span>
                </a>
            </li>`)
        .join('');
}

function renderFooter(data) {
    const { year, name, text } = data.copyright;
    $('#footerCopyright').textContent = `© ${year} ${name}. ${text}`;
    $('#footerLinks').innerHTML = (data.links || [])
        .map((l) => `<a href="${escapeHTML(l.url)}" target="_blank" rel="noopener">${escapeHTML(l.text)}</a>`)
        .join('');
}

// ==========================================================================
// Behaviour
// ==========================================================================
function initHeaderAndActiveLink() {
    const header = $('#navbar');
    const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    if (!('IntersectionObserver' in window)) return;
    const links = new Map([...document.querySelectorAll('.nav-link')].map((a) => [a.getAttribute('href').slice(1), a]));
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                links.forEach((a) => a.classList.remove('active'));
                links.get(entry.target.id)?.classList.add('active');
            });
        },
        { rootMargin: '-45% 0px -50% 0px' }
    );
    document.querySelectorAll('main section[id]').forEach((section) => observer.observe(section));
}

document.addEventListener('DOMContentLoaded', async () => {
    const files = ['site-config', 'navigation', 'hero', 'about', 'experience', 'skills', 'projects', 'education', 'contact', 'footer'];
    const results = await Promise.allSettled(files.map((f) => getJSON(`data/${f}.json`)));
    const data = {};
    results.forEach((result, i) => {
        if (result.status === 'fulfilled') data[files[i]] = result.value;
        else console.error(`Could not load data/${files[i]}.json`, result.reason);
    });

    // A broken section should not blank the rest of the page.
    const run = (name, render) => {
        try {
            return render();
        } catch (error) {
            console.error(`Could not render ${name}`, error);
            return undefined;
        }
    };

    if (data['site-config']) run('site config', () => renderSiteConfig(data['site-config']));
    if (data.navigation) run('navigation', () => renderNavigation(data.navigation));
    if (data.hero) run('hero', () => renderHero(data.hero));
    if (data.experience && data.education) {
        run('career chart', () => renderCareerChart(data.experience.experiences, data.education.education));
    }
    if (data.experience) run('experience', () => renderExperience(data.experience));
    const projectCount = data.projects ? run('projects', () => renderProjects(data.projects)) : undefined;
    const skillCount = data.skills ? run('skills', () => renderSkills(data.skills)) : undefined;
    if (data.about) run('about', () => renderAbout(data.about, { 'auto:projects': projectCount, 'auto:skills': skillCount }));
    if (data.education) run('education', () => renderEducation(data.education));
    if (data.contact) run('contact', () => renderContact(data.contact));
    if (data.footer) run('footer', () => renderFooter(data.footer));

    initHeaderAndActiveLink();
});
