// GitHub API Configuration
const GITHUB_USER = 'Just-Me-22';
const API_BASE = 'https://api.github.com';

// Cache for GitHub data
const cache = {
    profile: null,
    repos: null,
    events: null,
    languages: null,
    timestamp: 0
};

// Cache duration in milliseconds (1 hour)
const CACHE_DURATION = 60 * 60 * 1000;

/**
 * Fetch data from GitHub API with caching
 */
async function fetchFromGitHub(endpoint, useCache = true) {
    try {
        // Check cache
        if (useCache && cache.timestamp && Date.now() - cache.timestamp < CACHE_DURATION) {
            const cachedKey = endpoint.split('/').pop();
            if (cache[cachedKey]) {
                console.log(`Using cached data for ${endpoint}`);
                return cache[cachedKey];
            }
        }

        const response = await fetch(`${API_BASE}${endpoint}`);

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.status}`);
        }

        const data = await response.json();

        // Update cache
        const cacheKey = endpoint.split('/').pop();
        cache[cacheKey] = data;
        cache.timestamp = Date.now();

        return data;
    } catch (error) {
        console.error('Error fetching from GitHub API:', error);
        throw error;
    }
}

/**
 * Fetch user profile data
 */
async function fetchUserProfile() {
    try {
        const profile = await fetchFromGitHub(`/users/${GITHUB_USER}`);
        return profile;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
}

/**
 * Fetch all repositories
 */
async function fetchRepositories() {
    try {
        const repos = await fetchFromGitHub(`/users/${GITHUB_USER}/repos?per_page=100&sort=stars&order=desc`);
        return repos;
    } catch (error) {
        console.error('Error fetching repositories:', error);
        return [];
    }
}

/**
 * Fetch recent events/activity
 */
async function fetchRecentEvents() {
    try {
        const events = await fetchFromGitHub(`/users/${GITHUB_USER}/events/public?per_page=30`, false);
        return events;
    } catch (error) {
        console.error('Error fetching events:', error);
        return [];
    }
}

/**
 * Calculate total stars across all repositories
 */
function calculateTotalStars(repos) {
    return repos.reduce((total, repo) => total + repo.stargazers_count, 0);
}

/**
 * Aggregate languages from all repositories
 */
function aggregateLanguages(repos) {
    const languages = {};

    repos.forEach(repo => {
        if (repo.language) {
            languages[repo.language] = (languages[repo.language] || 0) + 1;
        }
    });

    return languages;
}

/**
 * Get featured repositories (excluding forks)
 */
function getFeaturedRepositories(repos, featuredNames = ['Helium-Browser-Controller-Windows-', 'Seelen-UI']) {
    const featured = [];

    featuredNames.forEach(name => {
        const repo = repos.find(r => r.name === name || r.full_name.includes(name));
        if (repo) {
            featured.push(repo);
        }
    });

    // If not enough featured repos found, add top stars
    if (featured.length < 3) {
        const topRepos = repos
            .filter(r => !featured.includes(r) && !r.fork)
            .slice(0, 3 - featured.length);
        featured.push(...topRepos);
    }

    return featured;
}

/**
 * Count total contributions from events
 */
function countContributions(events) {
    const contributionTypes = {
        'PushEvent': 1,
        'PullRequestEvent': 5,
        'IssuesEvent': 3,
        'CreateEvent': 2,
        'DeleteEvent': 1,
        'PullRequestReviewEvent': 4,
    };

    let totalContributions = 0;

    events.forEach(event => {
        totalContributions += contributionTypes[event.type] || 1;
    });

    return totalContributions;
}

/**
 * Format number with commas
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get relative time string
 */
function getRelativeTime(date) {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    let interval = seconds / 31536000;

    if (interval > 1) return Math.floor(interval) + ' years ago';
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    return 'just now';
}

/**
 * Export functions for use in other scripts
 */
window.GitHubAPI = {
    fetchUserProfile,
    fetchRepositories,
    fetchRecentEvents,
    calculateTotalStars,
    aggregateLanguages,
    getFeaturedRepositories,
    countContributions,
    formatNumber,
    getRelativeTime
};
