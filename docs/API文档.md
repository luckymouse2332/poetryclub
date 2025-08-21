# 📚 回中诗社 - API 接口文档

## 1. 接口概述

### 1.1 基本信息

- **API 版本**：v1.0
- **基础 URL**：`http://localhost:3000/api`
- **数据格式**：JSON
- **字符编码**：UTF-8
- **认证方式**：JWT Bearer Token

### 1.2 通用响应格式

#### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

#### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  }
}
```

### 1.3 状态码说明

| 状态码 | 说明 | 描述 |
|--------|------|------|
| 200 | OK | 请求成功 |
| 201 | Created | 资源创建成功 |
| 400 | Bad Request | 请求参数错误 |
| 401 | Unauthorized | 未授权访问 |
| 403 | Forbidden | 权限不足 |
| 404 | Not Found | 资源不存在 |
| 409 | Conflict | 资源冲突 |
| 422 | Unprocessable Entity | 数据验证失败 |
| 500 | Internal Server Error | 服务器内部错误 |

## 2. 认证接口

### 2.1 用户注册

**接口地址**：`POST /api/auth/register`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| username | string | 是 | 用户名（3-20字符） | "poetlover" |
| email | string | 是 | 邮箱地址 | "user@example.com" |
| password | string | 是 | 密码（8-50字符） | "password123" |
| bio | string | 否 | 个人简介（最多200字符） | "热爱诗歌的学生" |

**请求示例**：
```json
{
  "username": "poetlover",
  "email": "user@example.com",
  "password": "password123",
  "bio": "热爱诗歌的学生"
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "poetlover",
      "email": "user@example.com",
      "bio": "热爱诗歌的学生",
      "role": "User",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  },
  "message": "注册成功"
}
```

### 2.2 用户登录

**接口地址**：`POST /api/auth/login`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| email | string | 是 | 邮箱地址 | "user@example.com" |
| password | string | 是 | 密码 | "password123" |

**请求示例**：
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-string",
      "username": "poetlover",
      "email": "user@example.com",
      "bio": "热爱诗歌的学生",
      "role": "User"
    },
    "tokens": {
      "accessToken": "jwt-access-token",
      "refreshToken": "jwt-refresh-token"
    }
  },
  "message": "登录成功"
}
```

### 2.3 刷新令牌

**接口地址**：`POST /api/auth/refresh`

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| refreshToken | string | 是 | 刷新令牌 | "jwt-refresh-token" |

**请求示例**：
```json
{
  "refreshToken": "jwt-refresh-token"
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-access-token",
    "refreshToken": "new-jwt-refresh-token"
  },
  "message": "令牌刷新成功"
}
```

## 3. 用户接口

### 3.1 获取用户资料

**接口地址**：`GET /api/users/profile`

**认证要求**：需要 Bearer Token

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "username": "poetlover",
    "email": "user@example.com",
    "bio": "热爱诗歌的学生",
    "avatarUrl": "https://example.com/avatar.jpg",
    "role": "User",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

### 3.2 更新用户资料

**接口地址**：`PUT /api/users/profile`

**认证要求**：需要 Bearer Token

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| username | string | 否 | 用户名（3-20字符） | "newusername" |
| bio | string | 否 | 个人简介（最多200字符） | "更新的个人简介" |
| avatarUrl | string | 否 | 头像URL | "https://example.com/new-avatar.jpg" |

**请求示例**：
```json
{
  "username": "newusername",
  "bio": "更新的个人简介",
  "avatarUrl": "https://example.com/new-avatar.jpg"
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "username": "newusername",
    "email": "user@example.com",
    "bio": "更新的个人简介",
    "avatarUrl": "https://example.com/new-avatar.jpg",
    "role": "User",
    "updatedAt": "2025-01-01T01:00:00.000Z"
  },
  "message": "资料更新成功"
}
```

### 3.3 获取用户信息

**接口地址**：`GET /api/users/:id`

