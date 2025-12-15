# 人力资源管理系统

一个基于 Node.js 和 SQLite 的完整人力资源管理系统，提供部门管理、岗位管理、员工管理、试用期管理、岗位调动、离职管理和报表统计等功能。

## 功能特性

### 1. 部门管理
- 添加、编辑、删除部门
- 查看部门列表及详情

### 2. 岗位管理
- 添加、编辑、删除岗位
- 岗位与部门关联

### 3. 员工管理
- 添加、编辑、删除员工信息
- 员工与部门、岗位关联
- 员工状态跟踪（在职、试用期、离职）

### 4. 试用期管理
- 记录员工试用期信息
- 试用期状态管理（进行中、已完成、已终止）

### 5. 岗位调动管理
- 记录员工岗位调动历史
- 自动更新员工当前部门和岗位

### 6. 离职管理
- 记录员工离职信息
- 自动更新员工状态

### 7. 报表统计
- 新聘员工报表
- 离职员工报表
- 岗位调动报表

## 技术栈

- **后端**: Node.js + Express.js
- **数据库**: SQLite
- **前端**: HTML + Bootstrap 5 + 原生 JavaScript
- **API**: RESTful API

## 系统要求

- Node.js (版本 12+)
- npm (通常随 Node.js 一起安装)

## 安装步骤

1. 克隆或下载本项目到本地
2. 进入项目根目录
3. 安装依赖包：
   ```bash
   npm install
   ```

## 运行系统

1. 启动服务器：
   ```bash
   npm start
   ```
   
2. 打开浏览器访问：http://localhost:3000

3. 要停止服务器，请在终端按 `Ctrl + C`

## 项目结构

```
.
├── server.js              # 后端服务器入口文件
├── package.json           # 项目配置和依赖
├── hr_system.db           # SQLite 数据库文件（运行时自动生成）
├── public/                # 前端静态资源目录
│   ├── index.html         # 主页面
│   ├── css/
│   │   └── style.css      # 自定义样式
│   └── js/
│       └── main.js        # 前端JavaScript逻辑
├── README.md              # 项目说明文档
└── AGENT.md               # AI助手专用说明文档
```

## 数据库设计

系统使用 SQLite 数据库，包含以下数据表：

1. **departments** (部门表)
2. **positions** (岗位表)
3. **employees** (员工表)
4. **probation_periods** (试用期表)
5. **position_transfers** (岗位调动表)
6. **resignations** (离职记录表)

## API 接口

### 部门管理
- `GET /api/departments` - 获取所有部门
- `POST /api/departments` - 添加部门
- `PUT /api/departments/:id` - 更新部门
- `DELETE /api/departments/:id` - 删除部门

### 岗位管理
- `GET /api/positions` - 获取所有岗位
- `POST /api/positions` - 添加岗位
- `PUT /api/positions/:id` - 更新岗位
- `DELETE /api/positions/:id` - 删除岗位

### 员工管理
- `GET /api/employees` - 获取所有员工
- `POST /api/employees` - 添加员工
- `PUT /api/employees/:id` - 更新员工
- `DELETE /api/employees/:id` - 删除员工

### 试用期管理
- `GET /api/probation-periods` - 获取所有试用期记录
- `POST /api/probation-periods` - 添加试用期记录
- `PUT /api/probation-periods/:id` - 更新试用期记录
- `DELETE /api/probation-periods/:id` - 删除试用期记录

### 岗位调动管理
- `GET /api/position-transfers` - 获取所有岗位调动记录
- `POST /api/position-transfers` - 添加岗位调动记录
- `DELETE /api/position-transfers/:id` - 删除岗位调动记录

### 离职管理
- `GET /api/resignations` - 获取所有离职记录
- `POST /api/resignations` - 添加离职记录
- `DELETE /api/resignations/:id` - 删除离职记录

### 报表统计
- `GET /api/reports/new-hires` - 新聘员工报表
- `GET /api/reports/resignations` - 离职员工报表
- `GET /api/reports/transfers` - 岗位调动报表

## 界面预览

系统采用响应式设计，适配各种设备屏幕：

![系统概览](screenshots/dashboard.png)
*系统概览页面*

![部门管理](screenshots/departments.png)
*部门管理页面*

## 扩展性说明

本系统具有良好的可扩展性：

1. **模块化设计**: 各功能模块相互独立，便于扩展新功能
2. **RESTful API**: 提供标准API接口，便于与其他系统集成
3. **数据库设计**: 采用规范化设计，支持后续字段扩展
4. **前端组件化**: 使用Bootstrap组件，便于界面调整和优化

## 开发指南

1. 修改后端逻辑：编辑 `server.js` 文件
2. 修改前端界面：编辑 `public/index.html` 文件
3. 修改前端样式：编辑 `public/css/style.css` 文件
4. 修改前端逻辑：编辑 `public/js/main.js` 文件

## 注意事项

1. 系统默认使用 3000 端口，如需修改请编辑 `server.js` 文件
2. 数据库存储在本地 `hr_system.db` 文件中
3. 系统首次运行时会自动创建数据库表结构
4. 生产环境部署建议使用专业的数据库系统替代 SQLite

## 许可证

本项目仅供学习和参考使用。

## AI助手说明

为了方便AI助手更好地理解和维护本系统，我们提供了专门的说明文档 [AGENT.md](AGENT.md)，其中包含了系统的详细技术架构、实现细节和扩展建议等内容。