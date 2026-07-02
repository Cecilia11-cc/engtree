import { getSupabaseClient } from '@/storage/database/supabase-client';

const words = [
  // Core vocabulary
  { word_text: 'algorithm', phonetic: '/ˈælɡərɪðəm/', meaning: 'n. 算法；计算程序', example_sentence: 'The algorithm processes data in linear time.', example_translation: '该算法以线性时间处理数据。', category: 'cs', difficulty: 'medium' },
  { word_text: 'database', phonetic: '/ˈdeɪtəbeɪs/', meaning: 'n. 数据库', example_sentence: 'All customer information is stored in the database.', example_translation: '所有客户信息都存储在数据库中。', category: 'cs', difficulty: 'easy' },
  { word_text: 'network', phonetic: '/ˈnetwɜːrk/', meaning: 'n. 网络；人脉', example_sentence: 'The company has a vast network of suppliers.', example_translation: '该公司拥有庞大的供应商网络。', category: 'cs', difficulty: 'easy' },
  { word_text: 'security', phonetic: '/sɪˈkjʊərəti/', meaning: 'n. 安全；证券', example_sentence: 'Network security is a top priority for banks.', example_translation: '网络安全是银行的首要任务。', category: 'cs', difficulty: 'easy' },
  { word_text: 'interface', phonetic: '/ˈɪntərfeɪs/', meaning: 'n. 界面；接口', example_sentence: 'The user interface needs to be more intuitive.', example_translation: '用户界面需要更加直观。', category: 'cs', difficulty: 'medium' },
  { word_text: 'variable', phonetic: '/ˈveriəbl/', meaning: 'n. 变量 adj. 可变的', example_sentence: 'Declare a variable to store the result.', example_translation: '声明一个变量来存储结果。', category: 'cs', difficulty: 'easy' },
  { word_text: 'compile', phonetic: '/kəmˈpaɪl/', meaning: 'v. 编译；汇集', example_sentence: 'The compiler translates source code into machine code.', example_translation: '编译器将源代码翻译成机器码。', category: 'cs', difficulty: 'medium' },
  { word_text: 'protocol', phonetic: '/ˈproʊtəkɒl/', meaning: 'n. 协议；规程', example_sentence: 'HTTP is a protocol used for web communication.', example_translation: 'HTTP 是用于网络通信的协议。', category: 'cs', difficulty: 'medium' },
  { word_text: 'encryption', phonetic: '/ɪnˈkrɪpʃən/', meaning: 'n. 加密', example_sentence: 'End-to-end encryption protects your messages.', example_translation: '端到端加密保护你的消息。', category: 'cs', difficulty: 'hard' },
  { word_text: 'bandwidth', phonetic: '/ˈbændwɪdθ/', meaning: 'n. 带宽', example_sentence: 'Higher bandwidth allows faster data transfer.', example_translation: '更高的带宽允许更快的数据传输。', category: 'cs', difficulty: 'medium' },
  // Business
  { word_text: 'revenue', phonetic: '/ˈrevənjuː/', meaning: 'n. 收入；税收', example_sentence: 'The company reported record revenue this quarter.', example_translation: '该公司本季度报告了创纪录的收入。', category: 'business', difficulty: 'medium' },
  { word_text: 'negotiate', phonetic: '/nɪˈɡoʊʃieɪt/', meaning: 'v. 谈判；协商', example_sentence: 'We need to negotiate a better deal with the supplier.', example_translation: '我们需要与供应商协商更好的交易。', category: 'business', difficulty: 'medium' },
  { word_text: 'stakeholder', phonetic: '/ˈsteɪkhoʊldər/', meaning: 'n. 利益相关者', example_sentence: 'All stakeholders should be informed of the changes.', example_translation: '应将变更通知所有利益相关者。', category: 'business', difficulty: 'medium' },
  { word_text: 'profit', phonetic: '/ˈprɒfɪt/', meaning: 'n. 利润 v. 获利', example_sentence: 'The company made a significant profit last year.', example_translation: '该公司去年获得了丰厚的利润。', category: 'business', difficulty: 'easy' },
  { word_text: 'acquisition', phonetic: '/ˌækwɪˈzɪʃən/', meaning: 'n. 收购；获取', example_sentence: 'The acquisition was valued at $2 billion.', example_translation: '此次收购估值为20亿美元。', category: 'business', difficulty: 'hard' },
  // Core exam words
  { word_text: 'significant', phonetic: '/sɪɡˈnɪfɪkənt/', meaning: 'adj. 重要的；显著的', example_sentence: 'There has been a significant improvement in test scores.', example_translation: '考试成绩有了显著提高。', category: 'core', difficulty: 'easy' },
  { word_text: 'demonstrate', phonetic: '/ˈdemənstreɪt/', meaning: 'v. 证明；示范', example_sentence: 'The study demonstrates the effectiveness of the new drug.', example_translation: '该研究证明了新药的有效性。', category: 'core', difficulty: 'medium' },
  { word_text: 'perspective', phonetic: '/pərˈspektɪv/', meaning: 'n. 观点；视角', example_sentence: 'Try to see the issue from a different perspective.', example_translation: '试着从不同的角度看问题。', category: 'core', difficulty: 'medium' },
  { word_text: 'comprehensive', phonetic: '/ˌkɒmprɪˈhensɪv/', meaning: 'adj. 全面的；综合的', example_sentence: 'We need a comprehensive review of the policy.', example_translation: '我们需要对政策进行全面审查。', category: 'core', difficulty: 'medium' },
  { word_text: 'elaborate', phonetic: '/ɪˈlæbərət/', meaning: 'v. 详细阐述 adj. 精心制作的', example_sentence: 'Could you elaborate on your proposal?', example_translation: '你能详细阐述一下你的提案吗？', category: 'core', difficulty: 'medium' },
  { word_text: 'fundamental', phonetic: '/ˌfʌndəˈmentl/', meaning: 'adj. 根本的；基础的', example_sentence: 'Education is a fundamental right for all children.', example_translation: '教育是所有儿童的基本权利。', category: 'core', difficulty: 'medium' },
  { word_text: 'inevitable', phonetic: '/ɪnˈevɪtəbl/', meaning: 'adj. 不可避免的', example_sentence: 'Change is inevitable in a growing organization.', example_translation: '在一个成长中的组织里，变化是不可避免的。', category: 'core', difficulty: 'hard' },
  { word_text: 'substantial', phonetic: '/səbˈstænʃl/', meaning: 'adj. 大量的；实质的', example_sentence: 'They received substantial funding for the project.', example_translation: '他们为该项目获得了大量资金。', category: 'core', difficulty: 'medium' },
  { word_text: 'controversial', phonetic: '/ˌkɒntrəˈvɜːrʃl/', meaning: 'adj. 有争议的', example_sentence: 'The decision was highly controversial among employees.', example_translation: '该决定在员工中引起了很大争议。', category: 'core', difficulty: 'hard' },
  { word_text: 'consequence', phonetic: '/ˈkɒnsɪkwəns/', meaning: 'n. 结果；后果', example_sentence: 'We must consider the consequences of our actions.', example_translation: '我们必须考虑行为带来的后果。', category: 'core', difficulty: 'medium' },
  { word_text: 'hypothesis', phonetic: '/haɪˈpɒθəsɪs/', meaning: 'n. 假设；假说', example_sentence: 'The hypothesis was tested through multiple experiments.', example_translation: '该假说通过多次实验进行了验证。', category: 'core', difficulty: 'hard' },
  { word_text: 'ambiguous', phonetic: '/æmˈbɪɡjuəs/', meaning: 'adj. 模棱两可的', example_sentence: 'The instructions were ambiguous and confusing.', example_translation: '说明含糊不清，令人困惑。', category: 'core', difficulty: 'hard' },
  { word_text: 'phenomenon', phonetic: '/fɪˈnɒmɪnən/', meaning: 'n. 现象；奇迹', example_sentence: 'Global warming is a well-documented phenomenon.', example_translation: '全球变暖是一个有充分记录的现象。', category: 'core', difficulty: 'medium' },
  { word_text: 'prerequisite', phonetic: '/priːˈrekwɪzɪt/', meaning: 'n. 先决条件', example_sentence: 'A basic understanding of math is a prerequisite for this course.', example_translation: '基础数学理解是本课程的先决条件。', category: 'core', difficulty: 'hard' },
  { word_text: 'simultaneously', phonetic: '/ˌsaɪməlˈteɪniəsli/', meaning: 'adv. 同时地', example_sentence: 'The events occurred simultaneously in different cities.', example_translation: '这些事件在不同城市同时发生。', category: 'core', difficulty: 'hard' },
];

async function seed() {
  const client = getSupabaseClient();

  // Check if words already exist
  const { data: existing } = await client.from('word').select('word_id').limit(1);
  if (existing && existing.length > 0) {
    console.log('Words already seeded, skipping...');
    return;
  }

  const { data, error } = await client.from('word').insert(words).select();
  if (error) {
    console.error('Failed to seed words:', error.message);
  } else {
    console.log(`Seeded ${data.length} words`);
  }
}

seed();