**路径参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 用户ID | "uuid-string" |

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "username": "poetlover",
    "bio": "热爱诗歌的学生",
    "avatarUrl": "https://example.com/avatar.jpg",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "poemsCount": 15,
    "likesCount": 128
  }
}
```

## 4. 诗歌接口

### 4.1 获取诗歌列表

**接口地址**：`GET /api/poems`

**查询参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| page | number | 否 | 页码（默认1） | 1 |
| limit | number | 否 | 每页数量（默认10，最大50） | 10 |
| sort | string | 否 | 排序方式（latest/popular） | "latest" |
| author | string | 否 | 作者筛选 | "poetlover" |
| tag | string | 否 | 标签筛选 | "爱情" |
| search | string | 否 | 搜索关键词 | "春天" |

**响应示例**：
```json
{
  "success": true,
  "data": {
    "poems": [
      {
        "id": "uuid-string",
        "title": "春日吟",
        "content": "春风十里不如你...",
        "author": "poetlover",
        "tags": ["春天", "爱情"],
        "createdAt": "2025-01-01T00:00:00.000Z",
        "likesCount": 25,
        "commentsCount": 8,
        "isLiked": false
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 4.2 创建诗歌

**接口地址**：`POST /api/poems`

**认证要求**：需要 Bearer Token

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| title | string | 是 | 诗歌标题（1-100字符） | "春日吟" |
| content | string | 是 | 诗歌内容（1-5000字符） | "春风十里不如你..." |
| tags | string[] | 否 | 标签数组（最多10个） | ["春天", "爱情"] |

**请求示例**：
```json
{
  "title": "春日吟",
  "content": "春风十里不如你，\n桃花朵朵开满枝。\n若问相思何处寄，\n唯有诗词表我心。",
  "tags": ["春天", "爱情"]
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "春日吟",
    "content": "春风十里不如你，\n桃花朵朵开满枝。\n若问相思何处寄，\n唯有诗词表我心。",
    "author": "poetlover",
    "tags": ["春天", "爱情"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  },
  "message": "诗歌创建成功"
}
```

### 4.3 获取诗歌详情

**接口地址**：`GET /api/poems/:id`

**路径参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 诗歌ID | "uuid-string" |

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "春日吟",
    "content": "春风十里不如你，\n桃花朵朵开满枝。\n若问相思何处寄，\n唯有诗词表我心。",
    "author": "poetlover",
    "tags": ["春天", "爱情"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z",
    "likesCount": 25,
    "commentsCount": 8,
    "isLiked": false,
    "authorInfo": {
      "id": "author-uuid",
      "username": "poetlover",
      "avatarUrl": "https://example.com/avatar.jpg"
    }
  }
}
```

### 4.4 更新诗歌

**接口地址**：`PUT /api/poems/:id`

**认证要求**：需要 Bearer Token（仅作者可操作）

**路径参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 诗歌ID | "uuid-string" |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| title | string | 否 | 诗歌标题（1-100字符） | "春日吟（修订版）" |
| content | string | 否 | 诗歌内容（1-5000字符） | "更新的诗歌内容..." |
| tags | string[] | 否 | 标签数组（最多10个） | ["春天", "爱情", "思念"] |

**请求示例**：
```json
{
  "title": "春日吟（修订版）",
  "content": "春风十里不如你，\n桃花朵朵开满枝。\n若问相思何处寄，\n唯有诗词表我心。\n\n（修订：增加了新的诗句）",
  "tags": ["春天", "爱情", "思念"]
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "title": "春日吟（修订版）",
    "content": "春风十里不如你，\n桃花朵朵开满枝。\n若问相思何处寄，\n唯有诗词表我心。\n\n（修订：增加了新的诗句）",
    "author": "poetlover",
    "tags": ["春天", "爱情", "思念"],
    "updatedAt": "2025-01-01T01:00:00.000Z"
  },
  "message": "诗歌更新成功"
}
```

### 4.5 删除诗歌

**接口地址**：`DELETE /api/poems/:id`

**认证要求**：需要 Bearer Token（仅作者可操作）

**路径参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 诗歌ID | "uuid-string" |

**响应示例**：
```json
{
  "success": true,
  "message": "诗歌删除成功"
}
```

### 4.6 点赞诗歌

**接口地址**：`POST /api/poems/:id/like`

**认证要求**：需要 Bearer Token

**路径参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 诗歌ID | "uuid-string" |

**响应示例**：
```json
{
  "success": true,
  "data": {
    "isLiked": true,
    "likesCount": 26
  },
  "message": "点赞成功"
}
```

### 4.7 取消点赞

**接口地址**：`DELETE /api/poems/:id/like`

**认证要求**：需要 Bearer Token

**路径参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 诗歌ID | "uuid-string" |

**响应示例**：
```json
{
  "success": true,
  "data": {
    "isLiked": false,
    "likesCount": 25
  },
  "message": "取消点赞成功"
}
```

## 5. 评论接口

### 5.1 获取评论列表

**接口地址**：`GET /api/poems/:id/comments`

**路径参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 诗歌ID | "uuid-string" |

**查询参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| page | number | 否 | 页码（默认1） | 1 |
| limit | number | 否 | 每页数量（默认10，最大50） | 10 |

**响应示例**：
```json
{
  "success": true,
  "data": {
    "comments": [
      {
        "id": "uuid-string",
        "content": "写得真好，很有意境！",
        "createdAt": "2025-01-01T00:00:00.000Z",
        "user": {
          "id": "user-uuid",
          "username": "reader123",
          "avatarUrl": "https://example.com/avatar2.jpg"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 8,
      "totalPages": 1
    }
  }
}
```

### 5.2 添加评论

**接口地址**：`POST /api/poems/:id/comments`

**认证要求**：需要 Bearer Token

**路径参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| id | string | 是 | 诗歌ID | "uuid-string" |

**请求参数**：

| 参数名 | 类型 | 必填 | 描述 | 示例 |
|--------|------|------|------|------|
| content | string | 是 | 评论内容（1-500字符） | "写得真好，很有意境！" |

**请求示例**：
```json
{
  "content": "写得真好，很有意境！"
}
```

**响应示例**：
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "content": "写得真好，很有意境！",
    "createdAt": "2025-01-01T00:00:00.000Z",
    "user": {
      "id": "user-uuid",
      "username": "reader123",
      "avatarUrl": "https://example.com/avatar2.jpg"
    }
  },
  "message": "评论添加成功"
}
```

## 6. 健康检查接口

### 6.1 健康检查

**接口地址**：`GET /api/health`

**响应示例**：
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2025-01-01T00:00:00.000Z",
    "uptime": 3600,
    "version": "1.0.0",
    "database": "connected",
    "redis": "connected"
  }
}
```

## 7. 错误码说明

### 7.1 认证相关错误

| 错误码 | HTTP状态码 | 描述 | 解决方案 |
|--------|------------|------|----------|
| AUTH_001 | 401 | 令牌无效或已过期 | 重新登录获取新令牌 |
| AUTH_002 | 401 | 令牌格式错误 | 检查 Authorization 头格式 |
| AUTH_003 | 403 | 权限不足 | 联系管理员获取权限 |
| AUTH_004 | 409 | 用户名已存在 | 使用其他用户名 |
| AUTH_005 | 409 | 邮箱已注册 | 使用其他邮箱或找回密码 |
| AUTH_006 | 400 | 密码格式不正确 | 密码需8-50字符 |

### 7.2 数据验证错误

| 错误码 | HTTP状态码 | 描述 | 解决方案 |
|--------|------------|------|----------|
| VALID_001 | 422 | 必填字段缺失 | 检查请求参数 |
| VALID_002 | 422 | 字段长度超限 | 减少字段内容长度 |
| VALID_003 | 422 | 字段格式错误 | 检查字段格式要求 |
| VALID_004 | 422 | 邮箱格式错误 | 使用正确的邮箱格式 |

### 7.3 资源相关错误

| 错误码 | HTTP状态码 | 描述 | 解决方案 |
|--------|------------|------|----------|
| RESOURCE_001 | 404 | 用户不存在 | 检查用户ID是否正确 |
| RESOURCE_002 | 404 | 诗歌不存在 | 检查诗歌ID是否正确 |
| RESOURCE_003 | 403 | 无权操作此资源 | 只能操作自己的资源 |
| RESOURCE_004 | 409 | 重复点赞 | 用户已点赞此诗歌 |

## 8. 使用示例

### 8.1 完整的用户注册登录流程

```javascript
// 1. 用户注册
const registerResponse = await fetch('/api/auth/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: 'poetlover',
    email: 'user@example.com',
    password: 'password123',
    bio: '热爱诗歌的学生'
  })
});

