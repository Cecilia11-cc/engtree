'use client';

import { useState, useEffect } from 'react';

const quotes = [
  // 夏日诗句
  { text: '绿树阴浓夏日长，楼台倒影入池塘。', author: '高骈《山亭夏日》' },
  { text: '首夏犹清和，芳草亦未歇。', author: '谢灵运《游赤石进帆海》' },
  { text: '连雨不知春去，一晴方觉夏深。', author: '范成大《喜晴》' },
  { text: '更无柳絮因风起，惟有葵花向日倾。', author: '司马光《客中初夏》' },
  { text: '小荷才露尖尖角，早有蜻蜓立上头。', author: '杨万里《小池》' },
  { text: '接天莲叶无穷碧，映日荷花别样红。', author: '杨万里《晓出净慈寺送林子方》' },
  { text: '清风无力屠得热，落日着翅飞上山。', author: '王令《暑旱苦热》' },
  { text: '树阴满地日当午，梦觉流莺时一声。', author: '苏舜钦《夏意》' },
  // 英语学习名言
  { text: 'The limits of my language mean the limits of my world.', author: 'Ludwig Wittgenstein' },
  { text: 'One language sets you in a corridor for life. Two languages open every door along the way.', author: 'Frank Smith' },
  { text: 'To have another language is to possess a second soul.', author: 'Charlemagne' },
  { text: 'Language is the road map of a culture. It tells you where its people come from and where they are going.', author: 'Rita Mae Brown' },
  { text: 'A different language is a different vision of life.', author: 'Federico Fellini' },
  { text: "The more that you read, the more things you will know. The more that you learn, the more places you\u0027ll go.", author: 'Dr. Seuss' },
  { text: 'Learning is a treasure that will follow its owner everywhere.', author: 'Chinese Proverb' },
  { text: 'A tree grows stronger with each passing season. So do you, with each word you learn.', author: 'EngTree' },
  // 夏日感悟
  { text: 'In the depth of winter, I finally learned that within me there lay an invincible summer.', author: 'Albert Camus' },
  { text: 'Summer afternoon — summer afternoon; to me those have always been the two most beautiful words in the English language.', author: 'Henry James' },
  { text: 'Everything is blooming most recklessly; if it were voices instead of colors, there would be an unbelievable shrieking into the heart of the night.', author: 'Rainer Maria Rilke' },
  { text: 'Summer is leaving silently, much like the way it arrived. But the growth it leaves behind remains.', author: 'EngTree' },
];

export default function RotatingQuote() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * quotes.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex((prev) => (prev + 1) % quotes.length);
        setVisible(true);
      }, 600);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  const quote = quotes[index];

  return (
    <div
      className={`transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}
    >
      <p className="text-xs text-muted-foreground/80 italic font-serif leading-relaxed">
        &ldquo;{quote.text}&rdquo;
      </p>
      <p className="text-[10px] text-muted-foreground/50 mt-1 font-sans">
        — {quote.author}
      </p>
    </div>
  );
}
