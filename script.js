/* Memory Box — small interactions, no libraries required. */

(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Show the personal note attached to each song player.
    const initializeSpotifyTooltips = () => {
        const cards = document.querySelectorAll('.spotify-card');
        const tooltip = document.querySelector('.song-description');
        if (!cards.length || !tooltip) return;

        let activeCard = null;

        const positionTooltip = (event) => {
            const point = event.touches?.[0] || event.changedTouches?.[0] || event;
            const x = point.clientX;
            const y = point.clientY;
            if (!Number.isFinite(x) || !Number.isFinite(y)) return;

            const edge = 14;
            const offset = 18;
            const width = tooltip.offsetWidth;
            const height = tooltip.offsetHeight;
            let left = x + offset;
            let top = y + offset;

            if (left + width > window.innerWidth - edge) left = x - width - offset;
            if (top + height > window.innerHeight - edge) top = y - height - offset;

            left = Math.max(edge, Math.min(left, window.innerWidth - width - edge));
            top = Math.max(edge, Math.min(top, window.innerHeight - height - edge));
            tooltip.style.left = `${left}px`;
            tooltip.style.top = `${top}px`;
        };

        const hideTooltip = () => {
            tooltip.classList.remove('show');
            activeCard = null;
        };

        const showTooltip = (card, event) => {
            const iframe = card.querySelector('iframe');
            const description = iframe?.dataset.description?.trim();
            if (!description) return;
            tooltip.textContent = description;
            tooltip.classList.add('show');
            activeCard = card;
            if (event) positionTooltip(event);
        };

        cards.forEach((card) => {
            const iframe = card.querySelector('iframe');
            if (!iframe?.dataset.description) return;

            card.addEventListener('mouseenter', (event) => {
                if (event.pointerType === 'touch') return;
                showTooltip(card, event);
            });
            card.addEventListener('mousemove', (event) => {
                if (activeCard === card) positionTooltip(event);
            });
            card.addEventListener('mouseleave', hideTooltip);

            // Touch notes appear briefly without preventing interaction with Spotify.
            card.addEventListener('touchstart', (event) => {
                if (activeCard === card) {
                    hideTooltip();
                } else {
                    showTooltip(card, event);
                }
            }, { passive: true });
        });

        document.addEventListener('pointerdown', (event) => {
            if (!event.target.closest('.spotify-card')) hideTooltip();
        });
        window.addEventListener('scroll', hideTooltip, { passive: true });
        window.addEventListener('resize', hideTooltip);
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') hideTooltip();
        });
    };

    // Calendar-aware elapsed time from October 18, 2024.
    const initializeCounter = () => {
        const startDate = new Date(2024, 9, 18, 0, 0, 0, 0);
        const fields = ['years', 'months', 'days', 'hours', 'minutes', 'seconds'];
        if (!fields.some((id) => document.getElementById(id))) return;

        const addMonths = (date, amount) => {
            const result = new Date(date);
            const originalDay = result.getDate();
            result.setDate(1);
            result.setMonth(result.getMonth() + amount);
            const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
            result.setDate(Math.min(originalDay, lastDay));
            return result;
        };

        const writeValue = (id, value) => {
            const node = document.getElementById(id);
            if (node) node.textContent = String(value).padStart(id === 'years' ? 1 : 2, '0');
        };

        const update = () => {
            const now = new Date();
            const isBeforeStart = now < startDate;
            const reference = isBeforeStart ? startDate : now;

            let totalMonths = Math.max(0,
                (reference.getFullYear() - startDate.getFullYear()) * 12 +
                (reference.getMonth() - startDate.getMonth())
            );
            while (totalMonths > 0 && addMonths(startDate, totalMonths) > reference) {
                totalMonths -= 1;
            }

            const anchor = addMonths(startDate, totalMonths);
            let remainder = Math.max(0, reference.getTime() - anchor.getTime());
            const msPerDay = 24 * 60 * 60 * 1000;
            const msPerHour = 60 * 60 * 1000;
            const msPerMinute = 60 * 1000;
            const days = Math.floor(remainder / msPerDay);
            remainder -= days * msPerDay;
            const hours = Math.floor(remainder / msPerHour);
            remainder -= hours * msPerHour;
            const minutes = Math.floor(remainder / msPerMinute);
            remainder -= minutes * msPerMinute;
            const seconds = Math.floor(remainder / 1000);

            writeValue('years', Math.floor(totalMonths / 12));
            writeValue('months', totalMonths % 12);
            writeValue('days', days);
            writeValue('hours', hours);
            writeValue('minutes', minutes);
            writeValue('seconds', seconds);

            const years = Math.floor(totalMonths / 12);
            const details = document.getElementById('counterDetails');
            if (details) {
                const anniversaryLabel = years === 1 ? 'anniversary' : 'anniversaries';
                const monthLabel = totalMonths === 1 ? 'month' : 'months';
                details.textContent = isBeforeStart
                    ? 'Our story is just about to begin.'
                    : `${years} ${anniversaryLabel} and ${totalMonths} ${monthLabel} of choosing each other.`;
            }
        };

        update();
        window.setInterval(update, 1000);

        const yearNode = document.getElementById('footerYear');
        if (yearNode) yearNode.textContent = `2024–${new Date().getFullYear()}`;
    };

    // Reveal photos gently as they enter the viewport; fall back to visible content.
    const initializeScrollAnimations = () => {
        const items = document.querySelectorAll('.memory-item');
        if (!items.length || prefersReducedMotion || !('IntersectionObserver' in window)) return;

        const observer = new IntersectionObserver((entries, currentObserver) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    currentObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.08, rootMargin: '0px 0px -35px 0px' });

        items.forEach((item, index) => {
            item.classList.add('reveal');
            item.style.transitionDelay = `${Math.min(index % 3, 2) * 55}ms`;
            observer.observe(item);
        });
    };

    // Click any photograph to open the accessible, keyboard-friendly photo viewer.
    const initializeLightbox = () => {
        const dialog = document.getElementById('memoryLightbox');
        const cards = Array.from(document.querySelectorAll('.memory-card'));
        if (!dialog || !cards.length || typeof dialog.showModal !== 'function') return;

        const image = dialog.querySelector('.lightbox-image');
        const title = dialog.querySelector('.lightbox-title');
        const date = dialog.querySelector('.lightbox-date');
        const counter = dialog.querySelector('.lightbox-counter');
        const closeButton = dialog.querySelector('.lightbox-close');
        const previousButton = dialog.querySelector('.lightbox-prev');
        const nextButton = dialog.querySelector('.lightbox-next');
        let currentIndex = 0;

        const render = (index) => {
            currentIndex = (index + cards.length) % cards.length;
            const card = cards[currentIndex];
            const photo = card.querySelector('img');
            image.src = photo.currentSrc || photo.src;
            image.alt = photo.alt || '';
            title.textContent = card.querySelector('.memory-caption')?.textContent.trim() || '';
            date.textContent = card.querySelector('.memory-date')?.textContent.trim() || '';
            counter.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
        };

        cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                render(index);
                if (!dialog.open) dialog.showModal();
                closeButton.focus();
            });
        });

        closeButton.addEventListener('click', () => dialog.close());
        previousButton.addEventListener('click', () => render(currentIndex - 1));
        nextButton.addEventListener('click', () => render(currentIndex + 1));

        dialog.addEventListener('click', (event) => {
            if (event.target === dialog) dialog.close();
        });

        dialog.addEventListener('keydown', (event) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                render(currentIndex - 1);
            } else if (event.key === 'ArrowRight') {
                event.preventDefault();
                render(currentIndex + 1);
            }
        });
    };

    const initializeSmoothScroll = () => {
        document.querySelectorAll('a[href^="#"]').forEach((link) => {
            link.addEventListener('click', (event) => {
                const selector = link.getAttribute('href');
                if (!selector || selector === '#') return;
                const target = document.querySelector(selector);
                if (!target) return;
                event.preventDefault();
                target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
            });
        });
    };

    const init = () => {
        initializeSpotifyTooltips();
        initializeCounter();
        initializeScrollAnimations();
        initializeLightbox();
        initializeSmoothScroll();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init, { once: true });
    } else {
        init();
    }
})();
