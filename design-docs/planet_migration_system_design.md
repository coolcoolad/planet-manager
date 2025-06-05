# 地球联邦行星移民可行性分析系统架构设计

## 1. 系统概述

本系统是为地球联邦行星移民计划设计的可行性分析平台，用于记录、管理和评估三个候选行星的各项探测数据，并通过智能算法推荐最佳移民目标。

### 1.1 系统目标
- 提供直观的数据录入和查看界面
- 实现智能的行星评估算法
- 建立完善的用户权限管理体系
- 确保数据安全和系统稳定性

### 1.2 核心功能
- 行星因子数据管理（CRUD操作）
- 多维度行星评估算法
- 基于角色的访问控制（RBAC）
- 实时数据可视化展示

## 2. 技术架构

### 2.1 整体架构
采用经典的三层架构模式：
- **表示层（Presentation Layer）**: React前端应用
- **业务逻辑层（Business Logic Layer）**: ASP.NET Core Web API
- **数据访问层（Data Access Layer）**: Entity Framework Core + SQL Server

### 2.2 架构模式
- **前端**: 采用React + TypeScript组件化架构
- **后端**: 基于Clean Architecture的分层设计
- **数据库**: 关系型数据库设计，支持ACID事务
- **安全**: JWT Token + 基于角色的权限控制

## 3. 实现方案

### 3.1 技术选型分析

**前端技术栈:**
- **React 18**: 现代化的组件库，提供良好的用户体验
- **TypeScript**: 类型安全，提高代码质量和维护性
- **Material-UI**: 现代化UI组件库，确保界面美观统一
- **Tailwind CSS**: 实用优先的CSS框架，快速构建响应式界面
- **React Query**: 高效的数据获取和缓存管理
- **Chart.js**: 数据可视化图表库

**后端技术栈:**
- **.NET 8**: 最新的.NET平台，性能优异
- **ASP.NET Core Web API**: 构建RESTful API服务
- **Entity Framework Core**: ORM框架，简化数据访问
- **AutoMapper**: 对象映射，简化DTO转换
- **FluentValidation**: 数据验证库
- **Serilog**: 结构化日志记录

**数据库:**
- **SQL Server**: 企业级关系数据库，支持复杂查询和事务

**安全:**
- **JWT**: 无状态的身份验证
- **BCrypt**: 密码哈希加密
- **HTTPS**: 传输层安全

### 3.2 难点分析与解决方案

**1. 复杂的权限控制系统**
- 解决方案：实现基于角色和资源的细粒度权限控制
- 使用Policy-based Authorization
- 权限矩阵管理不同角色对不同行星的访问权限

**2. 灵活的因子数据结构**
- 解决方案：采用JSON字段存储动态因子数据
- 预定义核心因子，支持自定义扩展因子
- 使用强类型验证确保数据质量

**3. 智能评估算法**
- 解决方案：实现多准则决策分析（MCDM）算法
- 支持权重配置和算法参数调整
- 提供可解释的评估结果

## 4. 数据结构设计

### 4.1 核心实体
- **User**: 用户管理
- **Planet**: 行星基础信息
- **PlanetFactor**: 行星因子数据
- **Evaluation**: 评估结果
- **Role**: 角色定义
- **Permission**: 权限定义

### 4.2 因子分类
**环境因子:**
- 氧气浓度 (OxygenLevel)
- 水资源量 (WaterVolume)
- 大气压力 (AtmosphericPressure)
- 温度范围 (TemperatureRange)
- 重力强度 (GravityStrength)

**地质因子:**
- 岩石硬度 (RockHardness)
- 矿物资源 (MineralResources)
- 地震活动 (SeismicActivity)
- 火山活动 (VolcanicActivity)

**生物因子:**
- 威胁生物 (ThreateningCreatures)
- 有益生物 (BeneficialOrganisms)
- 生物多样性 (Biodiversity)

**技术因子:**
- 建设难度 (ConstructionDifficulty)
- 资源开采便利性 (ResourceAccessibility)
- 通信延迟 (CommunicationDelay)

## 5. API接口设计

