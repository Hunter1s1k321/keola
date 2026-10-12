/* =========================================================
   Keola — Senja ke Fajar
   Motion: GSAP 3.13 (ScrollTrigger, SplitText), native scrolling
   ========================================================= */
(() => {
    'use strict';

    const root = document.documentElement;
    const body = document.body;
    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

    const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    const fineMQ = window.matchMedia('(hover: hover) and (pointer: fine)');
    // The head script decides: OS preference, unless the viewer opted into full motion.
    const reduced = !root.classList.contains('motion');
    const forced = root.classList.contains('motion-forced');

    // Viewers whose device asks for less motion can opt in (and back out).
    if (reduceMQ.matches) {
        $$('.gate__motion, .footer__motion').forEach((el) => { el.hidden = false; });
        if (forced) {
            const note = $('.gate__motion-text');
            if (note) note.textContent = 'Animasi penuh sedang menyala.';
        }
        $$('[data-motion-toggle]').forEach((btn) => {
            btn.textContent = forced ? 'Kembali ke animasi minimal' : 'Nyalakan animasi penuh';
            btn.addEventListener('click', () => {
                try {
                    if (forced) localStorage.removeItem('keola-motion');
                    else localStorage.setItem('keola-motion', 'full');
                } catch (err) { /* storage blocked: the URL flag below still works */ }
                const url = new URL(location.href);
                if (forced) url.searchParams.delete('gerak');
                else url.searchParams.set('gerak', 'penuh');
                location.replace(url.toString());
            });
        });
    }
    const gsap = window.gsap;
    const hasGSAP = !!(gsap && window.ScrollTrigger);

    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    /* ------------------------------------------------------
       Audio: song + analyser (the ambient layer breathes with it)
       ------------------------------------------------------ */
    const song = $('#song');
    const musicBtn = $('#music');
    const bars = $$('.music__bars i');
    const VOLUME = 0.6;

    const audio = {
        ctx: null, gain: null, analyser: null, data: null,
        playing: false, level: 0, bands: [0, 0, 0, 0], pauseTimer: 0,
        // Web Audio on file:// taints the element and outputs silence, so only build the graph over http(s).
        canGraph: location.protocol.startsWith('http') && !!(window.AudioContext || window.webkitAudioContext),

        build() {
            if (this.ctx || !this.canGraph) return;
            try {
                const Ctx = window.AudioContext || window.webkitAudioContext;
                this.ctx = new Ctx();
                const src = this.ctx.createMediaElementSource(song);
                this.gain = this.ctx.createGain();
                this.gain.gain.value = 0;
                this.analyser = this.ctx.createAnalyser();
                this.analyser.fftSize = 256;
                this.analyser.smoothingTimeConstant = 0.86;
                src.connect(this.gain);
                this.gain.connect(this.analyser);
                this.analyser.connect(this.ctx.destination);
                this.data = new Uint8Array(this.analyser.frequencyBinCount);
            } catch (err) {
                this.ctx = null;
                this.gain = null;
                this.analyser = null;
            }
        },

        fade(to, seconds) {
            if (this.gain) {
                const t = this.ctx.currentTime;
                const g = this.gain.gain;
                g.cancelScheduledValues(t);
                g.setValueAtTime(g.value, t);
                g.linearRampToValueAtTime(to, t + seconds);
            } else if (hasGSAP) {
                gsap.to(song, { volume: to, duration: seconds, ease: 'sine.inOut', overwrite: true });
            } else {
                song.volume = to;
            }
        },

        async play() {
            clearTimeout(this.pauseTimer);
            this.build();
            if (this.ctx && this.ctx.state === 'suspended') {
                try { await this.ctx.resume(); } catch (err) { /* resumed on next gesture */ }
            }
            if (!this.gain) song.volume = 0;
            song.preload = 'auto';
            try {
                await song.play();
            } catch (err) {
                this.setState(false);
                return false;
            }
            this.fade(VOLUME, 3.2);
            this.setState(true);
            return true;
        },

        pause() {
            this.fade(0, 0.8);
            this.setState(false);
            clearTimeout(this.pauseTimer);
            this.pauseTimer = setTimeout(() => { if (!this.playing) song.pause(); }, 850);
        },

        toggle() { return this.playing ? this.pause() : this.play(); },

        setState(on) {
            this.playing = on;
            musicBtn.setAttribute('aria-pressed', String(on));
            musicBtn.setAttribute('aria-label', on ? 'Jeda lagu Firasat' : 'Putar lagu Firasat oleh Marcell');
        },

        // Called every frame. Returns a smoothed 0..1 loudness.
        sample(time) {
            let target = 0;
            if (this.playing && this.analyser) {
                this.analyser.getByteFrequencyData(this.data);
                const d = this.data;
                let sum = 0;
                for (let i = 2; i < 40; i++) sum += d[i];
                target = Math.min(1, (sum / (38 * 255)) * 1.6);
                const ranges = [[2, 6], [6, 14], [14, 28], [28, 56]];
                for (let b = 0; b < 4; b++) {
                    let s = 0;
                    const [lo, hi] = ranges[b];
                    for (let i = lo; i < hi; i++) s += d[i];
                    const v = s / ((hi - lo) * 255);
                    this.bands[b] += (v - this.bands[b]) * 0.35;
                }
            } else if (this.playing) {
                // No analyser (file:// or old browser): a slow, believable breath.
                target = 0.38 + 0.18 * Math.sin(time * 1.1) + 0.08 * Math.sin(time * 2.7);
                for (let b = 0; b < 4; b++) {
                    const v = 0.35 + 0.3 * Math.sin(time * (2.1 + b * 0.9) + b);
                    this.bands[b] += (v - this.bands[b]) * 0.2;
                }
            } else {
                for (let b = 0; b < 4; b++) this.bands[b] += (0 - this.bands[b]) * 0.12;
            }
            this.level += (target - this.level) * 0.08;
            return this.level;
        },
    };

    musicBtn.addEventListener('click', () => audio.toggle());
    song.addEventListener('ended', () => audio.setState(false));

    function drawBars() {
        for (let i = 0; i < bars.length; i++) {
            bars[i].style.transform = `scaleY(${(0.18 + audio.bands[i] * 0.95).toFixed(3)})`;
        }
    }

    /* ------------------------------------------------------
       No GSAP (CDN blocked/offline): readable static page.
       ------------------------------------------------------ */
    if (!hasGSAP) {
        root.classList.add('is-open');
        body.classList.remove('is-locked');
        const gate = $('#gate');
        if (gate) gate.remove();
        $$('.topbar, .music').forEach((el) => { el.style.opacity = 1; });
        const loop = (t) => { audio.sample(t / 1000); drawBars(); requestAnimationFrame(loop); };
        requestAnimationFrame(loop);
        setupFilm();
        setupLightbox();
        return;
    }

    const { ScrollTrigger } = window;
    const SplitText = window.SplitText;
    gsap.registerPlugin(ScrollTrigger);
    if (SplitText) gsap.registerPlugin(SplitText);
    gsap.defaults({ ease: 'expo.out', duration: 1.4 });
    // A 144 Hz panel doesn't need 144 animation updates a second. Scrolling itself stays native
    // (compositor-driven, full rate); only GSAP's own tweens are capped.
    gsap.ticker.fps(60);

    window.scrollTo(0, 0);

    function scrollToTarget(target) {
        const el = typeof target === 'string' ? $(target) : target;
        const top = el ? el.getBoundingClientRect().top + window.scrollY : 0;
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' });
        if (el && el.focus) el.focus({ preventScroll: true });
    }

    $$('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href');
            if (id.length < 2) return;
            const el = $(id);
            if (!el) return;
            e.preventDefault();
            scrollToTarget(el);
            history.replaceState(null, '', id);
        });
    });

    /* ------------------------------------------------------
       Ambient canvas: stars, fireflies, petals, shooting stars
       Drawn at CSS-pixel resolution and at most 30 fps: soft glowing
       points don't need hi-dpi or 144 redraws a second.
       ------------------------------------------------------ */
    const sky = {
        night: $('.sky__layer--night'),
        deep: $('.sky__layer--deep'),
        predawn: $('.sky__layer--predawn'),
        dawn: $('.sky__layer--dawn'),
    };

    const ambient = (() => {
        const canvas = $('.ambient');
        const ctx = canvas.getContext('2d');
        let w = 0, h = 0;
        let stars = [], motes = [], petals = [];
        let shoot = null, nextShoot = 6;
        let lite = false;
        const pointer = { x: 0, y: 0, tx: 0, ty: 0 };

        const css = getComputedStyle(root);
        const tone = (name) => css.getPropertyValue(name).trim();
        const C = {
            candle: tone('--color-candle-soft') || '#F7DDB8',
            star: tone('--color-text') || '#F7EDE6',
            rose: tone('--color-rose') || '#D4949B',
            roseSoft: tone('--color-rose-soft') || '#F2D3D3',
        };

        function hexA(hex, a) {
            const n = parseInt(hex.replace('#', ''), 16);
            return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
        }
        function sprite(size, stops) {
            const c = document.createElement('canvas');
            c.width = c.height = size;
            const g = c.getContext('2d');
            const grd = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
            stops.forEach(([o, col]) => grd.addColorStop(o, col));
            g.fillStyle = grd;
            g.fillRect(0, 0, size, size);
            return c;
        }
        const glow = sprite(48, [[0, hexA(C.candle, 1)], [0.18, hexA(C.candle, 0.7)], [0.45, hexA(C.candle, 0.14)], [1, hexA(C.candle, 0)]]);
        const petalSprite = (() => {
            const c = document.createElement('canvas');
            c.width = 40; c.height = 26;
            const g = c.getContext('2d');
            const grd = g.createLinearGradient(0, 0, 40, 26);
            grd.addColorStop(0, hexA(C.roseSoft, 0.95));
            grd.addColorStop(1, hexA(C.rose, 0.85));
            g.fillStyle = grd;
            g.beginPath();
            g.moveTo(2, 13);
            g.bezierCurveTo(10, 0, 30, 0, 38, 13);
            g.bezierCurveTo(30, 26, 10, 26, 2, 13);
            g.fill();
            return c;
        })();

        const rand = (a, b) => a + Math.random() * (b - a);

        function populate() {
            const area = w * h;
            const starCount = Math.round(Math.min(lite ? 60 : 120, Math.max(40, area / 12000)));
            const moteCount = lite ? 0 : Math.round(Math.min(18, Math.max(8, area / 80000)));
            const petalCount = lite ? 0 : Math.round(Math.min(14, Math.max(6, area / 110000)));
            stars = Array.from({ length: starCount }, () => ({
                x: Math.random() * w, y: Math.random() * h * 1.6,
                r: Math.random() < 0.08 ? rand(1.1, 1.7) : rand(0.4, 1),
                a: rand(0.35, 0.95), sp: rand(0.6, 2.2), ph: rand(0, Math.PI * 2), d: rand(0.02, 0.12),
            }));
            motes = Array.from({ length: moteCount }, () => ({
                x: Math.random() * w, y: Math.random() * h,
                r: rand(6, 14), vx: rand(-0.12, 0.12), vy: rand(-0.28, -0.06),
                ph: rand(0, Math.PI * 2), sp: rand(0.4, 1.2), d: rand(0.4, 1.2),
            }));
            petals = Array.from({ length: petalCount }, () => newPetal(true));
        }

        function resize() {
            w = window.innerWidth;
            h = window.innerHeight;
            canvas.width = w;
            canvas.height = h;
            populate();
            if (reduced) draw(0, 0, 0);
        }

        function newPetal(anywhere) {
            return {
                x: Math.random() * w, y: anywhere ? Math.random() * h : -30,
                s: rand(0.45, 1), vy: rand(0.35, 0.9), sway: rand(0.6, 1.6),
                rot: rand(0, Math.PI * 2), vr: rand(-0.012, 0.012), ph: rand(0, Math.PI * 2),
            };
        }

        function mood() {
            const o = (el) => (el ? Number(gsap.getProperty(el, 'opacity')) : 0);
            const dawn = o(sky.dawn);
            const predawn = o(sky.predawn);
            const deep = o(sky.deep);
            return {
                stars: Math.max(0, 1 - dawn * 0.92) * (0.75 + deep * 0.25),
                motes: Math.max(0.15, 1 - dawn * 0.7),
                petals: Math.min(1, predawn * 0.9 + dawn),
                shooting: (1 - dawn) * (0.4 + deep * 0.6 + o(sky.night) * 0.3),
            };
        }

        // dt is in seconds; f scales the old per-frame speeds (tuned at 60 fps) to real time.
        function draw(time, level, dt) {
            const f = Math.min(3, dt * 60);
            const m = mood();
            const scrollY = window.scrollY;
            pointer.x += (pointer.tx - pointer.x) * Math.min(1, 0.04 * f);
            pointer.y += (pointer.ty - pointer.y) * Math.min(1, 0.04 * f);
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.clearRect(0, 0, w, h);

            // Stars
            if (m.stars > 0.01) {
                ctx.fillStyle = C.star;
                const boost = 1 + level * 0.9;
                const span = h * 1.6;
                for (const s of stars) {
                    const y = ((s.y - scrollY * s.d) % span + span) % span - h * 0.3;
                    if (y < -4 || y > h + 4) continue;
                    const tw = 0.55 + 0.45 * Math.sin(time * s.sp + s.ph);
                    ctx.globalAlpha = Math.min(1, s.a * tw * m.stars * boost);
                    const r = s.r * (1 + level * 0.35);
                    ctx.fillRect(s.x + pointer.x * s.d * 60 - r, y + pointer.y * s.d * 60 - r, r * 2, r * 2);
                }
            }

            // Shooting star (time-based so it travels at the same speed at any frame rate)
            if (!reduced && !shoot && m.shooting > 0.45 && time > nextShoot) {
                const fromLeft = Math.random() < 0.5;
                shoot = { x: fromLeft ? rand(0, w * 0.4) : rand(w * 0.6, w), y: rand(0, h * 0.35), vx: (fromLeft ? 1 : -1) * rand(540, 780), vy: rand(180, 300), age: 0 };
                nextShoot = time + rand(7, 15);
            }
            if (shoot) {
                shoot.age += dt;
                shoot.x += shoot.vx * dt;
                shoot.y += shoot.vy * dt;
                const tail = 0.22;
                const a = Math.sin(Math.min(1, shoot.age / 0.9) * Math.PI) * m.shooting;
                const grd = ctx.createLinearGradient(shoot.x, shoot.y, shoot.x - shoot.vx * tail, shoot.y - shoot.vy * tail);
                grd.addColorStop(0, hexA(C.candle, a));
                grd.addColorStop(1, hexA(C.candle, 0));
                ctx.globalAlpha = 1;
                ctx.strokeStyle = grd;
                ctx.lineWidth = 1.4;
                ctx.beginPath();
                ctx.moveTo(shoot.x, shoot.y);
                ctx.lineTo(shoot.x - shoot.vx * tail, shoot.y - shoot.vy * tail);
                ctx.stroke();
                if (shoot.age > 0.9) shoot = null;
            }

            // Fireflies / warm dust
            if (motes.length) {
                ctx.globalCompositeOperation = 'lighter';
                for (const p of motes) {
                    if (!reduced) {
                        p.x += (p.vx + Math.sin(time * 0.35 + p.ph) * 0.22) * f;
                        p.y += p.vy * f;
                        if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
                        if (p.x < -20) p.x = w + 20;
                        if (p.x > w + 20) p.x = -20;
                    }
                    const flick = 0.45 + 0.55 * Math.pow(Math.max(0, Math.sin(time * p.sp + p.ph)), 2);
                    const r = p.r * (1 + level * 1.4);
                    ctx.globalAlpha = Math.min(1, flick * m.motes * (0.55 + level * 0.8));
                    ctx.drawImage(glow, p.x + pointer.x * p.d * 25 - r, p.y + pointer.y * p.d * 25 - r, r * 2, r * 2);
                }
                ctx.globalCompositeOperation = 'source-over';
            }

            // Petals (pre-dawn → dawn)
            if (petals.length && m.petals > 0.02) {
                ctx.globalAlpha = 0.7 * m.petals;
                for (let i = 0; i < petals.length; i++) {
                    const p = petals[i];
                    if (!reduced) {
                        p.y += p.vy * f;
                        p.x += Math.sin(time * p.sway + p.ph) * 0.6 * f;
                        p.rot += (p.vr + Math.sin(time + p.ph) * 0.004) * f;
                        if (p.y > h + 30) petals[i] = newPetal(false);
                    }
                    const sy = p.s * (0.6 + 0.4 * Math.abs(Math.sin(time * 0.8 + p.ph)));
                    const c = Math.cos(p.rot), s = Math.sin(p.rot);
                    ctx.setTransform(c * p.s, s * p.s, -s * sy, c * sy, p.x, p.y);
                    ctx.drawImage(petalSprite, -20, -13);
                }
                ctx.setTransform(1, 0, 0, 1, 0, 0);
            }
            ctx.globalAlpha = 1;
        }

        let resizeTimer = 0;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(resize, 200);
        });
        if (fineMQ.matches && !reduced) {
            window.addEventListener('pointermove', (e) => {
                pointer.tx = (e.clientX / w - 0.5) * 2;
                pointer.ty = (e.clientY / h - 0.5) * 2;
            }, { passive: true });
        }
        resize();

        return {
            draw,
            canvas,
            setLite() {
                if (lite) return;
                lite = true;
                populate();
            },
        };
    })();

    /* ------------------------------------------------------
       One shared, throttled loop for everything that moves on its own
       (canvas, music bars, hero glow, floating polaroids, scroll cue).
       ------------------------------------------------------ */
    const auraEl = $('.hero__aura');
    const setAura = gsap.quickSetter(auraEl, 'scale');
    const cueLine = $('.scroll-cue i');
    const lightbox = $('#lightbox');
    const floats = $$('.polaroid__float').map((el) => ({
        y: gsap.quickSetter(el, 'y', 'px'),
        r: gsap.quickSetter(el, 'rotate', 'deg'),
    }));
    const loop = {
        fps: 30,
        last: 0,
        heroInView: true,
        floating: false,
        ambientHidden: false,
        // Auto "lite": if the browser can't keep up shortly after opening, drop the heavier ambience.
        probe: { from: 0, frames: 0, done: false },
    };

    function setAmbientHidden(hidden) {
        if (loop.ambientHidden === hidden) return;
        loop.ambientHidden = hidden;
        ambient.canvas.style.visibility = hidden ? 'hidden' : '';
    }

    gsap.ticker.add((time) => {
        if (document.hidden) return;
        const level = audio.sample(time);

        const p = loop.probe;
        if (!reduced && opened && !p.done) {
            if (!p.from) p.from = time;
            p.frames += 1;
            if (time - p.from > 3) {
                p.done = true;
                const fps = p.frames / (time - p.from);
                if (fps < 40) {
                    ambient.setLite();
                    loop.fps = 20;
                    root.classList.add('is-lite');
                }
            }
        }

        if (time - loop.last < 1 / loop.fps - 0.002) return;
        const dt = Math.min(0.1, time - loop.last);
        loop.last = time;

        drawBars();
        if (reduced) return;

        if (loop.heroInView) {
            setAura(1 + level * 0.32);
            if (loop.floating && floats.length === 2) {
                floats[0].y(10 * Math.sin(time * 0.7));
                floats[0].r(1.5 * Math.sin(time * 0.7));
                floats[1].y(-12 * Math.sin(time * 0.57 + 1));
                floats[1].r(-1.5 * Math.sin(time * 0.57 + 1));
            }
            if (cueLine) cueLine.style.setProperty('--cue', ((time % 2.4) / 2.4).toFixed(3));
        }
        if (!loop.ambientHidden && !lightbox.open) ambient.draw(time, level, dt);
    });

    /* ------------------------------------------------------
       Cursor follower
       ------------------------------------------------------ */
    if (fineMQ.matches && !reduced) {
        root.classList.add('has-cursor');
        const cursor = $('.cursor');
        const dot = $('.cursor__dot');
        const ring = $('.cursor__ring');
        const dx = gsap.quickTo(dot, 'x', { duration: 0.15, ease: 'power3.out' });
        const dy = gsap.quickTo(dot, 'y', { duration: 0.15, ease: 'power3.out' });
        const rx = gsap.quickTo(ring, 'x', { duration: 0.7, ease: 'power3.out' });
        const ry = gsap.quickTo(ring, 'y', { duration: 0.7, ease: 'power3.out' });
        window.addEventListener('pointermove', (e) => {
            dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
            const t = e.target;
            cursor.classList.toggle('is-view', !!(t.closest && t.closest('[data-cursor]')));
            cursor.classList.toggle('is-hover', !!(t.closest && t.closest('a, button:not([data-cursor])')));
        }, { passive: true });
        document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
        document.addEventListener('pointerenter', () => cursor.classList.remove('is-hidden'));
    }

    /* ------------------------------------------------------
       Helpers
       ------------------------------------------------------ */
    function splitWords(el) {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        const nodes = [];
        while (walker.nextNode()) nodes.push(walker.currentNode);
        const words = [];
        nodes.forEach((node) => {
            const frag = document.createDocumentFragment();
            node.textContent.split(/(\s+)/).forEach((part) => {
                if (!part) return;
                if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(part)); return; }
                const span = document.createElement('span');
                span.className = 'w';
                span.textContent = part;
                words.push(span);
                frag.appendChild(span);
            });
            node.parentNode.replaceChild(frag, node);
        });
        return words;
    }

    // Ink reveal finished: drop the mask (see .ink in main.css)
    function inked() {
        this.targets().forEach((el) => el.classList.add('is-inked'));
    }

    function rgba(token, alpha) {
        const hex = getComputedStyle(root).getPropertyValue(token).trim().replace('#', '');
        const n = parseInt(hex, 16);
        return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
    }

    function drawable(path) {
        const len = path.getTotalLength();
        gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
        return len;
    }

    const mm = gsap.matchMedia();
    // 'not all' never matches, so every motion block below is skipped when motion is reduced.
    const when = (query) => (reduced ? 'not all' : query);

    /* ------------------------------------------------------
       Gate → open
       ------------------------------------------------------ */
    const gate = $('#gate');
    const heroVideo = $('.hero__video');
    let opened = false;

    const gateIntro = gsap.timeline({ paused: reduced });
    if (!reduced) {
        gateIntro
            .from('.gate__eyebrow', { opacity: 0, y: 14, duration: 1.6, ease: 'power2.out' }, 0.3)
            .to('.gate__name', { '--reveal': '120%', duration: 2.8, ease: 'power2.inOut', onComplete: inked }, 0.6)
            .from('.gate__line', { scaleX: 0, opacity: 0, duration: 1.4, ease: 'power3.inOut' }, 2.2)
            .from('.gate__open', { opacity: 0, y: 16, duration: 1.4 }, 2.5)
            .from('.gate__hint, .gate__motion', { opacity: 0, duration: 1.4, ease: 'power2.out' }, 2.8);
    }
    const openBtn = $('#gate-open');
    const behindGate = [$('#main'), $('.skip-link')];
    behindGate.forEach((el) => { el.inert = true; });
    openBtn.focus({ preventScroll: true });

    if (!reduced) {
        gsap.set('.hero__arch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 28px 28px)', y: 60 });
        gsap.set('.hero__aura, .hero__sub, .scroll-cue', { opacity: 0 });
        gsap.set('.hero__chip', { opacity: 0, x: -16 });
        gsap.set('.polaroid__float', { opacity: 0, y: 120 });
    }

    function openGate(withSound) {
        if (opened) return;
        opened = true;
        if (withSound) audio.play();
        gateIntro.progress(1);

        const tl = gsap.timeline({
            onComplete: () => {
                gate.remove();
                const hash = location.hash && $(location.hash);
                if (hash && hash.id !== 'senja') scrollToTarget(hash, { duration: 2.8 });
                ScrollTrigger.refresh();
            },
        });
        tl.to('.gate__inner', { opacity: 0, y: -30, filter: 'blur(10px)', duration: reduced ? 0.01 : 1.3, ease: 'power2.in' })
          .to(gate, { opacity: 0, duration: reduced ? 0.01 : 1.4, ease: 'power2.inOut' }, reduced ? 0 : 0.6)
          .add(() => {
              body.classList.remove('is-locked');
              root.classList.add('is-open');
              behindGate.forEach((el) => { el.inert = false; });
              const p = heroVideo.play();
              if (p && p.catch) p.catch(() => {});
              $('#main').querySelector('#senja').focus({ preventScroll: true });
          }, reduced ? 0 : 0.7)
          .add(heroIntro(), reduced ? 0 : 0.8);
    }
    openBtn.addEventListener('click', () => openGate(true));
    $('#gate-silent').addEventListener('click', () => openGate(false));

    /* ------------------------------------------------------
       I. Senja — hero
       ------------------------------------------------------ */
    function heroIntro() {
        const tl = gsap.timeline();
        tl.to('.topbar, .music', { opacity: 1, duration: 1.6, ease: 'power2.out' }, 1.2);
        if (reduced) {
            gsap.set('.topbar, .music', { opacity: 1 });
            return tl;
        }
        tl.to('.hero__arch', { clipPath: 'inset(0% 0% 0% 0% round 999px 999px 28px 28px)', y: 0, duration: 2.4, ease: 'expo.inOut' }, 0)
          .to('.hero__aura', { opacity: 1, duration: 3, ease: 'power2.out' }, 0.2)
          .to('.hero__name', { '--reveal': '120%', duration: 3, ease: 'power2.inOut', onComplete: inked }, 0.9)
          .to('.hero__chip', { opacity: 1, x: 0, duration: 1.6 }, 1.4)
          .fromTo('.hero__sub', { y: 16 }, { opacity: 1, y: 0, duration: 1.8 }, 2.0)
          .to('.polaroid__float', { opacity: 1, y: 0, duration: 2.4, stagger: 0.25 }, 1.0)
          .to('.scroll-cue', { opacity: 1, duration: 1.4, ease: 'power2.out' }, 2.8)
          .add(() => { loop.floating = true; });
        return tl;
    }

    if (!reduced) {
        // Mouse depth on hero layers
        if (fineMQ.matches) {
            const layers = $$('.hero__layer').map((el) => ({
                d: parseFloat(el.dataset.depth) || 0.5,
                x: gsap.quickTo(el, 'x', { duration: 1.6, ease: 'power3.out' }),
                y: gsap.quickTo(el, 'y', { duration: 1.6, ease: 'power3.out' }),
            }));
            $('#senja').addEventListener('pointermove', (e) => {
                const nx = e.clientX / window.innerWidth - 0.5;
                const ny = e.clientY / window.innerHeight - 0.5;
                layers.forEach((l) => { l.x(nx * 36 * l.d); l.y(ny * 24 * l.d); });
            });
        }

        // Leaving dusk: the window drifts up, the name dissolves
        gsap.timeline({
            scrollTrigger: { trigger: '#senja', start: 'top top', end: 'bottom top', scrub: 1.2 },
        })
            .to('.hero__arch', { yPercent: -18, scale: 1.12, ease: 'none' }, 0)
            .to('.polaroid--left', { y: -140, rotate: -5, ease: 'none' }, 0)
            .to('.polaroid--right', { y: -240, rotate: 4, ease: 'none' }, 0)
            .to('.hero__copy', { y: -90, opacity: 0, ease: 'none' }, 0)
            .to('.hero__chip', { opacity: 0, ease: 'none', duration: 0.4 }, 0)
            .to('.scroll-cue', { opacity: 0, ease: 'none', duration: 0.2 }, 0);
    }

    ScrollTrigger.create({
        trigger: '#senja',
        start: 'top bottom',
        end: 'bottom top',
        onToggle: (self) => {
            loop.heroInView = self.isActive;
            if (!opened) return;
            if (self.isActive) { const p = heroVideo.play(); if (p && p.catch) p.catch(() => {}); }
            else heroVideo.pause();
        },
    });

    /* ------------------------------------------------------
       Sky — dusk → night → deep night → pre-dawn → dawn
       ------------------------------------------------------ */
    function skyFade(layer, trigger, start, end, to = 1, from = 0, immediateRender = true) {
        gsap.fromTo(layer, { autoAlpha: from }, {
            autoAlpha: to, ease: 'none', immediateRender,
            scrollTrigger: { trigger, start, end, scrub: true },
        });
    }
    skyFade(sky.night, '#surat', 'top bottom', 'top 25%');
    skyFade(sky.deep, '#jarak', 'top bottom', 'top top');
    skyFade(sky.deep, '#kenangan', 'top bottom', 'top 30%', 0.35, 1, false);
    skyFade(sky.predawn, '#tentang', 'top bottom', 'center center');
    skyFade(sky.dawn, '#fajar', 'top 85%', 'top 5%');

    ScrollTrigger.create({
        trigger: '#fajar',
        start: 'top 45%',
        onToggle: (self) => body.classList.toggle('is-dawn', self.isActive),
    });

    gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.4 } });

    /* ------------------------------------------------------
       Chapter nav state
       ------------------------------------------------------ */
    // The active chapter is the last one whose top has crossed 55% of the viewport. Reading the
    // live position (instead of per-section start/end) stays right through pinned scenes and jumps.
    const navLinks = $$('[data-nav]');
    const chapters = $$('[data-chapter]');
    let currentChapter = '';
    function syncChapter() {
        const line = window.innerHeight * 0.55;
        let id = chapters[0].dataset.chapter;
        for (const section of chapters) {
            if (section.getBoundingClientRect().top <= line) id = section.dataset.chapter;
        }
        if (id === currentChapter) return;
        currentChapter = id;
        navLinks.forEach((a) => {
            const on = a.dataset.nav === id;
            a.classList.toggle('is-active', on);
            if (on) a.setAttribute('aria-current', 'step');
            else a.removeAttribute('aria-current');
        });
    }
    ScrollTrigger.create({ start: 0, end: 'max', onUpdate: syncChapter, onRefresh: syncChapter });

    /* ------------------------------------------------------
       Shared reveals: chips, chapter titles (SplitText)
       ------------------------------------------------------ */
    mm.add(when('all'), () => {
        $$('main .chip').forEach((chip) => {
            if (chip.closest('.hero')) return;
            gsap.from(chip, {
                opacity: 0, x: -18, duration: 1.4,
                scrollTrigger: { trigger: chip, start: 'top 88%', once: true },
            });
        });

        $$('.split-reveal').forEach((el) => {
            if (SplitText) {
                SplitText.create(el, {
                    type: 'lines,words',
                    mask: 'lines',
                    autoSplit: true,
                    onSplit: (self) => gsap.from(self.words, {
                        yPercent: 115, opacity: 0, rotate: 3,
                        duration: 1.6, stagger: 0.07,
                        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
                    }),
                });
            } else {
                gsap.from(el, { opacity: 0, y: 30, scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
            }
        });
    });

    /* ------------------------------------------------------
       II. Surat — words light up as you read
       ------------------------------------------------------ */
    const letterBody = $('[data-words]');
    const words = splitWords(letterBody);
    mm.add(when('all'), () => {
        gsap.fromTo(words, { opacity: 0.14 }, {
            opacity: 1, ease: 'none', stagger: 0.12,
            scrollTrigger: { trigger: letterBody, start: 'top 78%', end: 'bottom 52%', scrub: 1.2 },
        });
        gsap.fromTo('.letter__highlight span', { '--u': '0%', opacity: 0.25 }, {
            '--u': '100%', opacity: 1, ease: 'none',
            scrollTrigger: { trigger: '.letter__highlight', start: 'top 82%', end: 'bottom 58%', scrub: 1 },
        });
        gsap.from('.letter__sign', { opacity: 0, x: 24, duration: 1.8, scrollTrigger: { trigger: '.letter__sign', start: 'top 90%', once: true } });
        gsap.fromTo('.letter__thread', { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: '#surat', start: 'top 60%', end: 'bottom 70%', scrub: true } });
    });

    /* ------------------------------------------------------
       III. Jarak — a thread of light from "aku" to "kamu"
       ------------------------------------------------------ */
    mm.add(when('all'), () => {
        root.classList.add('has-motion');
        const thread = $('.distance__thread');
        const halo = $('.distance__halo');
        const spark = $('.distance__spark');
        const len = drawable(thread);
        drawable(halo);
        const nodes = $$('.distance__nodes circle');
        const draw = { p: 0 };

        gsap.set(nodes, { opacity: 0.08 });
        gsap.set('.distance__star--b', { opacity: 0.25 });
        gsap.set('.distance__line--2', { opacity: 0, y: 24 });

        const tl = gsap.timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: '#jarak', start: 'top top', end: '+=220%', pin: true, scrub: 1.4, anticipatePin: 1, refreshPriority: 2 },
        });
        tl.from('.distance__star--a', { opacity: 0, scale: 0.6, transformOrigin: '50% 50%', duration: 0.12 }, 0)
          .from('.distance__line--1', { opacity: 0, y: 24, duration: 0.12 }, 0.04)
          .to(draw, {
              p: 1, duration: 0.6,
              onUpdate: () => {
                  const d = draw.p * len;
                  thread.style.strokeDashoffset = len - d;
                  halo.style.strokeDashoffset = len - d;
                  const pt = thread.getPointAtLength(d);
                  spark.setAttribute('cx', pt.x);
                  spark.setAttribute('cy', pt.y);
                  spark.style.opacity = draw.p > 0 && draw.p < 1 ? 1 : 0;
              },
          }, 0.16)
          .to(nodes, { opacity: 0.95, stagger: 0.07, duration: 0.05 }, 0.2)
          .to('.distance__star--b', { opacity: 1, duration: 0.1 }, 0.66)
          .to('.distance__line--1', { opacity: 0, y: -24, duration: 0.1 }, 0.66)
          .to('.distance__line--2', { opacity: 1, y: 0, duration: 0.14 }, 0.74)
          .to('.distance__glow', { attr: { r: 110 }, duration: 0.2 }, 0.74)
          .to({}, { duration: 0.12 });

        return () => root.classList.remove('has-motion');
    });

    /* ------------------------------------------------------
       IV. Kenangan — horizontal journey
       ------------------------------------------------------ */
    const gallery = $('#kenangan');
    const track = $('.gallery__track');
    const frames = $$('.frame', track);
    const counter = $('.gallery__current');

    mm.add(when('(min-width: 900px)'), () => {
        gallery.classList.add('is-pinned');
        const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
        const move = gsap.to(track, {
            x: () => -distance(),
            ease: 'none',
            scrollTrigger: {
                trigger: gallery,
                start: 'top top',
                end: () => `+=${distance()}`,
                pin: true,
                scrub: 1.2,
                anticipatePin: 1,
                refreshPriority: 1,
                invalidateOnRefresh: true,
                onUpdate: (self) => {
                    gsap.set('.gallery__bar span', { scaleX: self.progress });
                    const i = Math.min(frames.length, Math.round(self.progress * (frames.length - 1)) + 1);
                    counter.textContent = String(i).padStart(2, '0');
                },
            },
        });

        frames.forEach((frame) => {
            const img = $('img', frame);
            const btn = $('.frame__btn', frame);
            gsap.fromTo(img, { xPercent: -9, scale: 1.22 }, {
                xPercent: 9, scale: 1.22, ease: 'none',
                scrollTrigger: { trigger: frame, containerAnimation: move, start: 'left right', end: 'right left', scrub: true },
            });
            gsap.fromTo(btn, { scale: 0.9, opacity: 0.35 }, {
                scale: 1, opacity: 1, ease: 'none',
                scrollTrigger: { trigger: frame, containerAnimation: move, start: 'left 100%', end: 'left 72%', scrub: true },
            });
            gsap.from($('.frame__cap', frame), {
                opacity: 0, y: 18, ease: 'none',
                scrollTrigger: { trigger: frame, containerAnimation: move, start: 'left 92%', end: 'left 68%', scrub: true },
            });
        });

        return () => gallery.classList.remove('is-pinned');
    });

    // Native horizontal scroll (reduced motion on wide screens): keep the counter honest
    track.addEventListener('scroll', () => {
        if (gallery.classList.contains('is-pinned')) return;
        const max = track.scrollWidth - track.clientWidth;
        if (max <= 0) return;
        const i = Math.round((track.scrollLeft / max) * (frames.length - 1)) + 1;
        counter.textContent = String(i).padStart(2, '0');
    }, { passive: true });

    mm.add(when('(max-width: 899px)'), () => {
        frames.forEach((frame) => {
            const btn = $('.frame__btn', frame);
            gsap.fromTo(btn, { y: 48, opacity: 0 }, {
                y: 0, opacity: 1, duration: 1.6,
                scrollTrigger: { trigger: frame, start: 'top 85%', once: true },
            });
            gsap.fromTo($('img', frame), { scale: 1.25 }, { scale: 1.05, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } });
            gsap.from($('.frame__cap', frame), { opacity: 0, y: 14, duration: 1.4, scrollTrigger: { trigger: frame, start: 'top 75%', once: true } });
        });
    });

    /* ------------------------------------------------------
       Interlude — the night film
       ------------------------------------------------------ */
    setupFilm();
    function setupFilm() {
        const film = $('#malam');
        const video = $('.film__video');
        const toggle = $('.film__toggle');
        const source = $('source[data-src]', video);
        let loaded = false;
        let userPaused = reduced;
        let inView = false;

        const load = () => {
            if (loaded) return;
            loaded = true;
            source.src = source.dataset.src;
            video.load();
        };
        const sync = () => {
            const playing = inView && !userPaused;
            if (playing) { load(); const p = video.play(); if (p && p.catch) p.catch(() => {}); }
            else video.pause();
            toggle.setAttribute('aria-pressed', String(playing));
            toggle.setAttribute('aria-label', playing ? 'Jeda video' : 'Putar video');
        };

        const io = new IntersectionObserver((entries) => {
            entries.forEach((e) => {
                if (e.target === film && e.isIntersecting) load();
            });
        }, { rootMargin: '800px 0px' });
        io.observe(film);
        new IntersectionObserver((entries) => {
            inView = entries[0].isIntersecting;
            sync();
        }, { threshold: 0.2 }).observe(video);

        toggle.addEventListener('click', () => {
            userPaused = toggle.getAttribute('aria-pressed') === 'true';
            if (!userPaused) inView = true;
            sync();
        });

        if (!hasGSAP) return;
        mm.add(when('all'), () => {
            const frame = $('.film__frame');
            gsap.fromTo(frame, { scale: 0.84 }, {
                scale: 1, ease: 'none',
                scrollTrigger: { trigger: film, start: 'top bottom', end: 'top top', scrub: 1 },
            });
            ScrollTrigger.create({ trigger: film, start: 'top top', end: 'bottom bottom', onToggle: (self) => setAmbientHidden(self.isActive) });
            const text = gsap.timeline({ scrollTrigger: { trigger: film, start: 'top 15%', end: 'bottom bottom', scrub: 1 } });
            text.from('.film__text .chip', { opacity: 0, x: -20, ease: 'none', duration: 0.2 })
                .from('.film__line', { opacity: 0, y: 40, ease: 'none', duration: 0.35 }, 0.1)
                .to({}, { duration: 0.3 })
                .to('.film__text', { opacity: 0, y: -30, ease: 'none', duration: 0.25 });
        });
    }

    /* ------------------------------------------------------
       V. Tentang
       ------------------------------------------------------ */
    mm.add(when('all'), () => {
        gsap.fromTo('.about__arch', { clipPath: 'inset(100% 0% 0% 0% round 999px 999px 28px 28px)' }, {
            clipPath: 'inset(0% 0% 0% 0% round 999px 999px 28px 28px)', duration: 2.2, ease: 'expo.inOut',
            scrollTrigger: { trigger: '.about__arch', start: 'top 80%', once: true },
        });
        gsap.fromTo('.about__arch img', { yPercent: -7 }, { yPercent: 7, ease: 'none', scrollTrigger: { trigger: '.about__arch', start: 'top bottom', end: 'bottom top', scrub: true } });
        gsap.from('.about__portrait figcaption', { opacity: 0, y: 20, duration: 1.8, scrollTrigger: { trigger: '.about__portrait figcaption', start: 'top 95%', once: true } });

        $$('.line-reveal').forEach((p) => {
            if (SplitText) {
                SplitText.create(p, {
                    type: 'lines',
                    mask: 'lines',
                    autoSplit: true,
                    onSplit: (self) => gsap.from(self.lines, {
                        yPercent: 100, opacity: 0, duration: 1.5, stagger: 0.1,
                        scrollTrigger: { trigger: p, start: 'top 85%', once: true },
                    }),
                });
            } else {
                gsap.from(p, { opacity: 0, y: 24, scrollTrigger: { trigger: p, start: 'top 85%', once: true } });
            }
        });

        const flourish = $('.about__flourish path');
        drawable(flourish);
        gsap.to(flourish, { strokeDashoffset: 0, duration: 2.6, ease: 'power2.inOut', scrollTrigger: { trigger: '.about__flourish', start: 'top 92%', once: true } });
    });

    /* ------------------------------------------------------
       VI. Fajar
       ------------------------------------------------------ */
    mm.add(when('all'), () => {
        gsap.fromTo('.dawn__sun', { yPercent: 45, scale: 0.8 }, {
            yPercent: 0, scale: 1, ease: 'none',
            scrollTrigger: { trigger: '#fajar', start: 'top bottom', end: 'center center', scrub: 1.2 },
        });
        const heart = $('.dawn__heart path');
        drawable(heart);
        const tl = gsap.timeline({ scrollTrigger: { trigger: '.dawn__copy', start: 'top 70%', once: true } });
        tl.from('.dawn__copy .chip', { opacity: 0, x: -16, duration: 1.4 })
          .to('.dawn__name', { '--reveal': '120%', duration: 2.6, ease: 'power2.inOut', onComplete: inked }, 0.2)
          .from('.dawn__line', { opacity: 0, y: 24, duration: 1.8 }, 1.2)
          .to(heart, { strokeDashoffset: 0, duration: 2.8, ease: 'power2.inOut' }, 1.6)
          .fromTo(heart, { fill: rgba('--color-rose', 0) }, { fill: rgba('--color-rose', 0.35), duration: 1.6, ease: 'power2.out' }, 3.8)
          .from('#replay', { opacity: 0, y: 16, duration: 1.4 }, 3.4);
    });

    $('#replay').addEventListener('click', () => scrollToTarget('#senja', { duration: 4.2 }));

    /* ------------------------------------------------------
       Lightbox
       ------------------------------------------------------ */
    setupLightbox();
    function setupLightbox() {
        const dialog = $('#lightbox');
        if (!dialog || typeof dialog.showModal !== 'function') return;
        const img = $('.lightbox__img', dialog);
        const num = $('.lightbox__num', dialog);
        const title = $('.lightbox__title', dialog);
        const items = $$('.frame').map((li) => {
            const im = $('img', li);
            const cap = $('.frame__cap', li);
            const srcset = im.getAttribute('srcset');
            const full = srcset ? srcset.split(',').pop().trim().split(' ')[0] : im.getAttribute('src');
            return { src: full, alt: im.alt, num: $('span', cap).textContent, title: cap.lastChild.textContent.trim() };
        });
        let index = 0;

        const show = (i, dir = 0) => {
            index = (i + items.length) % items.length;
            const it = items[index];
            const apply = () => {
                img.src = it.src;
                img.alt = it.alt;
                num.textContent = it.num;
                title.textContent = it.title;
            };
            if (hasGSAP && !reduced && dialog.open && dir) {
                gsap.timeline()
                    .to(img, { opacity: 0, x: -30 * dir, duration: 0.35, ease: 'power2.in' })
                    .add(apply)
                    .fromTo(img, { opacity: 0, x: 30 * dir }, { opacity: 1, x: 0, duration: 0.7, ease: 'expo.out' });
            } else {
                apply();
            }
        };

        $$('.frame__btn').forEach((btn) => {
            btn.addEventListener('click', () => {
                show(Number(btn.dataset.index));
                dialog.showModal();
                if (hasGSAP && !reduced) {
                    gsap.fromTo('.lightbox__figure', { opacity: 0, scale: 0.94, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.9 });
                }
            });
        });
        $('.lightbox__close', dialog).addEventListener('click', () => dialog.close());
        $('.lightbox__prev', dialog).addEventListener('click', () => show(index - 1, -1));
        $('.lightbox__next', dialog).addEventListener('click', () => show(index + 1, 1));
        dialog.addEventListener('click', (e) => { if (e.target === dialog) dialog.close(); });
        dialog.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') show(index - 1, -1);
            if (e.key === 'ArrowRight') show(index + 1, 1);
        });
        let startX = null;
        dialog.addEventListener('pointerdown', (e) => { startX = e.clientX; });
        dialog.addEventListener('pointerup', (e) => {
            if (startX === null) return;
            const dx = e.clientX - startX;
            startX = null;
            if (Math.abs(dx) > 50) show(index + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
        });
    }

    /* ------------------------------------------------------
       Layout settles after fonts & images
       ------------------------------------------------------ */
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
    window.addEventListener('load', () => ScrollTrigger.refresh());
})();
