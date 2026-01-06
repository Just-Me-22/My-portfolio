/**
 * Chart rendering functions for GitHub statistics
 */

const ChartRenderer = {
    /**
     * Create a simple pie chart for languages using SVG
     */
    createLanguageChart(languages) {
        const container = document.getElementById('languageChart');
        if (!container) return;

        const total = Object.values(languages).reduce((sum, val) => sum + val, 0);
        const sortedLanguages = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        // Color palette
        const colors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
            '#06b6d4', '#6366f1', '#f97316'
        ];

        const radius = 80;
        const centerX = 100;
        const centerY = 100;

        let svg = `<svg viewBox="0 0 200 200" style="max-width: 300px; height: auto;">`;

        let currentAngle = -Math.PI / 2;

        sortedLanguages.forEach((lang, index) => {
            const percentage = lang[1] / total;
            const sliceAngle = percentage * 2 * Math.PI;

            const x1 = centerX + radius * Math.cos(currentAngle);
            const y1 = centerY + radius * Math.sin(currentAngle);

            currentAngle += sliceAngle;

            const x2 = centerX + radius * Math.cos(currentAngle);
            const y2 = centerY + radius * Math.sin(currentAngle);

            const largeArc = sliceAngle > Math.PI ? 1 : 0;

            const pathData = [
                `M ${centerX} ${centerY}`,
                `L ${x1} ${y1}`,
                `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
                'Z'
            ].join(' ');

            svg += `<path d="${pathData}" fill="${colors[index]}" stroke="#fff" stroke-width="2"/>`;
        });

        svg += `</svg>`;

        container.innerHTML = svg;
    },

    /**
     * Create language list with progress bars
     */
    createLanguageList(languages) {
        const container = document.getElementById('languagesList');
        if (!container) return;

        const total = Object.values(languages).reduce((sum, val) => sum + val, 0);
        const sortedLanguages = Object.entries(languages)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8);

        const colors = [
            '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981',
            '#06b6d4', '#6366f1', '#f97316'
        ];

        let html = '';

        sortedLanguages.forEach((lang, index) => {
            const percentage = ((lang[1] / total) * 100).toFixed(1);
            const color = colors[index];

            html += `
                <div class="language-item list-item">
                    <div style="display: flex; align-items: center; gap: 12px; flex: 1;">
                        <div style="width: 12px; height: 12px; border-radius: 3px; background-color: ${color};"></div>
                        <span style="font-weight: 600; min-width: 100px;">${lang[0]}</span>
                    </div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <div class="language-bar" style="flex: 1; min-width: 80px;">
                            <div class="language-progress chart-bar" style="width: ${percentage}%; background-color: ${color};"></div>
                        </div>
                        <span style="font-size: 0.9rem; color: var(--text-secondary); min-width: 45px; text-align: right;">${percentage}%</span>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;

        // Animate progress bars
        setTimeout(() => {
            const progressBars = container.querySelectorAll('.language-progress');
            progressBars.forEach((bar, index) => {
                setTimeout(() => {
                    bar.style.animation = 'none';
                    void bar.offsetWidth;
                    bar.style.animation = '';
                }, index * 50);
            });
        }, 100);
    },

    /**
     * Create repository cards
     */
    createRepositoryCards(repos) {
        const container = document.getElementById('reposGrid');
        if (!container) return;

        let html = '';

        repos.forEach((repo, index) => {
            const lastUpdate = ChartRenderer.getRelativeTime(repo.updated_at);
            const language = repo.language || 'N/A';
            const stars = ChartRenderer.formatNumber(repo.stargazers_count);

            html += `
                <div class="repo-card grid-item" style="animation-delay: ${index * 0.1}s;">
                    <div class="repo-name">📦 ${repo.name}</div>
                    <p class="repo-description" style="margin-bottom: 12px; color: var(--text-secondary);">
                        ${repo.description || 'No description available'}
                    </p>
                    <div class="repo-meta">
                        <span>⭐ ${stars}</span>
                        <span>${lastUpdate}</span>
                    </div>
                    <div style="margin-bottom: 12px;">
                        <span class="repo-language">${language}</span>
                    </div>
                    <a href="${repo.html_url}" target="_blank" class="repo-link">View Repository →</a>
                </div>
            `;
        });

        container.innerHTML = html;
    },

    /**
     * Format number with commas
     */
    formatNumber(num) {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    },

    /**
     * Get relative time string
     */
    getRelativeTime(date) {
        const seconds = Math.floor((new Date() - new Date(date)) / 1000);
        let interval = seconds / 31536000;

        if (interval > 1) return `${Math.floor(interval)}y ago`;
        interval = seconds / 2592000;
        if (interval > 1) return `${Math.floor(interval)}m ago`;
        interval = seconds / 86400;
        if (interval > 1) return `${Math.floor(interval)}d ago`;
        interval = seconds / 3600;
        if (interval > 1) return `${Math.floor(interval)}h ago`;
        interval = seconds / 60;
        if (interval > 1) return `${Math.floor(interval)}min ago`;
        return 'just now';
    }
};

// Export for global access
window.ChartRenderer = ChartRenderer;