### 5.1 认证接口
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/refresh` - 刷新Token
- `POST /api/auth/logout` - 用户登出

### 5.2 行星管理接口
- `GET /api/planets` - 获取行星列表
- `GET /api/planets/{id}` - 获取行星详情
- `POST /api/planets` - 创建行星
- `PUT /api/planets/{id}` - 更新行星信息
- `DELETE /api/planets/{id}` - 删除行星

### 5.3 因子管理接口
- `GET /api/planets/{planetId}/factors` - 获取行星因子
- `POST /api/planets/{planetId}/factors` - 添加因子数据
- `PUT /api/planets/{planetId}/factors/{factorId}` - 更新因子
- `DELETE /api/planets/{planetId}/factors/{factorId}` - 删除因子

### 5.4 评估接口
- `POST /api/evaluations` - 执行行星评估
- `GET /api/evaluations/{id}` - 获取评估结果
- `GET /api/evaluations/history` - 获取评估历史

### 5.5 用户管理接口
- `GET /api/users/profile` - 获取用户资料
- `PUT /api/users/profile` - 更新用户资料
- `GET /api/users/permissions` - 获取用户权限

## 6. 安全架构

### 6.1 身份验证
- JWT Token机制
- Token过期自动刷新
- 安全的密码存储（BCrypt哈希）

### 6.2 授权控制
- 基于角色的访问控制（RBAC）
- 资源级权限控制
- API接口权限拦截

### 6.3 数据安全
- HTTPS传输加密
- SQL注入防护
- XSS攻击防护
- CSRF保护
- 输入数据验证和清理

### 6.4 权限矩阵
| 角色 | 行星1 | 行星2 | 行星3 | 评估功能 | 用户管理 |
|------|-------|-------|-------|----------|----------|
| 超级管理员 | CRUD | CRUD | CRUD | 全部 | CRUD |
| 行星1管理员 | CRUD | - | - | 行星1 | - |
| 行星2管理员 | - | CRUD | - | 行星2 | - |
| 行星3管理员 | - | - | CRUD | 行星3 | - |
| 查看者类型1 | Read | - | - | 行星1 | - |
| 查看者类型2 | Read | - | Read | 行星1,3 | - |

## 7. 前端架构

### 7.1 组件架构
- **Layout组件**: 统一的页面布局
- **Authentication组件**: 登录认证模块
- **Dashboard组件**: 主控制面板
- **PlanetManagement组件**: 行星管理模块
- **FactorInput组件**: 因子数据录入
- **DataVisualization组件**: 数据可视化
- **Evaluation组件**: 评估结果展示
- **UserProfile组件**: 用户资料管理

### 7.2 状态管理
- 使用React Context进行全局状态管理
- React Query处理服务器状态
- localStorage持久化用户偏好设置

### 7.3 路由设计
```
/
├── /login - 登录页面
├── /dashboard - 主控制面板
├── /planets - 行星管理
│   ├── /planets/:id - 行星详情
│   └── /planets/:id/factors - 因子管理
├── /evaluation - 评估中心
│   ├── /evaluation/new - 新建评估
│   └── /evaluation/:id - 评估结果
└── /profile - 用户资料
```

## 8. 评估算法设计

### 8.1 多准则决策分析（MCDM）
采用层次分析法（AHP）结合TOPSIS方法：

1. **因子权重计算**: 基于专家经验和历史数据确定各因子权重
2. **标准化处理**: 将不同量纲的因子数据标准化到[0,1]区间
3. **加权评分**: 计算每个行星的综合评分
4. **排序推荐**: 根据评分对行星进行排序并给出推荐理由

### 8.2 评估因子权重
- 环境适宜性: 40%
- 资源丰富度: 25%
- 安全风险: 20%
- 开发难度: 15%

### 8.3 评估结果展示
- 综合评分雷达图
- 各维度对比柱状图
- 详细的评估报告
- 推荐理由和风险提示

## 9. 部署架构

### 9.1 开发环境
- **前端**: Node.js + npm/yarn
- **后端**: .NET 8 SDK
- **数据库**: SQL Server Developer Edition
- **工具**: Visual Studio Code, Visual Studio 2022

### 9.2 生产环境
- **前端**: Nginx静态文件服务
- **后端**: IIS或Kestrel托管
- **数据库**: SQL Server Enterprise Edition
- **负载均衡**: Nginx反向代理
- **HTTPS**: Let's Encrypt SSL证书

### 9.3 容器化部署（可选）
- **前端**: Nginx Docker镜像
- **后端**: ASP.NET Core Docker镜像
- **数据库**: SQL Server Docker容器
- **编排**: Docker Compose

## 10. 性能优化

### 10.1 前端优化
- 代码分割和懒加载
- 组件级缓存
- 图片压缩和CDN加速
- Service Worker缓存策略

### 10.2 后端优化
- 数据库查询优化
- Redis缓存
- 异步处理
- 连接池管理

### 10.3 数据库优化
- 索引设计
- 查询优化
- 分页查询
- 读写分离（如需要）

## 11. 监控与日志

### 11.1 应用监控
- 性能指标监控
- 错误日志收集
- 用户行为分析
- API调用统计

### 11.2 日志系统
- 结构化日志记录
- 日志等级管理
- 日志轮转和归档
- 敏感信息脱敏

## 12. 扩展性考虑

### 12.1 水平扩展
- 微服务架构演进路径
- 数据库分片策略
- 缓存分布式设计

### 12.2 功能扩展
- 支持更多行星
- 更复杂的评估算法
- 实时数据更新
- 移动端支持

## 13. 测试策略

### 13.1 测试类型
- 单元测试: Jest + Testing Library
- 集成测试: ASP.NET Core Test Host
- 端到端测试: Cypress
- 性能测试: NBomber

### 13.2 测试覆盖
- 代码覆盖率 > 80%
- API接口全覆盖
- 权限控制测试
- 边界条件测试

## 14. 项目交付

### 14.1 交付物
- 完整的源代码
- 技术文档
- 部署指南
- 用户操作手册
- 演示视频

### 14.2 质量保证
- 代码审查
- 安全扫描
- 性能测试
- 用户验收测试

## 总结

本架构设计遵循现代软件开发的最佳实践，采用成熟稳定的技术栈，确保系统的可靠性、安全性和可维护性。通过分层架构和模块化设计，系统具备良好的扩展性和灵活性，能够满足地球联邦行星移民可行性分析的各项需求。