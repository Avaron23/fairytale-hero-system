const API_BASE = '/heroes';

// Данные состояния
let allCharacters = [];
let allTraits = [];

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    loadAllHeroes();
    setupFormHandlers();
});

// ==================== Навигация ====================
function initNavigation() {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const pageName = btn.dataset.page;
            goToPage(pageName);
        });
    });
}

function goToPage(pageName) {
    // Скрыть все страницы
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });

    // Показать нужную страницу
    const page = document.getElementById(`${pageName}-page`);
    if (page) {
        page.classList.add('active');
    }

    // Обновить кнопки навигации
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === pageName) {
            btn.classList.add('active');
        }
    });
}

// ==================== Загрузка данных ====================
async function loadAllHeroes() {
    try {
        // Используем POST /choice с пустыми фильтрами для получения всех героев
        const response = await fetch(`${API_BASE}/choice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                gender: null,
                height: null,
                age: null,
                character: null,
                traits: null
            })
        });
        
        if (response.ok) {
            const heroes = await response.json();
            displayHeroes(heroes, 'heroes-grid');
            
            // Заполнить списки для подсказок
            heroes.forEach(hero => {
                hero.character?.forEach(ch => {
                    if (!allCharacters.includes(ch)) allCharacters.push(ch);
                });
                hero.traits?.forEach(tr => {
                    if (!allTraits.includes(tr)) allTraits.push(tr);
                });
            });
            
            allCharacters.sort();
            allTraits.sort();
        } else {
            document.getElementById('heroes-grid').innerHTML = '<div class="loading">Ошибка загрузки</div>';
        }
    } catch (error) {
        console.error('Ошибка при загрузке героев:', error);
        document.getElementById('heroes-grid').innerHTML = '<div class="loading">Ошибка подключения</div>';
    }
}

// ==================== Отображение героев ====================
function displayHeroes(heroes, containerId) {
    const container = document.getElementById(containerId);
    
    if (heroes.length === 0) {
        container.innerHTML = '<div class="loading">Героев не найдено</div>';
        return;
    }

    container.innerHTML = heroes.map(hero => createHeroCard(hero)).join('');
}

function createHeroCard(hero) {
    const characterTags = (hero.character || [])
        .map(char => `<span class="tag character">${escapeHtml(char)}</span>`)
        .join('');
    
    const traitsTags = (hero.traits || [])
        .map(trait => `<span class="tag trait">${escapeHtml(trait)}</span>`)
        .join('');

    return `
        <div class="hero-card">
            <h3>⚔️ ${escapeHtml(hero.name)}</h3>
            <div class="hero-info">
                <div class="hero-info-item">
                    <span class="hero-info-label">Пол:</span>
                    <span class="hero-info-value">${escapeHtml(hero.gender)}</span>
                </div>
                <div class="hero-info-item">
                    <span class="hero-info-label">Рост:</span>
                    <span class="hero-info-value">${escapeHtml(hero.height)}</span>
                </div>
                <div class="hero-info-item">
                    <span class="hero-info-label">Возраст:</span>
                    <span class="hero-info-value">${escapeHtml(hero.age)}</span>
                </div>
            </div>
            <div class="hero-tags">
                ${characterTags}
                ${traitsTags}
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ==================== Работа с тегами ====================
class TagManager {
    constructor(inputId, tagsContainerId, suggestionsId, dataList, type = 'character') {
        this.inputId = inputId;
        this.tagsContainerId = tagsContainerId;
        this.suggestionsId = suggestionsId;
        this.dataList = dataList;
        this.type = type;
        this.tags = [];
        this.highlightedIndex = -1;

        this.input = document.getElementById(inputId);
        this.tagsContainer = document.getElementById(tagsContainerId);
        this.suggestionsList = document.getElementById(suggestionsId);

        this.init();
    }

    init() {
        this.input.addEventListener('input', (e) => this.handleInput(e));
        this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
        document.addEventListener('click', (e) => this.handleClickOutside(e));
    }

    handleInput(e) {
        const value = e.target.value.trim().toLowerCase();
        
        if (value.length === 0) {
            this.suggestionsList.classList.remove('active');
            return;
        }

        const filtered = this.dataList.filter(item => 
            item.toLowerCase().includes(value) && 
            !this.tags.includes(item)
        );

        if (filtered.length > 0) {
            this.showSuggestions(filtered);
        } else {
            this.suggestionsList.classList.remove('active');
        }

        this.highlightedIndex = -1;
    }

    handleKeydown(e) {
        const items = this.suggestionsList.querySelectorAll('li');

        switch (e.key) {
            case 'Enter':
                e.preventDefault();
                if (this.highlightedIndex >= 0 && items[this.highlightedIndex]) {
                    this.addTag(items[this.highlightedIndex].textContent);
                } else if (this.input.value.trim()) {
                    this.addTag(this.input.value.trim());
                }
                break;
            case 'ArrowDown':
                e.preventDefault();
                this.highlightedIndex = Math.min(this.highlightedIndex + 1, items.length - 1);
                this.updateHighlight(items);
                break;
            case 'ArrowUp':
                e.preventDefault();
                this.highlightedIndex = Math.max(this.highlightedIndex - 1, -1);
                this.updateHighlight(items);
                break;
            case 'Escape':
                this.suggestionsList.classList.remove('active');
                break;
        }
    }

    updateHighlight(items) {
        items.forEach((item, index) => {
            if (index === this.highlightedIndex) {
                item.classList.add('highlighted');
            } else {
                item.classList.remove('highlighted');
            }
        });
    }

    showSuggestions(suggestions) {
        this.suggestionsList.innerHTML = suggestions.map(suggestion => `
            <li>${escapeHtml(suggestion)}</li>
        `).join('');

        this.suggestionsList.querySelectorAll('li').forEach(item => {
            item.addEventListener('click', () => {
                this.addTag(item.textContent);
            });
        });

        this.suggestionsList.classList.add('active');
    }

    addTag(value) {
        value = value.trim();
        if (!value || this.tags.includes(value)) {
            return;
        }

        this.tags.push(value);
        this.input.value = '';
        this.suggestionsList.classList.remove('active');
        this.renderTags();
    }

    removeTag(value) {
        this.tags = this.tags.filter(tag => tag !== value);
        this.renderTags();
    }

    renderTags() {
        this.tagsContainer.innerHTML = this.tags.map(tag => `
            <div class="tag-item ${this.type}">
                <span>${escapeHtml(tag)}</span>
                <span class="tag-remove" data-tag="${escapeHtml(tag)}">✕</span>
            </div>
        `).join('');

        this.tagsContainer.querySelectorAll('.tag-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                this.removeTag(btn.dataset.tag);
            });
        });
    }

    getTags() {
        return this.tags;
    }

    clear() {
        this.tags = [];
        this.input.value = '';
        this.renderTags();
        this.suggestionsList.classList.remove('active');
    }

    handleClickOutside(e) {
        if (!e.target.closest(`#${this.inputId}`) && !e.target.closest(`#${this.suggestionsId}`)) {
            this.suggestionsList.classList.remove('active');
        }
    }
}

