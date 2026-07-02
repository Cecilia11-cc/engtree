import { getSupabaseClient } from '../src/storage/database/supabase-client';

const treasures = [
  // ===== 语法宝典 =====
  {
    title: '英语时态全攻略：12种时态一网打尽',
    description: '从一般现在时到过去完成进行时，用思维导图+例句彻底搞懂英语时态体系',
    category: 'grammar',
    sub_category: '时态',
    content_type: 'article',
    content: `## 英语时态全攻略

英语共有12种时态，由4种时间（现在、过去、将来、过去将来）和4种体（一般、进行、完成、完成进行）组合而成。

### 一、现在时态群

#### 1. 一般现在时 (Simple Present)
- 结构：主语 + 动词原形/三单
- 用法：习惯性动作、客观事实、时间表
- 例句：She goes to school every day. / The earth revolves around the sun.

#### 2. 现在进行时 (Present Continuous)
- 结构：am/is/are + doing
- 用法：正在发生的动作、近期计划
- 例句：I am studying English now. / We are leaving tomorrow.

#### 3. 现在完成时 (Present Perfect)
- 结构：have/has + done
- 用法：过去发生对现在有影响的动作
- 例句：I have lived here for 5 years. / She has just finished her homework.

#### 4. 现在完成进行时 (Present Perfect Continuous)
- 结构：have/has been + doing
- 用法：从过去持续到现在且还在进行的动作
- 例句：I have been waiting for you for two hours.

### 二、过去时态群

#### 5. 一般过去时 (Simple Past)
- 结构：主语 + 动词过去式
- 用法：过去某个时间发生的动作
- 例句：I visited my grandmother last weekend.

#### 6. 过去进行时 (Past Continuous)
- 结构：was/were + doing
- 用法：过去某个时刻正在进行的动作
- 例句：I was reading when the phone rang.

#### 7. 过去完成时 (Past Perfect)
- 结构：had + done
- 用法：过去的过去，发生在另一个过去动作之前
- 例句：I had finished dinner before he arrived.

#### 8. 过去完成进行时 (Past Perfect Continuous)
- 结构：had been + doing
- 用法：过去某时之前一直持续的动作
- 例句：She had been working for 3 hours before I came.

### 三、将来时态群

#### 9. 一般将来时 (Simple Future)
- 结构：will + 动词原形
- 用法：将来要发生的动作或预测
- 例句：I will call you tomorrow.

#### 10. 将来进行时 (Future Continuous)
- 结构：will be + doing
- 用法：将来某个时刻正在进行的动作
- 例句：This time tomorrow, I will be flying to London.

#### 11. 将来完成时 (Future Perfect)
- 结构：will have + done
- 用法：将来某时之前已经完成的动作
- 例句：By next month, I will have graduated.

#### 12. 将来完成进行时 (Future Perfect Continuous)
- 结构：will have been + doing
- 用法：到将来某时已经持续了多久的动作
- 例句：By December, I will have been learning English for 3 years.

### 记忆技巧

> 画一条时间线，把"现在"放在中间，左边是"过去"，右边是"将来"。每种时态就是在这条时间线上选择一个点或一段区间。`,
    tags: '时态,语法,现在时,过去时,将来时',
    difficulty: 'medium',
    target_exam: 'cet4',
    is_featured: true,
  },
  {
    title: '虚拟语气：从if到wish，一篇文章搞懂',
    description: '系统讲解虚拟语气的三种类型、倒装用法以及常见考试陷阱',
    category: 'grammar',
    sub_category: '虚拟语气',
    content_type: 'article',
    content: `## 虚拟语气完全指南

虚拟语气表达的是假设、愿望或与事实相反的情况，是英语语法中的重点和难点。

### 一、if 条件句中的虚拟

#### 与现在事实相反
- 从句：were/did
- 主句：would/could/should/might + do
- 例：If I were you, I would study harder.

#### 与过去事实相反
- 从句：had done
- 主句：would/could/should/might + have done
- 例：If he had come earlier, he would have caught the train.

#### 与将来事实相反
- 从句：were to do / should do / did
- 主句：would/could/should/might + do
- 例：If it should rain tomorrow, we would stay at home.

### 二、省略 if 的倒装

当 if 省略时，从句需部分倒装：
- Were I you (= If I were you)
- Had he known (= If he had known)
- Should she come (= If she should come)

### 三、wish 的虚拟

- wish + did/were（对现在的愿望）
- wish + had done（对过去的遗憾）
- wish + would do（对将来的期望）

例：I wish I were a bird. / I wish I had studied harder.

### 四、其他虚拟用法

- suggest/demand/insist + that + (should) do
- It is necessary that + (should) do
- as if/though + did/were（与现在相反）
- as if/though + had done（与过去相反）`,
    tags: '虚拟语气,if条件句,wish,倒装,语法',
    difficulty: 'hard',
    target_exam: 'cet6',
    is_featured: true,
  },
  {
    title: '定语从句精讲：关系词选择不再纠结',
    description: '通过对比表格和典型例句，彻底搞清that/which/who/whom/whose/when/where/why的用法区别',
    category: 'grammar',
    sub_category: '从句',
    content_type: 'tips',
    content: `## 定语从句精讲

### 关系代词选择流程

先问三个问题：
1. 先行词是人还是物？
2. 从句缺什么成分（主/宾/定）？
3. 有没有逗号（限定性 vs 非限定性）？

### 核心对照表

| 关系词 | 先行词 | 从句成分 | 特殊说明 |
|--------|--------|----------|----------|
| that | 人/物 | 主/宾 | 限定性从句优先，介词后不用 |
| which | 物 | 主/宾 | 非限定性用逗号隔开 |
| who | 人 | 主/宾 | 只指人 |
| whom | 人 | 宾 | 口语常省略 |
| whose | 人/物 | 定 | = of which/whom |
| when | 时间 | 状 | = at/in/on which |
| where | 地点 | 状 | = at/in/on which |
| why | 原因 | 状 | = for which |

### 只用 that 的情况

- 先行词被最高级修饰：This is the best book that I have ever read.
- 先行词被 the only/the very 修饰：This is the very person that I want to see.
- 先行词既有人又有物：The man and his dog that passed here left footprints.
- 先行词是不定代词：Everything that he said was true.`,
    tags: '定语从句,关系代词,that,which,语法',
    difficulty: 'medium',
    target_exam: 'cet4',
  },

  // ===== 词汇金矿 =====
  {
    title: '四级高频词汇 500 词组搭配手册',
    description: '精选四级考试最高频的500个词组搭配，按主题分类，附例句和记忆技巧',
    category: 'vocabulary',
    sub_category: '词组搭配',
    content_type: 'exercise',
    content: `## 四级高频词组搭配

### 一、动词词组

#### take 系列
- take advantage of 利用
- take into account 考虑到
- take for granted 认为理所当然
- take effect 生效
- take measures 采取措施

#### put 系列
- put forward 提出
- put off 推迟
- put up with 忍受
- put out 熄灭
- put aside 储存

#### get 系列
- get rid of 摆脱
- get along with 与...相处
- get over 克服
- get through 通过/完成
- get involved in 参与

### 二、介词词组

- in terms of 就...而言
- on behalf of 代表
- in accordance with 根据
- with regard to 关于
- at the expense of 以...为代价
- in favor of 支持
- on the contrary 相反
- in addition to 除...之外
- by means of 借助于
- for the sake of 为了

### 三、形容词搭配

- be aware of 意识到
- be capable of 有能力
- be subject to 受制于
- be typical of 典型的
- be liable for 对...负责
- be equivalent to 等同于
- be superior to 优于
- be inferior to 劣于

> 建议每天记忆20个搭配，配合造句练习效果更佳。`,
    tags: '四级,词组,搭配,高频词,词汇',
    difficulty: 'medium',
    target_exam: 'cet4',
    is_featured: true,
  },
  {
    title: '学术写作高级替换词清单',
    description: '告别good/bad/important，用更精准的学术词汇提升作文档次',
    category: 'vocabulary',
    sub_category: '学术词汇',
    content_type: 'tips',
    content: `## 学术写作高级替换词

### 常见弱词 → 高级替换

#### Good →
- excellent, outstanding, remarkable
- beneficial, favorable, advantageous
- superior, exceptional, splendid

#### Bad →
- detrimental, adverse, unfavorable
- harmful, destructive, pernicious
- undesirable, negative, inferior

#### Important →
- crucial, vital, essential
- significant, paramount, indispensable
- fundamental, pivotal, critical

#### Many →
- numerous, abundant, substantial
- a multitude of, a vast array of
- considerable, extensive

#### Show →
- demonstrate, illustrate, exhibit
- indicate, reveal, manifest
- depict, portray, present

#### Think →
- believe, consider, maintain
- contend, assert, argue
- hypothesize, postulate, presume

#### Get →
- obtain, acquire, attain
- achieve, secure, gain
- procure, derive, receive

### 连接词升级

- But → However, Nevertheless, Nonetheless
- So → Therefore, Consequently, Accordingly
- Also → Furthermore, Moreover, Additionally
- Because → Due to, Owing to, On account of`,
    tags: '学术写作,替换词,高级词汇,写作提升',
    difficulty: 'hard',
    target_exam: 'cet6',
  },
  {
    title: '计算机专业英语核心术语 200 词',
    description: '覆盖算法、网络、数据库、安全、人工智能五大领域，考研/面试必备',
    category: 'vocabulary',
    sub_category: '专业术语',
    content_type: 'article',
    content: `## 计算机专业英语核心术语

### 算法与数据结构
- algorithm 算法
- data structure 数据结构
- time complexity 时间复杂度
- space complexity 空间复杂度
- binary search 二分查找
- dynamic programming 动态规划
- recursion 递归
- traversal 遍历
- hash table 哈希表
- linked list 链表

### 计算机网络
- protocol 协议
- bandwidth 带宽
- latency 延迟
- packet 数据包
- routing 路由
- firewall 防火墙
- TCP/IP 传输控制协议/互联网协议
- DNS 域名系统
- HTTP 超文本传输协议
- socket 套接字

### 数据库
- query 查询
- transaction 事务
- index 索引
- schema 模式
- normalization 规范化
- primary key 主键
- foreign key 外键
- join 连接
- trigger 触发器
- stored procedure 存储过程

### 信息安全
- encryption 加密
- authentication 认证
- authorization 授权
- vulnerability 漏洞
- malware 恶意软件
- phishing 钓鱼攻击
- intrusion detection 入侵检测
- penetration testing 渗透测试

### 人工智能
- machine learning 机器学习
- neural network 神经网络
- deep learning 深度学习
- natural language processing 自然语言处理
- computer vision 计算机视觉
- reinforcement learning 强化学习
- training set 训练集
- overfitting 过拟合
- gradient descent 梯度下降
- convolutional neural network 卷积神经网络`,
    tags: '计算机,专业术语,算法,网络,数据库,AI',
    difficulty: 'medium',
    target_exam: 'postgrad',
  },

  // ===== 阅读秘籍 =====
  {
    title: '四六级阅读理解速读技巧',
    description: '3步快速定位答案，15分钟搞定阅读理解大题',
    category: 'reading',
    sub_category: '速读技巧',
    content_type: 'tips',
    content: `## 四六级阅读理解速读技巧

### 三步定位法

#### 第一步：先读题干，圈关键词（2分钟）
- 圈出题干中的专有名词、数字、特殊术语
- 注意题干中的 NOT/EXCEPT 等否定词
- 按题序预测答案可能出现的位置

#### 第二步：略读文章，把握结构（5分钟）
- 第一段：主题句通常在首句或末句
- 中间段：每段首句是段落大意
- 最后一段：结论或作者态度

#### 第三步：精读定位句，对比选项（8分钟）
- 根据关键词回原文定位
- 答案通常在定位句或其前后一句
- 对比选项时注意同义替换

### 常见出题套路

1. **细节题**：原文有对应句，注意同义替换
2. **推断题**：不能直接找到答案，需要推理
3. **主旨题**：看首尾段，选涵盖全文的选项
4. **态度题**：注意形容词，区分 positive/negative/neutral/objective
5. **词义题**：看上下文语境，不要仅凭词根猜测

### 时间分配建议

| 题型 | 篇幅 | 建议时间 |
|------|------|----------|
| 选词填空 | 200词 | 5分钟 |
| 长篇阅读 | 1000词 | 10分钟 |
| 仔细阅读 | 2篇×400词 | 20分钟 |

> 核心原则：不读懂全文也能做题，关键是快速定位！`,
    tags: '阅读理解,速读,四六级,技巧',
    difficulty: 'medium',
    target_exam: 'cet4',
    is_featured: true,
  },

  // ===== 听力宝盒 =====
  {
    title: '四级听力短对话必考场景词汇',
    description: '校园、图书馆、餐厅、医院等8大高频场景核心词汇与常见题型',
    category: 'listening',
    sub_category: '场景词汇',
    content_type: 'article',
    content: `## 四级听力短对话场景词汇

### 场景一：校园
- enrollment 注册入学
- semester/term 学期
- credit 学分
- elective 选修课
- required course 必修课
- assignment 作业
- presentation 课堂展示
- tuition 学费
- scholarship 奖学金
- dean 院长

### 场景二：图书馆
- due 到期
- overdue 逾期
- renew 续借
- return 归还
- reference book 参考书
- periodical 期刊
- stack 书库
- circulation desk 借还处
- reserve 预留
- fine 罚款

### 场景三：餐厅
- appetizer 开胃菜
- main course 主菜
- dessert 甜点
- bill/check 账单
- tip 小费
- reservation 预订
- waiter/waitress 服务员
- specialty 招牌菜
- catering 承办酒席
- buffet 自助餐

### 场景四：医院
- appointment 预约
- prescription 处方
- symptom 症状
- diagnosis 诊断
- surgery 手术
- pharmacy 药房
- emergency 急诊
- physical examination 体检
- vaccine 疫苗
- allergic 过敏的

### 场景五：旅行
- boarding pass 登机牌
- check-in 办理登机
- customs 海关
- departure 出发
- destination 目的地
- itinerary 行程
- luggage/baggage 行李
- sightseeing 观光
- souvenir 纪念品
- jet lag 时差

### 场景六：求职
- resume 简历
- interview 面试
- position 职位
- salary 薪水
- candidate 候选人
- qualification 资质
- experience 经验
- promotion 升职
- probation 试用期
- benefit 福利`,
    tags: '听力,场景词汇,四级,校园,图书馆',
    difficulty: 'easy',
    target_exam: 'cet4',
  },

  // ===== 写作锦囊 =====
  {
    title: '四级作文万能模板：议论文三段式',
    description: '开头段+论证段+结尾段的万能句式，套用即可拿基础分',
    category: 'writing',
    sub_category: '作文模板',
    content_type: 'article',
    content: `## 四级作文万能模板：议论文三段式

### 开头段（引出话题）

#### 模板1：现象引出
Nowadays, there is a growing concern over [话题]. Some people believe that [观点A], while others argue that [观点B]. As far as I am concerned, I firmly support the view that [你的立场].

#### 模板2：问题引出
With the rapid development of [领域], [问题] has become a matter of great concern. It is widely acknowledged that [核心观点].

#### 模板3：名言引出
There is an old saying goes that "[名言]". This proverb highlights the importance of [话题]. In my opinion, [你的观点].

### 论证段（展开论述）

#### 模板1：分点论证
To begin with, [论据1]. A good case in point is that [例子1]. Furthermore, [论据2]. According to a recent survey, [数据支撑]. Last but not least, [论据3].

#### 模板2：对比论证
On one hand, [正面论述]. For example, [正面例子]. On the other hand, [反面论述]. However, this does not necessarily mean that [驳斥反面].

#### 模板3：因果论证
The reasons for [现象] are as follows. First and foremost, [原因1]. In addition, [原因2]. Most importantly, [原因3]. As a result, [结果].

### 结尾段（总结升华）

#### 模板1：呼吁行动
In conclusion, taking all these factors into consideration, I strongly recommend that [建议]. Only in this way can we [期望效果].

#### 模板2：展望未来
To sum up, [总结观点]. It is my sincere hope that [期望]. I believe that with joint efforts, a brighter future awaits us.

#### 模板3：重申立场
All in all, [重申立场] is of great significance to [重要性]. We should bear in mind that [核心观点] and make every effort to [行动].`,
    tags: '作文,模板,议论文,四级,万能句',
    difficulty: 'easy',
    target_exam: 'cet4',
    is_featured: true,
  },
  {
    title: '英语写作常见语法错误 Top 20',
    description: '中国学生最常犯的20个语法错误，附修正方法和练习',
    category: 'writing',
    sub_category: '语法纠错',
    content_type: 'exercise',
    content: `## 英语写作常见语法错误 Top 20

### 1. 主谓不一致
- 错：The list of items are on the desk.
- 对：The list of items is on the desk.
- 规则：主语是 list，不是 items

### 2. 时态不一致
- 错：Yesterday I go to the store and bought some milk.
- 对：Yesterday I went to the store and bought some milk.

### 3. 冠词误用
- 错：I am student at university.
- 对：I am a student at a university.

### 4. 代词指代不清
- 错：When Mary met Lisa, she was happy. (谁happy?)
- 对：When Mary met Lisa, Mary was happy.

### 5. 中式英语
- 错：My English level is very low.
- 对：My English proficiency is limited.

### 6. 逗号拼接
- 错：It was raining, I stayed at home.
- 对：It was raining, so I stayed at home. / Because it was raining, I stayed at home.

### 7. 介词搭配错误
- 错：I am good in English.
- 对：I am good at English.

### 8. 不可数名词加s
- 错：I need some informations.
- 对：I need some information.

### 9. 双重否定
- 错：I don't have no money.
- 对：I don't have any money.

### 10. 悬垂分词
- 错：Walking down the street, the trees were beautiful.
- 对：Walking down the street, I saw the beautiful trees.`,
    tags: '语法错误,写作,纠错,中式英语',
    difficulty: 'easy',
    target_exam: 'cet4',
  },

  // ===== 口语擂台 =====
  {
    title: '英语面试自我介绍模板与技巧',
    description: '5套不同场景的英文自我介绍模板，附发音要点和面试官常问问题',
    category: 'speaking',
    sub_category: '面试口语',
    content_type: 'article',
    content: `## 英语面试自我介绍模板与技巧

### 通用版（1分钟）

Good morning/afternoon. My name is [Name]. I graduated from [University] with a degree in [Major]. During my college years, I have developed strong skills in [Skill 1] and [Skill 2]. I completed an internship at [Company], where I was responsible for [Responsibility]. This experience helped me improve my [Skill] significantly. I am a quick learner and a team player. I am very interested in this position because [Reason]. I believe my background and enthusiasm make me a good fit for this role. Thank you.

### 技术岗版

Hello, I am [Name]. I hold a [Degree] in Computer Science from [University]. I have [X] years of experience in software development, specializing in [Technology]. My recent project involved [Project Description], where I used [Tech Stack] to achieve [Result]. I am passionate about clean code and continuous learning. In my spare time, I contribute to open-source projects on GitHub. I am excited about this opportunity because it aligns with my career goals in [Field].

### 面试官常问问题

1. Tell me about yourself.
2. What are your strengths and weaknesses?
3. Why do you want to work here?
4. Where do you see yourself in 5 years?
5. Can you describe a challenge you overcame?
6. Why should we hire you?
7. What is your expected salary?
8. Do you have any questions for us?

### 回答技巧

- STAR法则：Situation → Task → Action → Result
- 每个回答控制在1-2分钟
- 弱点问题要真诚但展示改进
- 用具体数据和例子支撑
- 保持微笑和眼神交流`,
    tags: '面试,自我介绍,口语,求职',
    difficulty: 'medium',
    target_exam: 'job',
    is_featured: true,
  },

  // ===== 考场宝典 =====
  {
    title: '四六级考试时间分配与答题策略',
    description: '精确到分钟的考试时间规划，帮你最大化得分',
    category: 'exam',
    sub_category: '考试策略',
    content_type: 'tips',
    content: `## 四六级考试时间分配

### 四级时间分配（125分钟）

| 部分 | 时间 | 分值 | 策略 |
|------|------|------|------|
| 写作 | 30分钟 | 15% | 先列提纲再写，注意卷面 |
| 听力 | 25分钟 | 35% | 边听边涂答题卡 |
| 阅读 | 40分钟 | 35% | 先仔细阅读再做填词 |
| 翻译 | 30分钟 | 15% | 先翻主干再润色 |

### 六级时间分配（130分钟）

| 部分 | 时间 | 分值 | 策略 |
|------|------|------|------|
| 写作 | 30分钟 | 15% | 高级词汇+复杂句式 |
| 听力 | 30分钟 | 35% | 注意lecture部分 |
| 阅读 | 40分钟 | 35% | 速度是关键 |
| 翻译 | 30分钟 | 15% | 注意中国文化词汇 |

### 答题顺序建议

1. **写作**：规定时间，按时完成
2. **听力**：利用间隙预读选项
3. **仔细阅读**：分值高，优先做
4. **长篇匹配**：先看题再扫文
5. **选词填空**：最后做，不会就猜
6. **翻译**：保证基本意思正确

### 关键提醒

> 听力结束后立即收答题卡1！所以听力一定要边听边涂！`,
    tags: '四六级,考试策略,时间分配,答题技巧',
    difficulty: 'easy',
    target_exam: 'cet4',
    is_featured: true,
  },

  // ===== 文化殿堂 =====
  {
    title: '英美文化常识：50个必知的英语背景知识',
    description: '从英式下午茶到美国大选，了解这些文化背景才能读懂阅读理解中的暗指',
    category: 'culture',
    sub_category: '文化常识',
    content_type: 'article',
    content: `## 英美文化常识50条

### 英国篇

1. 英式下午茶（Afternoon Tea）起源于19世纪，由贝德福德公爵夫人发起
2. 英国议会（Parliament）分为上下两院：House of Lords 和 House of Commons
3. BBC 是英国广播公司，全球最知名的公共广播机构
4. 牛津大学和剑桥大学合称 Oxbridge，是英国最古老的两所大学
5. 英国的公学（Public School）实际上是私立学校，如伊顿公学
6. Boxting Day 是12月26日，传统上是给服务人员送礼物的日子
7. 英国驾车靠左行驶，方向盘在右边
8. 苏格兰裙（Kilt）是苏格兰传统服饰
9. 大本钟（Big Ben）其实是钟楼里最大那口钟的名字，不是塔的名字
10. 英国国菜是炸鱼薯条（Fish and Chips）

### 美国篇

1. 美国独立日是7月4日（Independence Day）
2. 美国国旗上的50颗星代表50个州，13条条纹代表最初的13个殖民地
3. 感恩节（Thanksgiving）是11月的第四个星期四
4. 常春藤联盟（Ivy League）包括8所东北部顶尖大学
5. 五角大楼（The Pentagon）是美国国防部所在地
6. 好莱坞（Hollywood）位于加州洛杉矶，全球电影工业中心
7. 华尔街（Wall Street）是纽约金融区的代名词
8. 美国大选采用选举人团制度（Electoral College）
9. 超级碗（Super Bowl）是美国职业橄榄球冠军赛，全美收视率最高
10. 美国驾车靠右行驶

### 常见阅读理解文化考点

- 分权制衡（Checks and Balances）
- 熔炉理论（Melting Pot）vs 色拉碗理论（Salad Bowl）
- 美国梦（American Dream）
- 嬉皮士运动（Hippie Movement）
- 女权运动（Feminist Movement）`,
    tags: '英美文化,文化常识,阅读背景,英语知识',
    difficulty: 'easy',
    target_exam: 'cet4',
  },
  {
    title: '英语俚语与日常表达 100 句',
    description: '看美剧不再懵！精选最常用的100个英语俚语和日常表达',
    category: 'culture',
    sub_category: '俚语表达',
    content_type: 'article',
    content: `## 英语俚语与日常表达

### 社交场景

1. What's up? — 怎么了/最近怎样？
2. How's it going? — 最近好吗？
3. Long time no see. — 好久不见
4. It's been ages. — 很久没见了
5. Catch you later. — 回头见
6. Take it easy. — 别紧张/慢慢来
7. No worries. — 没关系/别担心
8. My bad. — 我的错
9. Fair enough. — 有道理/说得通
10. So far so good. — 目前还不错

### 表达态度

11. I'm in. — 我加入/我同意
12. Count me out. — 别算我
13. It's a deal. — 一言为定
14. I'll buy that. — 我信了/同意
15. You bet. — 当然/没问题
16. Not a chance. — 没门
17. Give me a break. — 得了吧/饶了我
18. You've got to be kidding. — 你在开玩笑吧
19. Beats me. — 我不知道
20. I couldn't agree more. — 我完全同意

### 形容描述

21. Piece of cake. — 小菜一碟
22. Under the weather. — 身体不适
23. Out of the blue. — 突然地
24. On top of the world. — 极其开心
25. Over the moon. — 高兴极了
26. Down in the dumps. — 心情低落
27. Hit the nail on the head. — 一针见血
28. Break a leg. — 祝好运（演出前说）
29. Couch potato. — 电视迷/懒人
30. Bookworm. — 书虫/爱读书的人`,
    tags: '俚语,日常表达,口语,美剧,地道英语',
    difficulty: 'easy',
    target_exam: 'job',
  },
];

async function seedTreasures() {
  const client = getSupabaseClient();

  for (const treasure of treasures) {
    const { data, error } = await client
      .from('treasure')
      .insert({
        ...treasure,
        author: 'EngTree',
      });

    if (error) {
      console.error(`Failed to insert "${treasure.title}":`, error.message);
    } else {
      console.log(`Inserted: ${treasure.title}`);
    }
  }

  console.log('\nDone! Total treasures to insert:', treasures.length);
}

seedTreasures();
