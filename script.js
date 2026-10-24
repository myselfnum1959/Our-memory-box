/* Memory Box — small interactions, no libraries required. */

(() => {
    'use strict';

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Select a record to change the label, personal note, and Spotify track.
    const initializeVinylPlayer = () => {
        const choices = Array.from(document.querySelectorAll('.record-choice'));
        const record = document.getElementById('featured-record');
        const recordNumber = document.getElementById('featured-record-number');
        const albumCover = document.getElementById('active-album-cover');
        const albumSleeve = document.getElementById('active-album-sleeve');
        const albumFallbackTitle = document.getElementById('album-cover-fallback-title');
        const albumFallbackNumber = document.getElementById('album-cover-fallback-number');
        const artworkCache = new Map();
        const miniArtwork = (trackId, imageUrl) => {
            choices.filter((item) => item.dataset.trackId === trackId).forEach((item) => {
                const label = item.querySelector('.mini-label');
                if (!label) return;
                label.style.backgroundImage = `url(\"${imageUrl}\")`;
                label.classList.add('has-artwork');
            });
        };
        const title = document.getElementById('active-track-title');
        const note = document.getElementById('active-track-note');
        const position = document.getElementById('active-track-position');
        const player = document.querySelector('.soundtrack-embed');
        const previous = document.getElementById('previous-track');
        const next = document.getElementById('next-track');
        if (!choices.length || !record || !recordNumber || !title || !note || !position || !player) return;

        let activeIndex = Math.max(0, choices.findIndex((choice) => choice.getAttribute('aria-pressed') === 'true'));
        const selectTrack = (index, animate = true) => {
            activeIndex = (index + choices.length) % choices.length;
            const choice = choices[activeIndex];
            const trackId = choice.dataset.trackId;
            const trackTitle = choice.dataset.trackTitle || 'Untitled';
            const trackNote = choice.dataset.trackNote || '';
            const trackNumber = choice.dataset.trackNumber || String(activeIndex + 1).padStart(2, '0');

            choices.forEach((item, itemIndex) => {
                const selected = itemIndex === activeIndex;
                item.classList.toggle('is-selected', selected);
                item.setAttribute('aria-pressed', String(selected));
            });

            title.textContent = trackTitle;
            note.textContent = trackNote;
            note.hidden = !trackNote;
            position.textContent = `${trackNumber} / ${String(choices.length).padStart(2, '0')}`;
            recordNumber.textContent = trackNumber;
            const labelColor = choice.dataset.labelColor || '#d9a08b';
            record.style.setProperty('--label-color', labelColor);
            if (albumSleeve) albumSleeve.style.setProperty('--label-color', labelColor);
            record.setAttribute('aria-label', `Vinyl record for ${trackTitle}`);
            player.title = `Listen to ${trackTitle} on Spotify`;

            // Spotify's public oEmbed endpoint supplies the track's real album artwork.
            // Keep a designed paper sleeve visible as a graceful fallback if it is unavailable.
            if (albumCover && albumSleeve) {
                albumCover.dataset.trackId = trackId;
                albumSleeve.classList.remove('has-artwork');
                albumCover.removeAttribute('src');
                albumCover.alt = `${trackTitle} album cover`;
                if (albumFallbackTitle) albumFallbackTitle.textContent = trackTitle;
                if (albumFallbackNumber) albumFallbackNumber.textContent = trackNumber;

                const applyArtwork = (imageUrl) => {
                    if (albumCover.dataset.trackId !== trackId) return;
                    albumCover.onload = () => {
                        if (albumCover.dataset.trackId === trackId) albumSleeve.classList.add('has-artwork');
                    };
                    albumCover.onerror = () => albumSleeve.classList.remove('has-artwork');
                    albumCover.src = imageUrl;
                    miniArtwork(trackId, imageUrl);
                };

                if (artworkCache.has(trackId)) {
                    applyArtwork(artworkCache.get(trackId));
                } else {
                    fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(`https://open.spotify.com/track/${trackId}`)}`)
                        .then((response) => {
                            if (!response.ok) throw new Error('Album artwork unavailable');
                            return response.json();
                        })
                        .then((data) => {
                            if (!data.thumbnail_url) throw new Error('No album artwork returned');
                            artworkCache.set(trackId, data.thumbnail_url);
                            miniArtwork(trackId, data.thumbnail_url);
                            applyArtwork(data.thumbnail_url);
                        })
                        .catch(() => {
                            if (albumCover.dataset.trackId === trackId) albumSleeve.classList.remove('has-artwork');
                        });
                }
            }

            const nextSrc = `https://open.spotify.com/embed/track/${encodeURIComponent(trackId)}?utm_source=generator&theme=0`;
            if (player.getAttribute('src') !== nextSrc) player.setAttribute('src', nextSrc);

            record.classList.remove('is-changing');
            if (animate && !prefersReducedMotion) {
                void record.offsetWidth;
                record.classList.add('is-changing');
            }
        };

        choices.forEach((choice, index) => choice.addEventListener('click', () => selectTrack(index)));
        previous?.addEventListener('click', () => selectTrack(activeIndex - 1));
        next?.addEventListener('click', () => selectTrack(activeIndex + 1));
        record.addEventListener('animationend', () => record.classList.remove('is-changing'));
        selectTrack(activeIndex, false);
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
        initializeVinylPlayer();
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