const registerData = await registerResponse.json();
const { accessToken, refreshToken } = registerData.data.tokens;

// 2. 使用令牌访问受保护的接口
const profileResponse = await fetch('/api/users/profile', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const profileData = await profileResponse.json();
console.log('用户资料:', profileData.data);
```

### 8.2 创建和获取诗歌

```javascript
// 1. 创建诗歌
const createPoemResponse = await fetch('/api/poems', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  },
  body: JSON.stringify({
    title: '春日吟',
    content: '春风十里不如你，\n桃花朵朵开满枝。',
    tags: ['春天', '爱情']
  })
});

const poemData = await createPoemResponse.json();
const poemId = poemData.data.id;

// 2. 获取诗歌列表
const poemsResponse = await fetch('/api/poems?page=1&limit=10&sort=latest');
const poemsData = await poemsResponse.json();
console.log('诗歌列表:', poemsData.data.poems);

// 3. 点赞诗歌
const likeResponse = await fetch(`/api/poems/${poemId}/like`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
});

const likeData = await likeResponse.json();
console.log('点赞结果:', likeData.data);
```

## 9. SDK 和工具

### 9.1 JavaScript/TypeScript SDK

```typescript
class PoetryClubAPI {
  private baseURL: string;
  private accessToken?: string;

  constructor(baseURL: string = 'http://localhost:3000/api') {
    this.baseURL = baseURL;
  }

