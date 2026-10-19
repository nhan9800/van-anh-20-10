const image = (name: string) => `${import.meta.env.BASE_URL}images/${name}`;

export const loveData = {
  recipient: 'Vân Anh',
  sender: 'Trọng Nhân',
  anniversary: '28/12/2025',
  anniversaryISO: '2025-12-28T00:00:00+07:00',
  audioUrl: `${import.meta.env.BASE_URL}audio/de-danh-cho-em-dangrangto.mp3`,
  images: {
    hero: image('vs10.jpg'),
    heroSecondary: image('vs3.jpg'),
    bouquet: image('vs2.jpg'),
    portraits: [image('vs11.jpg'), image('vs12.jpg'), image('vs4.jpg'), image('vs9.jpg')],
    selfies: [image('va1.jpg'), image('vs5.jpg'), image('vs6.jpg'), image('vs7.jpg'), image('vs8.jpg')],
  },
  wishes: [
    'Chúc em 20/10 thật vui vẻ và hạnh phúc.',
    'Mong em luôn rạng rỡ, luôn được yêu',
    'thương và chẳng phải buồn vì điều gì.',
    'Có anh ở đây, thương em thật nhiều. ❤️',
  ],
  compliments: ['Nụ cười của em luôn làm ngày dài dịu lại.', 'Em đẹp nhất khi được là chính mình.', 'Mỗi khoảnh khắc cạnh em đều đáng nhớ.', 'Cảm ơn em vì đã đến bên anh.'],
  lovePass: ['1000 cái ôm thật chặt khi gặp nhau', 'Trà sữa và đồ ăn ngon bất cứ lúc nào em thèm', 'Luôn có Trọng Nhân ở đây thương em thật nhiều'],
} as const;

export type LoveData = typeof loveData;
