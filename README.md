作者声明:
该开源项目基于Github copilot AI 辅助生成.
This open source project is based on Github copilot AI-assisted generation.

标签管理的编辑由用户自行添加和修改.
Editing of tag management is added and modified by the user.


# Tag Market · 标签超市

一个美观的标签管理和复制工具，支持多主题切换，支持中英文标签管理。

## 功能特点

- 三种主题切换：Dark-mode、Light-mode、Underblack
- 支持中英文标签搜索
- 标签分类管理
- 一键复制功能
- 响应式设计
- 标签提示功能

## 使用方法
1. 双击index.html文件在浏览器打开
2. 点击标签可以直接复制英文内容
3. 使用搜索框搜索中英文标签
4. 点击主题切换按钮切换不同主题
5. 使用分类按钮筛选不同类型的标签

## 配置说明

### 1. 编辑主分类

在 `index.html` 文件中，找到 `tagCategories` 对象，按以下格式添加或修改主分类：

```javascript
{
    anime: {  // 主分类的键名
        name: "作品",  // 显示的中文名称
        subcategories: [ /* 子分类数组 */ ]
    }
}
```

### 2. 编辑子分类

在主分类的 `subcategories` 数组中添加或修改子分类：

```javascript
subcategories: [
    {
        name: "原神",  // 子分类中文名称
        nameEn: "Genshin Impact",  // 子分类英文名称
        tags: [ /* 标签数组 */ ]
    }
]
```

### 3. 编辑标签

在子分类的 `tags` 数组中添加或修改标签：

```javascript
tags: [
    {
        en: "nahida_(genshin_impact)",  // 英文标签
        zh: "纳西妲"  // 中文说明
    }
]
```

### 完整示例

```javascript
const tagCategories = {
    anime: {
        name: "作品",
        subcategories: [
            {
                name: "原神",
                nameEn: "Genshin Impact",
                tags: [
                    { en: "nahida_(genshin_impact)", zh: "纳西妲" },
                    { en: "raiden_shogun", zh: "雷电将军" }
                ]
            }
        ]
    }
}
```

## 注意事项

1. 键名必须是唯一的，建议使用英文小写
2. 标签的英文部分要符合实际使用规范
3. 修改后需要刷新页面生效
4. 确保格式正确，注意逗号的使用

## 项目结构

```
tag-market/
│
├── index.html      # 主页面和标签数据
├── styles.css      # 样式文件
├── script.js       # 功能逻辑
└── README.md       # 说明文档
```

## 主题说明

- Dark-mode: 深色主题
- Light-mode: 棕色主题
- Underblack: 高对比度黑色主题

## 技术说明

- 纯原生 JavaScript
- 响应式 CSS
- 无需数据库
- 无需服务器
------------------------------------------------------
感谢使用!