  setAccessToken(token: string) {
    this.accessToken = token;
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    return response.json();
  }

  // 认证相关
  async register(userData: RegisterData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  async login(credentials: LoginData) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  }

  // 诗歌相关
  async getPoems(params?: GetPoemsParams) {
    const query = new URLSearchParams(params as any).toString();
    return this.request(`/poems?${query}`);
  }

  async createPoem(poemData: CreatePoemData) {
    return this.request('/poems', {
      method: 'POST',
      body: JSON.stringify(poemData)
    });
  }

  async likePoem(poemId: string) {
    return this.request(`/poems/${poemId}/like`, {
      method: 'POST'
    });
  }
}

// 使用示例
const api = new PoetryClubAPI();

// 登录
const loginResult = await api.login({
  email: 'user@example.com',
  password: 'password123'
});

api.setAccessToken(loginResult.data.tokens.accessToken);

// 创建诗歌
const poem = await api.createPoem({
  title: '春日吟',
  content: '春风十里不如你',
  tags: ['春天']
});
```

### 9.2 Postman 集合

可以导入以下 Postman 集合来快速测试 API：

```json
{
  "info": {
    "name": "Poetry Club API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api"
    },
    {
      "key": "accessToken",
      "value": ""
    }
  ],
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register",
          "request": {
            "method": "POST",
            "header": [],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"username\": \"testuser\",\n  \"email\": \"test@example.com\",\n  \"password\": \"password123\"\n}",
              "options": {
                "raw": {
                  "language": "json"
                }
              }
            },
            "url": {
              "raw": "{{baseUrl}}/auth/register",
              "host": ["{{baseUrl}}"],
              "path": ["auth", "register"]
            }
          }
        }
      ]
    }
  ]
}
```

---

*本文档版本：v1.0*  
*最后更新：2025年1月*  
*API 版本：v1.0*