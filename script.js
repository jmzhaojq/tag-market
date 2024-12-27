// Remove the tagCategories definition since it's now in HTML

function showTooltip(e) {
    let tooltip = document.querySelector('.copy-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'copy-tooltip';
        document.body.appendChild(tooltip);
    }

    tooltip.textContent = '复制完成 | Copy Complete';
    tooltip.classList.add('show');

    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 1000);
}

function createTagElement(tag, category) {
    const div = document.createElement('div');
    div.className = 'tag';
    div.innerHTML = `
        <span class="tag-zh">${tag.zh}</span>
        <span class="tag-en">${tag.en}</span>
        <div class="tooltip">${tag.en} - ${tag.zh}</div>
    `;
    div.dataset.category = category;
    
    div.addEventListener('click', function(e) {
        navigator.clipboard.writeText(tag.en).then(() => {
            div.classList.add('copied');
            setTimeout(() => div.classList.remove('copied'), 500);
            showTooltip();
        });
    });
    
    return div;
}

function displayTags(filter = '') {
    const mainCategory = document.querySelector('.category-btn.active').dataset.category;
    const subCategory = document.querySelector('.subcategory-btn.active')?.dataset.subcategory;
    
    if (mainCategory === 'all') {
        // 显示所有标签
        const allTags = getAllTags();
        renderTags(allTags, filter);
    } else {
        // 显示特定分类的标签
        const subcategoryIndex = subCategory || 0;
        const tags = tagCategories[mainCategory].subcategories[subcategoryIndex].tags;
        renderTags(tags, filter);
    }
}

function renderTags(tags, filter = '') {
    const container = document.getElementById('tagContainer');
    const fragment = document.createDocumentFragment();
    
    // 如果有过滤条件，先过滤标签
    const filteredTags = filter ? 
        tags.filter(tag => 
            tag.en.toLowerCase().includes(filter.toLowerCase()) || 
            tag.zh.includes(filter)
        ) : tags;
    
    // 批量创建标签元素
    filteredTags.forEach(tag => {
        fragment.appendChild(createTagElement(tag));
    });
    
    // 一次性更新DOM
    container.innerHTML = '';
    container.appendChild(fragment);
}

function updateSubcategories(mainCategory) {
    const subContainer = document.querySelector('.subcategory-filter');
    
    if (mainCategory === 'all') {
        subContainer.innerHTML = '';
        return;
    }
    
    // 使用DocumentFragment优化DOM操作
    const fragment = document.createDocumentFragment();
    tagCategories[mainCategory].subcategories.forEach((sub, index) => {
        const btn = document.createElement('button');
        btn.className = 'subcategory-btn';
        btn.dataset.subcategory = index;
        btn.dataset.mainCategory = mainCategory;
        btn.innerHTML = `${sub.name}<br><span style="font-size: 0.8em; opacity: 0.8">${sub.nameEn}</span>`;
        fragment.appendChild(btn);
    });
    
    subContainer.innerHTML = '';
    subContainer.appendChild(fragment);
    
    // 自动选中第一个子分类
    const firstSubBtn = subContainer.firstElementChild;
    if (firstSubBtn) {
        firstSubBtn.classList.add('active');
    }
}

// 使用事件委托替代多个click事件监听器
document.querySelector('.subcategory-filter').addEventListener('click', (e) => {
    const btn = e.target.closest('.subcategory-btn');
    if (!btn) return;
    
    // 更新激活状态
    const activeBtn = btn.parentElement.querySelector('.active');
    if (activeBtn) activeBtn.classList.remove('active');
    btn.classList.add('active');
    
    // 获取并显示标签
    const mainCategory = btn.dataset.mainCategory;
    const subcategoryIndex = parseInt(btn.dataset.subcategory);
    const tags = tagCategories[mainCategory].subcategories[subcategoryIndex].tags;
    
    // 优化标签渲染
    renderTags(tags, document.getElementById('searchInput').value);
});

// 更新主分类点击事件
document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        updateSubcategories(e.target.dataset.category);
        displayTags(document.getElementById('searchInput').value);
    });
});

// 在文件开头添加这个函数
function getAllTags() {
    const allTags = [];
    Object.values(tagCategories).forEach(category => {
        category.subcategories.forEach(sub => {
            sub.tags.forEach(tag => {
                allTags.push(tag);
            });
        });
    });
    return allTags;
}