// ==================== Работа с формами ====================
let characterManager;
let traitsManager;
let searchCharacterManager;
let searchTraitsManager;

function setupFormHandlers() {
    // Инициализация менеджеров тегов для добавления
    setTimeout(() => {
        characterManager = new TagManager(
            'character-input',
            'character-tags',
            'character-suggestions',
            allCharacters,
            'character'
        );

        traitsManager = new TagManager(
            'traits-input',
            'traits-tags',
            'traits-suggestions',
            allTraits,
            'trait'
        );

        // Инициализация менеджеров тегов для поиска
        searchCharacterManager = new TagManager(
            'search-character-input',
            'search-character-tags',
            'search-character-suggestions',
            allCharacters,
            'character'
        );

        searchTraitsManager = new TagManager(
            'search-traits-input',
            'search-traits-tags',
            'search-traits-suggestions',
            allTraits,
            'trait'
        );
    }, 100);

    // Отправка формы добавления
    document.getElementById('add-hero-form').addEventListener('submit', handleAddHero);

    // Отправка формы поиска
    document.getElementById('search-form').addEventListener('submit', handleSearch);
    document.getElementById('clear-search').addEventListener('click', handleClearSearch);
}

async function handleAddHero(e) {
    e.preventDefault();

    const form = e.target;
    const messageDiv = document.getElementById('add-message');
    messageDiv.innerHTML = '';
    messageDiv.classList.remove('success', 'error');

    const heroData = {
        name: document.getElementById('name').value,
        gender: document.getElementById('gender').value,
        height: document.getElementById('height').value,
        age: document.getElementById('age').value,
        character: characterManager.getTags(),
        traits: traitsManager.getTags()
    };

    // Валидация
    if (!heroData.character.length) {
        showMessage('Добавьте хотя бы один характер', 'error', messageDiv);
        return;
    }

    if (!heroData.traits.length) {
        showMessage('Добавьте хотя бы один трейт', 'error', messageDiv);
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/add`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(heroData)
        });

        if (response.ok) {
            showMessage('✅ Герой успешно добавлен!', 'success', messageDiv);
            form.reset();
            characterManager.clear();
            traitsManager.clear();
            
            // Перезагрузить героев
            setTimeout(() => {
                loadAllHeroes();
            }, 1500);
        } else {
            const error = await response.json();
            showMessage('❌ Ошибка: ' + (error.detail || 'Не удалось добавить героя'), 'error', messageDiv);
        }
    } catch (error) {
        console.error('Ошибка при добавлении героя:', error);
        showMessage('❌ Ошибка подключения', 'error', messageDiv);
    }
}

async function handleSearch(e) {
    e.preventDefault();

    const filterData = {
        gender: document.getElementById('search-gender').value || null,
        height: document.getElementById('search-height').value || null,
        age: document.getElementById('search-age').value || null,
        character: searchCharacterManager.getTags().length > 0 ? searchCharacterManager.getTags() : null,
        traits: searchTraitsManager.getTags().length > 0 ? searchTraitsManager.getTags() : null
    };

    try {
        const response = await fetch(`${API_BASE}/choice`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(filterData)
        });

        if (response.ok) {
            const heroes = await response.json();
            displayHeroes(heroes, 'search-results');
        } else {
            console.error('Ошибка при поиске');
        }
    } catch (error) {
        console.error('Ошибка при поиске:', error);
    }
}

function handleClearSearch() {
    document.getElementById('search-form').reset();
    document.getElementById('search-results').innerHTML = '';
    searchCharacterManager.clear();
    searchTraitsManager.clear();
}

function showMessage(text, type, container) {
    container.textContent = text;
    container.className = `message ${type}`;
    
    if (type === 'success') {
        setTimeout(() => {
            container.classList.remove('success');
        }, 3000);
    }
}