// 添加搜索建议功能
function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBox = searchInput.parentElement;
    let currentSuggestionIndex = -1;
    
    // 创建建议列表容器
    const suggestionsDiv = document.createElement('div');
    suggestionsDiv.className = 'search-suggestions';
    searchBox.appendChild(suggestionsDiv);

    function selectSuggestion(index) {
        const suggestions = suggestionsDiv.querySelectorAll('.suggestion-item');
        suggestions.forEach(s => s.classList.remove('selected'));
        if (index >= 0 && index < suggestions.length) {
            suggestions[index].classList.add('selected');
            currentSuggestionIndex = index;
        }
    }

    function handleKeyboardNavigation(e) {
        const suggestions = suggestionsDiv.querySelectorAll('.suggestion-item');
        if (!suggestions.length) return;

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectSuggestion(Math.min(currentSuggestionIndex + 1, suggestions.length - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectSuggestion(Math.max(currentSuggestionIndex - 1, 0));
                break;
            case 'Enter':
                e.preventDefault();
                if (currentSuggestionIndex >= 0) {
                    suggestions[currentSuggestionIndex].click();
                }
                break;
            case 'Escape':
                suggestionsDiv.style.display = 'none';
                currentSuggestionIndex = -1;
                break;
        }
    }

    searchInput.addEventListener('keydown', handleKeyboardNavigation);

    searchInput.addEventListener('input', (e) => {
        currentSuggestionIndex = -1;
        const searchText = e.target.value.toLowerCase();
        if (searchText.length < 1) {
            suggestionsDiv.style.display = 'none';
            return;
        }

        const allTags = getAllTags();
        const matchedTags = allTags.filter(tag => 
            tag.en.toLowerCase().includes(searchText) || 
            tag.zh.includes(searchText)
        ).slice(0, 10); // 限制显示前10个结果

        const matchedSubcategories = [];
        Object.entries(tagCategories).forEach(([key, category]) => {
            category.subcategories.forEach((sub, index) => {
                if (sub.name.toLowerCase().includes(searchText) || sub.nameEn.toLowerCase().includes(searchText)) {
                    matchedSubcategories.push({ key, index, name: sub.name, nameEn: sub.nameEn });
                }
            });
        });

        suggestionsDiv.innerHTML = '';
        
        if (matchedTags.length > 0 || matchedSubcategories.length > 0) {
            matchedTags.forEach(tag => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `
                    <span class="suggestion-zh">${tag.zh}</span>
                    <span class="suggestion-en">${tag.en}</span>
                `;
                div.addEventListener('click', (e) => {
                    // 先确保标签在当前视图中可见
                    const mainCategory = findTagCategory(tag);
                    if (mainCategory) {
                        // 切换到对应的主分类
                        const categoryBtn = document.querySelector(`[data-category="${mainCategory.key}"]`);
                        categoryBtn.click();
                        
                        // 找到对应的子分类
                        const subCategoryIndex = findTagSubcategoryIndex(tag, mainCategory.key);
                        if (subCategoryIndex !== -1) {
                            // 切换到对应的子分类
                            setTimeout(() => {
                                const subCategoryBtn = document.querySelector(`[data-subcategory="${subCategoryIndex}"]`);
                                if (subCategoryBtn) {
                                    subCategoryBtn.click();
                                }
                                
                                // 等待标签渲染完成后滚动到对应位置
                                setTimeout(() => {
                                    const tagElement = Array.from(document.getElementsByClassName('tag'))
                                        .find(el => el.querySelector('.tag-en').textContent === tag.en);
                                    
                                    if (tagElement) {
                                        tagElement.classList.add('copied');
                                        setTimeout(() => tagElement.classList.remove('copied'), 500);
                                        tagElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                        navigator.clipboard.writeText(tag.en);
                                        showTooltip(`已复制: ${tag.en}`, e.clientX, e.clientY);
                                    }
                                }, 100);
                            }, 100);
                        }
                    }
                    searchInput.value = '';
                    suggestionsDiv.style.display = 'none';
                });
                suggestionsDiv.appendChild(div);
            });

            matchedSubcategories.forEach(sub => {
                const div = document.createElement('div');
                div.className = 'suggestion-item';
                div.innerHTML = `
                    <span class="suggestion-zh">${sub.name}</span>
                    <span class="suggestion-en">${sub.nameEn}</span>
                `;
                div.addEventListener('click', (e) => {
                    // 切换到对应的主分类
                    const categoryBtn = document.querySelector(`[data-category="${sub.key}"]`);
                    categoryBtn.click();
                    
                    // 切换到对应的子分类
                    setTimeout(() => {
                        const subCategoryBtn = document.querySelector(`[data-subcategory="${sub.index}"]`);
                        if (subCategoryBtn) {
                            subCategoryBtn.click();
                        }
                    }, 100);

                    searchInput.value = '';
                    suggestionsDiv.style.display = 'none';
                });
                suggestionsDiv.appendChild(div);
            });

            suggestionsDiv.style.display = 'block';
        } else {
            suggestionsDiv.style.display = 'none';
        }
    });

    // 点击外部时隐藏建议列表
    document.addEventListener('click', (e) => {
        if (!searchBox.contains(e.target)) {
            suggestionsDiv.style.display = 'none';
        }
    });
}

// 添加这两个新的辅助函数
function findTagCategory(tag) {
    for (const [key, category] of Object.entries(tagCategories)) {
        for (const sub of category.subcategories) {
            if (sub.tags.some(t => t.en === tag.en)) {
                return { key, category };
            }
        }
    }
    return null;
}

function findTagSubcategoryIndex(tag, categoryKey) {
    const category = tagCategories[categoryKey];
    return category.subcategories.findIndex(sub => 
        sub.tags.some(t => t.en === tag.en)
    );
}

// 修改初始化显示部分
updateSubcategories('all');
// 删除 displayTags() 的调用，这样页面加载时不会显示任何标签
setupSearch(); // 添加这行

// Remove the addTagBtn event listener and related function
// document.getElementById('addTagBtn').addEventListener('click', () => {
//     const mainCategory = document.getElementById('mainCategory').value;
//     const subCategory = document.getElementById('subCategory').value;
//     const tagEn = document.getElementById('tagEn').value.trim();
//     const tagZh = document.getElementById('tagZh').value.trim();
// });

// Remove the populateCategorySelectors function
// function populateCategorySelectors() {
//     const mainCategorySelect = document.getElementById('mainCategory');
//     const subCategorySelect = document.getElementById('subCategory');
//     mainCategorySelect.innerHTML = '';
//     subCategorySelect.innerHTML = '';

//     Object.keys(tagCategories).forEach(category => {
//         const option = document.createElement('option');
//         option.value = category;
//         option.textContent = tagCategories[category].name;
//         mainCategorySelect.appendChild(option);
//     });

//     mainCategorySelect.addEventListener('change', () => {
//         const selectedCategory = mainCategorySelect.value;
//         subCategorySelect.innerHTML = '';
//         tagCategories[selectedCategory].subcategories.forEach((sub, index) => {
//             const option = document.createElement('option');
//             option.value = index;
//             option.textContent = sub.name;
//             subCategorySelect.appendChild(option);
//         });
//     });

//     mainCategorySelect.dispatchEvent(new Event('change'));
// }

// 修改切换模式的功能
function toggleTheme(e) {
    e.preventDefault();
    const themes = ['Dark-mode', 'light-mode', 'underblack'];
    const currentTheme = document.body.classList[0];
    const currentIndex = themes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % themes.length;
    const nextTheme = themes[nextIndex];

    document.body.classList.remove(...themes);
    document.body.classList.add(nextTheme);
    localStorage.setItem('theme', nextTheme);

    // Update icon
    const icon = e.currentTarget.querySelector('i');
    if (nextTheme === 'Dark-mode') {
        icon.className = 'fas fa-moon';
    } else if (nextTheme === 'light-mode') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-star';
    }
}

// 检查本地存储中的暗色模式设置并应用
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'Dark-mode';
    document.body.classList.add(savedTheme);

    const toggleButton = document.getElementById('toggleDarkMode');
    const icon = toggleButton.querySelector('i');
    if (savedTheme === 'Dark-mode') {
        icon.className = 'fas fa-moon';
    } else if (savedTheme === 'light-mode') {
        icon.className = 'fas fa-sun';
    } else {
        icon.className = 'fas fa-star';
    }

    toggleButton.addEventListener('click', toggleTheme);
}

// 在页面加载时初始化暗色模式
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupSearch();
});
