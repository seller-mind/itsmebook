/**
 * 经典故事库 - 公版经典儿童故事
 * 仅使用版权过期的公版故事，适合3-8岁儿童睡前听
 */

export interface ClassicStoryPage {
  pageNumber: number;
  text: string;           // 30-60字的故事文本，妈妈讲故事风格
  imagePrompt: string;     // AI生图prompt，英文水彩绘本风格
}

export interface ClassicStory {
  id: string;
  title: string;
  category: string;       // 分类：安徒生童话、格林童话、中国经典、伊索寓言、一千零一夜
  categoryEmoji: string;  // 分类图标
  description: string;    // 一句话简介
  ageRange: string;       // 适合年龄
  pages: ClassicStoryPage[];
}

// 统一的图片风格
const IMAGE_STYLE = "Watercolor children's book illustration, soft warm colors, cozy bedtime story style, gentle and dreamy atmosphere";

// 安徒生童话 (5个)
const andersenStories: ClassicStory[] = [
  {
    id: "ugly-duckling",
    title: "丑小鸭",
    category: "安徒生童话",
    categoryEmoji: "🇩🇰",
    description: "丑小鸭历经艰辛，最终变成美丽天鹅的励志故事",
    ageRange: "3-6岁",
    pages: [
      { pageNumber: 1, text: "从前，在一个美丽的农场里，鸭妈妈孵出了一窝小鸭子。其中有一只特别不一样，毛色灰灰的，个子大大的，大家都叫它丑小鸭。", imagePrompt: `${IMAGE_STYLE}, a mother duck sitting on eggs in a cozy barn, farm animals nearby, warm golden sunlight, gentle countryside atmosphere` },
      { pageNumber: 2, text: "鸭哥哥鸭姐姐们都不喜欢丑小鸭，还欺负它。小鸟们见了它也躲开。丑小鸭好伤心，偷偷地流眼泪。", imagePrompt: `${IMAGE_STYLE}, a fluffy gray duckling looking sad, surrounded by yellow ducklings playing together, farm setting with barn and fence, soft afternoon light` },
      { pageNumber: 3, text: "丑小鸭再也受不了了，它悄悄地离开了农场。它走过寒冷的森林，趟过结冰的小溪，一路上又饿又累。", imagePrompt: `${IMAGE_STYLE}, a small gray duckling walking alone through a snowy forest, bare trees, cold winter atmosphere, footprints in the snow, gentle and non-scary` },
      { pageNumber: 4, text: "丑小鸭来到了一个湖边，看见一群美丽的天鹅在游泳。它好羡慕啊，心想：要是我也能变得那么漂亮就好了。", imagePrompt: `${IMAGE_STYLE}, a beautiful lake with graceful white swans swimming peacefully, autumn trees reflecting on water, serene and magical atmosphere` },
      { pageNumber: 5, text: "寒冷的冬天来了，雪花飘飘。丑小鸭躲进了芦苇丛里，冻得浑身发抖，但它还是坚强地等待着春天。", imagePrompt: `${IMAGE_STYLE}, a gray duckling nestled in reed grass, light snow falling gently, distant warm cottage lights glowing, peaceful winter scene` },
      { pageNumber: 6, text: "春天终于来了！丑小鸭伸了个懒腰，忽然发现自己倒映在水里的影子变了——它变成了一只美丽的白天鹅！", imagePrompt: `${IMAGE_STYLE}, a majestic white swan with long graceful neck on a crystal clear lake, spring flowers blooming nearby, warm sunshine, magical transformation moment` },
      { pageNumber: 7, text: "小朋友们看到这么美丽的天鹅，都跑过来欢呼。丑小鸭低下头，心里又紧张又开心，不知道大家会不会认出它。", imagePrompt: `${IMAGE_STYLE}, children in colorful clothes running towards a beautiful white swan on a meadow, joyful faces, spring flowers and green grass, happy atmosphere` },
      { pageNumber: 8, text: "丑小鸭抬起头，展开雪白的翅膀，在天空中划出优美的弧线。它明白了：不管长得多丑，只要心灵美，就能变成最漂亮的白天鹅。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a beautiful white swan flying gracefully against a sunset sky with pink and orange clouds, peaceful and inspiring ending, gentle dreamy atmosphere` }
    ]
  },
  {
    id: "thumbelina",
    title: "拇指姑娘",
    category: "安徒生童话",
    categoryEmoji: "🇩🇰",
    description: "一位只有拇指那么大的小姑娘的奇妙冒险",
    ageRange: "3-6岁",
    pages: [
      { pageNumber: 1, text: "很久很久以前，有一对老夫妻，他们多么想要一个小孩子啊！老婆婆种下一颗神奇的花种子，浇了水，晒了太阳，花儿开了，里面坐着一个小小的小姑娘。", imagePrompt: `${IMAGE_STYLE}, an elderly couple looking lovingly at a tiny doll-sized girl sitting in a beautiful flower, cozy cottage interior, warm candlelight, magical and cozy atmosphere` },
      { pageNumber: 2, text: "小姑娘只有拇指那么大，大家都叫她拇指姑娘。她住在一个漂亮的胡桃壳小床里，每天吃着花蜜、喝着露水，过得可开心啦。", imagePrompt: `${IMAGE_STYLE}, a tiny beautiful girl the size of a thumb sleeping in a walnut shell cradle lined with rose petals, morning dew on flower petals around her, enchanting miniature world` },
      { pageNumber: 3, text: "一天晚上，一只癞蛤蟆把拇指姑娘抱走了，想让她嫁给自己的儿子。拇指姑娘好害怕呀，眼泪滴答滴答地流下来。", imagePrompt: `${IMAGE_STYLE}, a tiny delicate girl sitting on a lily pad in a moonlit pond, a frog sitting nearby watching her, tears glistening on her cheek, water lilies and lotus flowers` },
      { pageNumber: 4, text: "小鱼们帮拇指姑娘逃走了。她顺着河流漂啊漂，来到了一片金灿灿的麦田里。在那里，她遇到了善良的金龟子先生。", imagePrompt: `${IMAGE_STYLE}, a tiny girl floating on a leaf down a gentle stream, colorful fish swimming alongside, towards golden wheat fields in the background, magical forest stream` },
      { pageNumber: 5, text: "金龟子带着拇指姑娘飞过森林，越过山丘。可是别的金龟子不喜欢她，说她长得不够漂亮。金龟子先生只好把拇指姑娘留在一片温暖的叶子上。", imagePrompt: `${IMAGE_STYLE}, a tiny girl sitting sadly on a large green leaf in a sunlit meadow, a beautiful beetle nearby, butterflies and wildflowers, gentle breeze` },
      { pageNumber: 6, text: "夏天过去了，秋天来了，冬天又冷又漫长。拇指姑娘住进了田鼠婆婆温暖的地洞里，每天帮田鼠婆婆干活，日子过得还算安稳。", imagePrompt: `${IMAGE_STYLE}, a tiny cozy underground room with a kind old mouse, a tiny girl helping sort seeds and nuts, warm candlelight, comfortable home atmosphere` },
      { pageNumber: 7, text: "有一天，田鼠婆婆要拇指姑娘嫁给隔壁的鼹鼠先生。拇指姑娘不愿意，她想起了曾经在天上飞的日子。一只受伤的燕子飞来了，拇指姑娘细心地照顾它。", imagePrompt: `${IMAGE_STYLE}, a tiny girl gently caring for a wounded swallow wrapped in a soft cloth, underground cozy room, caring and warm moment, soft golden light` },
      { pageNumber: 8, text: "春天来了，燕子康复了，带着拇指姑娘飞到了一个开满鲜花的温暖国度。在那里，拇指姑娘遇到了一个同样大小的花王子，他们幸福地生活在一起了。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a beautiful tiny girl dancing joyfully with a tiny flower prince in a garden full of colorful spring flowers, butterflies around them, golden sunshine, happy ending` }
    ]
  },
  {
    id: "flower-of-ida",
    title: "小意达的花儿",
    category: "安徒生童话",
    categoryEmoji: "🇩🇰",
    description: "小意达的花儿们在月光下跳舞的奇妙故事",
    ageRange: "3-6岁",
    pages: [
      { pageNumber: 1, text: "小意达有一个美丽的花园，里面种满了各种各样的花。黄的、红的、紫的，漂亮极了！每天早上，小意达都会给花儿浇水，和它们说悄悄话。", imagePrompt: `${IMAGE_STYLE}, a little girl in a sunny garden watering colorful flowers, butterflies and bees, beautiful cottage garden with roses, tulips and daisies, cheerful morning atmosphere` },
      { pageNumber: 2, text: "一天，小意达发现花园里的花儿都垂下了头，花瓣也掉落了几片。小意达好担心啊，轻轻地问：花儿们，你们怎么啦？是不是生病了？", imagePrompt: `${IMAGE_STYLE}, a worried little girl looking at wilted flowers with drooping petals, fallen petals on the ground, soft morning light, garden with empty birdcage nearby` },
      { pageNumber: 3, text: "晚上，小意达躺在床上睡不着。月光透过窗帘照进来，柔柔的、暖暖的。突然，她听见窗外传来轻轻的音乐声。", imagePrompt: `${IMAGE_STYLE}, a little girl in bed with moonlight streaming through the window, musical notes floating in the air, dreamy nighttime bedroom with stuffed toys, silver moonlight` },
      { pageNumber: 4, text: "小意达悄悄爬起来，趴在窗台上往外看。哎呀！花园里的花儿都活啦！它们从花盆里跳出来，排着队，跳起了欢快的舞蹈。", imagePrompt: `${IMAGE_STYLE}, magical garden at night with dancing flowers, tulips bowing and roses swaying, fairy lights glowing, full moon in the sky, enchanting and whimsical scene` },
      { pageNumber: 5, text: "郁金香举着高高的酒杯，骄傲地转圈圈；紫罗兰散发着淡淡的香味，轻轻地摇晃；还有那些小小的雏菊，就像一群小星星眨着眼睛。", imagePrompt: `${IMAGE_STYLE}, close up of dancing tulips and violets in moonlight, dancing flowers wearing tiny crowns, magical sparkles around them, soft purple and pink night sky` },
      { pageNumber: 6, text: "小意达忍不住轻轻笑了起来。窗外飘来一朵温柔的蓝色飞燕花，它飞进房间，牵着意达的手说：想和我们一起跳舞吗？", imagePrompt: `${IMAGE_STYLE}, a gentle blue flower flying into a little girl's bedroom, offering its petals as a hand, stars and moon visible through window, magical invitation scene` },
      { pageNumber: 7, text: "小意达和花儿们一起跳舞，转啊转啊，开心极了。跳累了，花儿们就回到各自的盆里，安静地睡着了。小意达也打了个哈欠，回到床上。", imagePrompt: `${IMAGE_STYLE}, exhausted but happy flowers returning to their pots one by one, tucking themselves in, a little girl yawning in her cozy bed, peaceful moonlit room` },
      { pageNumber: 8, text: "第二天早上，小意达又去看她的花儿们。呀！它们精神多了，花瓣舒展着，好像在对她笑呢。小意达开心地说：原来，花儿晚上也会开舞会呀！晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a happy little girl surrounded by vibrant healthy flowers in her garden, flowers looking fresh and bright, morning sunshine, butterflies landing on petals, joyful scene` }
    ]
  },
  {
    id: "nightingale",
    title: "夜莺",
    category: "安徒生童话",
    categoryEmoji: "🇩🇰",
    description: "中国皇帝的夜莺用歌声带来温暖的治愈故事",
    ageRange: "4-7岁",
    pages: [
      { pageNumber: 1, text: "很久以前，中国有一位皇帝。他的宫殿非常非常大，有一座漂亮的花园，花园里住着一只会唱歌的夜莺。它的歌声比铃铛还清脆，比溪水还动听。", imagePrompt: `${IMAGE_STYLE}, a magnificent Chinese imperial palace with ornate architecture, a beautiful garden with cherry blossoms, a small brown nightingale singing on a tree branch, golden evening light` },
      { pageNumber: 2, text: "皇帝听说后，就派人去找那只夜莺。可是找遍了整个花园，只听到它在树枝上唱歌，却怎么也找不到。最后一个小姑娘指着树干说：它就在那儿呢！", imagePrompt: `${IMAGE_STYLE}, the emperor and his ministers looking up at a tree in a Chinese garden, a small girl pointing at a tiny nightingale on a branch, curious and amazed expressions` },
      { pageNumber: 3, text: "皇帝听了夜莺的歌声，开心极了！从此，夜莺就住在皇宫里，每天给皇帝唱歌。它唱森林里的风，唱大海上的浪花，皇帝听得都入了迷。", imagePrompt: `${IMAGE_STYLE}, a beautiful nightingale perched on an ornate golden cage in an imperial throne room, the emperor listening contentedly with eyes closed, silk screens and candles around` },
      { pageNumber: 4, text: "有一天，皇帝收到了一份礼物——一只人造的夜莺，浑身镶满了宝石。一按开关，它就能唱同一首歌。渐渐地，皇帝不那么喜欢真的夜莺了。", imagePrompt: `${IMAGE_STYLE}, an ornate jeweled mechanical nightingale on a velvet cushion, sparkling gems, a slightly lonely real nightingale looking through the window, palace interior` },
      { pageNumber: 5, text: "真的夜莺悄悄地飞走了，回到了森林里。人们渐渐忘记了它，只有那只人造夜莺日夜唱着机械的歌。", imagePrompt: `${IMAGE_STYLE}, a tiny brown nightingale flying away from a palace window at sunset, distant palace towers, a forest waiting in the background, slightly melancholic but hopeful atmosphere` },
      { pageNumber: 6, text: "过了很久很久，有一天晚上，皇帝生病了。肚子疼得厉害，闭上眼睛就做噩梦。人造夜莺唱了一百遍，可皇帝的病一点也没好。", imagePrompt: `${IMAGE_STYLE}, an elderly emperor lying sick in bed, dark circles under his eyes, a jeweled mechanical nightingale nearby, dim candlelight, worried expressions from servants outside the door` },
      { pageNumber: 7, text: "就在这时，窗外传来了轻轻的歌声。那是真正的夜莺！它飞回来了，轻轻地落在皇帝的窗台上，唱起了温柔的摇篮曲。", imagePrompt: `${IMAGE_STYLE}, a small nightingale perched on a sill singing, moonlight streaming in, the emperor's eyes opening with tears of joy, warm healing light emanating from the bird, peaceful scene` },
      { pageNumber: 8, text: "听着夜莺的歌声，皇帝觉得浑身都舒服了，病也慢慢好了。从此，皇帝明白了：真正的美好，是任何珠宝都比不了的。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a happy healthy emperor smiling peacefully with a nightingale on his finger, bright morning sunshine through the window, flowers blooming, restored garden in full bloom` }
    ]
  },
  {
    id: "princess-pea",
    title: "豌豆公主",
    category: "安徒生童话",
    categoryEmoji: "🇩🇰",
    description: "一位真正的公主，皮肤娇嫩得像丝绸",
    ageRange: "3-6岁",
    pages: [
      { pageNumber: 1, text: "很久很久以前，有一个王子，他想娶一位真正的公主。可是，怎么才能知道是不是真正的公主呢？王子的妈妈——老王后想出了一个办法。", imagePrompt: `${IMAGE_STYLE}, a handsome prince standing in a grand castle hall looking thoughtful, an elderly queen sitting on a throne, ornate medieval castle interior, stained glass windows` },
      { pageNumber: 2, text: "老王后在床底下放了一颗小小的豌豆，然后在上面铺了二十层厚厚的床垫，再铺上二十层柔软的被子。准备好了，测试就开始啦。", imagePrompt: `${IMAGE_STYLE}, servants placing many soft mattresses and blankets on a royal bed, a tiny green pea hidden underneath, curious expressions, royal bedroom with velvet drapes` },
      { pageNumber: 3, text: "那天晚上，外面下起了好大好大的雨。天空轰隆隆地响着可怕的雷声，还刮着呼呼的大风。这时候，有人敲响了城堡的大门。", imagePrompt: `${IMAGE_STYLE}, a grand castle with lightning and heavy rain outside, a small figure knocking on the ornate wooden door, dramatic stormy night sky, wind blowing trees` },
      { pageNumber: 4, text: "门口站着一位姑娘，浑身上下都湿透了。她说她是一位公主，想在这里借住一晚。大家都有些怀疑——浑身泥水的公主？", imagePrompt: `${IMAGE_STYLE}, a delicate young woman in wet torn dress standing at a castle doorway, servants looking skeptical, candlelight from inside illuminating her face, rain falling behind her` },
      { pageNumber: 5, text: "老王后没有说话，只是让侍女给她铺好床。她们在床垫上放了一件小衬衫，想看看公主会不会觉得不舒服。", imagePrompt: `${IMAGE_STYLE}, servants preparing a royal bed with many soft layers, the princess about to lie down, an old queen watching from a chair, lavish bedroom with candles` },
      { pageNumber: 6, text: "第二天早上，大家问公主睡得好不好。公主皱着眉头说：哎呀，我的背好难受啊，床上好像有什么东西，硬邦邦的，害我一整晚都没睡好呢。", imagePrompt: `${IMAGE_STYLE}, the princess sitting up in bed rubbing her back, looking tired but polite, curious servants and the queen listening, morning light in the bedroom` },
      { pageNumber: 7, text: "老王后笑了：啊哈！果然是一位真正的公主！皮肤娇嫩得连二十层床垫和被子都隔着难受呢。", imagePrompt: `${IMAGE_STYLE}, the queen smiling happily and pointing at a tiny pea under the mattresses, the princess looking confused but adorable, relieved expressions, warm cozy bedroom scene` },
      { pageNumber: 8, text: "王子高兴极了，这正是他一直在找的真正的公主啊！后来，王子和公主结了婚，过上了幸福的生活。那颗豌豆呢？被送进了博物馆，再也不用当床垫啦！晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a prince and princess happily married dancing in a grand ballroom, guests cheering, flowers everywhere, a tiny pea displayed in a glass case nearby, joyful celebration` }
    ]
  }
];

// 格林童话 (4个)
const grimmStories: ClassicStory[] = [
  {
    id: "star-silver",
    title: "星星银币",
    category: "格林童话",
    categoryEmoji: "🇩🇪",
    description: "善良小女孩的善行感动了天上的星星",
    ageRange: "3-6岁",
    pages: [
      { pageNumber: 1, text: "很久以前，有一个贫穷但善良的小女孩。她没有爸爸，没有妈妈，穿着一身破旧的衣服，住在一间小小的茅草屋里。", imagePrompt: `${IMAGE_STYLE}, a small poor cottage with a thatched roof in a quiet village, a tiny girl in worn clothes sitting outside, snow falling gently, village houses in background, winter evening` },
      { pageNumber: 2, text: "虽然自己什么都没有，但小女孩看到别人有困难，总会尽力去帮助。有一天，她把自己的面包分给了饥饿的小鸟，把自己的水送给口渴的小花。", imagePrompt: `${IMAGE_STYLE}, a kind little girl sharing her bread with small birds on her palm, tiny flowers around her being watered, warm golden glow, gentle snowflakes falling, charitable heart` },
      { pageNumber: 3, text: "到了晚上，天上的星星们从云彩后面探出头来。最亮的那颗星星对小女孩说：你的善良感动了我们，我要送给你一份礼物。", imagePrompt: `${IMAGE_STYLE}, a night sky full of twinkling stars, one brightest star smiling down, a little girl looking up in wonder, gentle clouds, silver moonlight illuminating the cottage` },
      { pageNumber: 4, text: "说着，一颗闪亮的银币从天上飘落下来，稳稳地落在小女孩的手心里。哇，小女孩高兴得跳了起来！", imagePrompt: `${IMAGE_STYLE}, a glowing silver coin floating down from starry sky into a little girl's outstretched hands, sparkles and stardust, magical night scene, wonder on the girl's face` },
      { pageNumber: 5, text: "小女孩用这颗银币买了一些食物，不再饿肚子了。第二天晚上，又一颗星星落下来；第三天晚上，又是一颗。善良的小女孩越来越幸福了。", imagePrompt: `${IMAGE_STYLE}, a happy little girl eating bread and soup by candlelight, warm cottage interior, coins gleaming in a small wooden box nearby, cozy hearth with fire` },
      { pageNumber: 6, text: "小女孩的邻居是个贪心的女孩，看到星星总是给小女孩银币，也想学着做。可是她从来不帮助别人，还欺负小动物。", imagePrompt: `${IMAGE_STYLE}, a greedy girl in nicer clothes looking at the kind girl with silver coins with jealous eyes, darker cottage interior, the kind girl's house glowing warmly next door` },
      { pageNumber: 7, text: "贪心的女孩故意把自己仅有的一点面包扔掉，然后站在门口等星星。可是天上黑漆漆的，一颗星星也没有。", imagePrompt: `${IMAGE_STYLE}, a greedy girl standing outside looking up at a dark empty sky, no stars visible, wind blowing her dress, sad and confused expression, contrast with warm lit cottage nearby` },
      { pageNumber: 8, text: "小女孩明白了：只有真正善良、愿意帮助别人的人，才能得到星星的祝福。她更加努力地帮助身边每一个需要帮助的小生命。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a kind little girl surrounded by happy animals - birds, rabbits, deer - all around her in a moonlit meadow, the brightest star shining above, peaceful magical ending` }
    ]
  },
  {
    id: "sleeping-beauty",
    title: "睡美人",
    category: "格林童话",
    categoryEmoji: "🇩🇪",
    description: "被诅咒的公主在百年后被王子唤醒的浪漫故事",
    ageRange: "3-7岁",
    pages: [
      { pageNumber: 1, text: "很久很久以前，有一个王国即将迎来小公主的诞生。国王和王后高兴极了，邀请了所有的仙女来参加满月宴会，可是……忘了邀请一位黑仙女。", imagePrompt: `${IMAGE_STYLE}, a grand royal palace decorated with banners and flowers for a celebration, a king and queen with a baby cradle in the center, wise fairy godmothers around, joyful atmosphere` },
      { pageNumber: 2, text: "黑仙女知道后非常生气，她悄悄地来到宫殿，对着小公主念起了诅咒：这个公主长大后，会被纺锤扎破手指，然后永远沉睡！", imagePrompt: `${IMAGE_STYLE}, a dark shadowy fairy with glowing green eyes appearing, a beautiful baby princess in a golden cradle, worried expressions on the king and queen, ominous atmosphere` },
      { pageNumber: 3, text: "善良的白仙女们尽力帮忙，一位仙女说：那诅咒解除不了，但我能让公主不是永远沉睡，而是沉睡一百年后，被一位英俊的王子唤醒。", imagePrompt: `${IMAGE_STYLE}, a kind white fairy with a gentle glow casting a protective light, the baby princess surrounded by soft light, the worried king and queen looking hopeful, beautiful fairy magic` },
      { pageNumber: 4, text: "公主长大了，美丽又善良。十六岁那年，她在城堡里迷了路，走进了一间小阁楼。里面坐着一位老婆婆，正在用纺锤纺线呢。", imagePrompt: `${IMAGE_STYLE}, a beautiful princess in an ornate dress exploring an old tower room, an old woman spinning with a spinning wheel, dust and cobwebs, curious expressions, castle corridor` },
      { pageNumber: 5, text: "公主从来没纺锤，伸出手指轻轻碰了一下。哎呀！她的手指被扎破了，一下子倒在地板上睡着了。奇怪的事情发生了——城堡里所有人都跟着睡着了。", imagePrompt: `${IMAGE_STYLE}, a princess pricking her finger on a spinning wheel, surrounded by magical sparkles, beginning to fall asleep, roses and thorns growing around her, fairy tale moment` },
      { pageNumber: 6, text: "城堡周围长出了好多好多玫瑰花，一层又一层，把城堡围得严严实实。一百年过去了，王子们听说这个被玫瑰包围的城堡，都想来探险。", imagePrompt: `${IMAGE_STYLE}, a handsome prince approaching a magnificent castle completely covered in beautiful blooming roses, thorns forming an impenetrable wall, golden sunset sky, adventurous atmosphere` },
      { pageNumber: 7, text: "这位王子不怕玫瑰的刺，他穿过花丛，轻轻地走进城堡。他看到公主静静地躺在床上，美丽得像一朵盛开的花。王子忍不住低下头，轻轻吻了她一下。", imagePrompt: `${IMAGE_STYLE}, a handsome prince kneeling beside a sleeping princess on a royal bed, soft light filtering through tall windows, the princess looking peaceful and beautiful, magical moment` },
      { pageNumber: 8, text: "奇迹发生了！公主睁开了她美丽的眼睛，微微笑着说：是你吗？城堡里的人都醒来了，大家欢呼起来。王子和公主举行了盛大的婚礼。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a beautiful princess waking up smiling at a prince, the whole castle coming alive with happy servants and birds, sunlight streaming through windows, celebration, joy and flowers` }
    ]
  },
  {
    id: "frog-prince",
    title: "青蛙王子",
    category: "格林童话",
    categoryEmoji: "🇩🇪",
    description: "被诅咒成青蛙的王子，最终因信守承诺而恢复原形",
    ageRange: "3-6岁",
    pages: [
      { pageNumber: 1, text: "很久以前，有一个英俊的小王子。有一天，他在森林里玩，不小心把金球掉进了深深的井里。王子伤心地哭了起来。", imagePrompt: `${IMAGE_STYLE}, a handsome young prince in royal clothes crying by an old stone well in a forest, a golden ball floating in the dark water below, sad expression, dappled sunlight through trees` },
      { pageNumber: 2, text: "就在这时，井里跳出一只绿色的小青蛙，它眨眨大眼睛说：别哭啦，我帮你把球捡回来。但是你要答应我，让我和你做朋友，还要和你一起吃饭、睡觉。", imagePrompt: `${IMAGE_STYLE}, a cute green frog with big friendly eyes perched on the edge of a well, reaching down into the water, a golden ball in its webbed hand, the prince looking surprised` },
      { pageNumber: 3, text: "王子一心只想拿回金球，就满口答应了。小青蛙一个猛子扎进井里，不一会儿就把金球捞了上来。王子高兴极了，抱起球就跑回城堡。", imagePrompt: `${IMAGE_STYLE}, a happy prince running away from the well holding his golden ball, a surprised frog left behind on the well edge, the frog looking worried, forest path leading to castle` },
      { pageNumber: 4, text: "到了晚上，宫里正在吃晚餐。突然，窗外传来咚咚的声音：开门呀，小王子！我是你的青蛙朋友呀！小王子这才想起自己的承诺。", imagePrompt: `${IMAGE_STYLE}, a grand royal dining hall with long table, worried little prince looking at the window where a frog is knocking, surprised royal family members, candles and food on table` },
      { pageNumber: 5, text: "国王知道了这件事，严肃地对王子说：答应了别人的事情就要做到，不能做一个不守信用的人。王子听了爸爸的话，脸红了，去给青蛙开了门。", imagePrompt: `${IMAGE_STYLE}, a wise king talking to a young prince, a frog waiting at the doorway, the prince looking embarrassed, grand castle entrance, important lesson about keeping promises` },
      { pageNumber: 6, text: "小青蛙蹦蹦跳跳地进了宫殿，它想和王子坐在一起吃饭。王子嫌它湿湿的、凉凉的，一点也不喜欢。可是他还是耐着性子让青蛙坐在自己身边。", imagePrompt: `${IMAGE_STYLE}, a green frog sitting on a golden plate at a royal dinner table, a reluctant prince sitting nearby, fancy palace dinner setting, other royals watching curiously` },
      { pageNumber: 7, text: "吃完饭，青蛙说：我好困呀，想和你一起睡觉。王子勉强把青蛙放在自己柔软的小床边。可是青蛙一碰到枕头，就发出了一道亮闪闪的光。", imagePrompt: `${IMAGE_STYLE}, a young prince in bed with a cute frog beside him, suddenly magical golden light emanating from the frog, sparkles and stars filling the room, the prince's amazed expression` },
      { pageNumber: 8, text: "光芒散去，王子发现自己身边坐着一位英俊的少年——正是那个青蛙，原来他是一位被诅咒的王子。公主高兴地和他拥抱，他们成为了真正的好朋友。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a handsome prince and princess happily embracing, magic sparkles fading, the princess in a beautiful ball gown, relieved and joyful expressions, grand royal bedroom with morning light` }
    ]
  },
  {
    id: "water-of-life",
    title: "生命之水",
    category: "格林童话",
    categoryEmoji: "🇩🇪",
    description: "三兄弟寻找能治愈父亲的神奇泉水",
    ageRange: "4-7岁",
    pages: [
      { pageNumber: 1, text: "从前有一位老国王，他有三个儿子。一天，老国王生病了，病得很重。医生说：只有找到生命之水，才能救活国王。", imagePrompt: `${IMAGE_STYLE}, an elderly king lying sick in a grand royal bed, worried servants, two princes and one younger prince standing at bedside, medieval castle bedroom, concerned faces` },
      { pageNumber: 2, text: "三个儿子都想去找生命之水，救回亲爱的父亲。大儿子和二儿子觉得自己很聪明，抢先出发了。只有小儿子，骑着一匹瘦马，慢慢地也踏上了旅途。", imagePrompt: `${IMAGE_STYLE}, three princes on horseback leaving the castle gates, two older princes on strong horses racing ahead, the youngest prince on a thin old horse looking determined, castle in the background` },
      { pageNumber: 3, text: "小王子走啊走，遇见了一个小矮人。小矮人问他要去哪里。小王子很有礼貌地说：我去找生命之水，救我的父王。小矮人点点头，给了他一根针。", imagePrompt: `${IMAGE_STYLE}, a young prince on horseback meeting a tiny wise dwarf on a forest path, the dwarf handing a small golden needle to the prince, mysterious foggy forest, magical atmosphere` },
      { pageNumber: 4, text: "小王子继续走，来到了一个巨大的山洞前。他拿出那根针，针尖竟然自动转向里面。小王子走进去，发现了生命之泉——可是有一个狮子守在那里呢。", imagePrompt: `${IMAGE_STYLE}, a young prince entering a magnificent crystal cave, a majestic friendly lion guarding a glowing spring of water, crystals and gems lighting the cave, magical atmosphere` },
      { pageNumber: 5, text: "狮子温柔地说：你是个有礼貌的孩子，喝吧，喝一口就能救你的父王。小王子跪下鞠了一躬，小心翼翼地装满了水瓶。", imagePrompt: `${IMAGE_STYLE}, a noble lion allowing a polite prince to fill a bottle from a glowing magical spring, crystal clear water sparkling, the prince bowing respectfully, peaceful and sacred cave` },
      { pageNumber: 6, text: "小王子高兴地往回走，路上他把针弄丢了。神奇的针变成了那座高山里的隧道，让小王子很快就回到了家。", imagePrompt: `${IMAGE_STYLE}, a happy prince riding quickly through a mountain tunnel on his horse, the tunnel glowing with warm light, rushing home through the magical passage, relieved expression` },
      { pageNumber: 7, text: "小王子用生命之水喂父王喝下，老国王立刻就好了。大儿子和二儿子回来了，他们一路上都不礼貌，一个变成了乌鸦，一个变成了蝙蝠。", imagePrompt: `${IMAGE_STYLE}, a healthy king embracing his youngest son happily, a raven and bat flying outside the window in the background, castle great hall filled with joy, reunited family` },
      { pageNumber: 8, text: "老国王把小儿子立为继承人。后来，那只乌鸦和蝙蝠也因为小王子的善心恢复了原形。一家人又幸福地生活在一起了。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a grand royal celebration with the whole happy family, the two older brothers now human again, people dancing and celebrating, flowers and flags, happy ending in the palace courtyard` }
    ]
  }
];

// 中国经典 (6个)
const chineseStories: ClassicStory[] = [
  {
    id: "chang-e-flight",
    title: "嫦娥奔月",
    category: "中国经典",
    categoryEmoji: "🇨🇳",
    description: "嫦娥仙子飞向月宫的美丽传说",
    ageRange: "4-8岁",
    pages: [
      { pageNumber: 1, text: "很久很久以前，天上有十个太阳，晒得大地干裂，庄稼都枯萎了。勇敢的后羿射下了九个太阳，留下一个给大家温暖，人们都叫他英雄。", imagePrompt: `${IMAGE_STYLE}, a heroic archer shooting a bow against a sky with multiple suns, dry cracked earth below, mountains and rivers, mythological Chinese landscape, dramatic sky with golden light` },
      { pageNumber: 2, text: "王母娘娘奖励后羿一包仙药，说吃了可以飞到天上。后羿把仙药交给美丽的妻子嫦娥保管，并嘱咐她：一定要藏好，千万别弄丢了。", imagePrompt: `${IMAGE_STYLE}, a muscular archer handing a small glowing pouch to his beautiful wife, peach garden setting, golden sunlight, loving expressions, traditional Chinese palace garden` },
      { pageNumber: 3, text: "后羿的徒弟蓬蒙知道后起了坏心。有一天，他趁后羿出门打猎，拿刀威胁嫦娥交出仙药。嫦娥知道自己打不过他，心里着急极了。", imagePrompt: `${IMAGE_STYLE}, a villainous man with evil eyes pointing a sword at a beautiful woman in a moonlit room, startled expression on the woman, jade ornaments, traditional Chinese interior` },
      { pageNumber: 4, text: "情急之下，嫦娥打开仙药包，把所有的药都吞了下去。奇怪的事情发生了——嫦娥的身体变得轻轻的，像羽毛一样，慢慢地飘了起来。", imagePrompt: `${IMAGE_STYLE}, a beautiful woman floating upward from a garden pavilion, swirling magical lights around her, shocked expressions below, flowing robes becoming translucent, dreamlike quality` },
      { pageNumber: 5, text: "嫦娥越飘越高，越飘越高。她回头看看人间，好舍不得啊。她看见自己家的院子，看见后羿种的那棵桂花树。眼泪从她的脸颊滑落。", imagePrompt: `${IMAGE_STYLE}, a beautiful woman floating higher in a starlit sky, looking back with tears at a small courtyard below, an osmanthus tree visible, full moon rising, emotional and beautiful scene` },
      { pageNumber: 6, text: "嫦娥飘啊飘，一直飘到了月亮上。她走进广寒宫，发现这里冷冷清清的，只有捣药的玉兔陪着她。嫦娥常常望着人间，想念她的丈夫。", imagePrompt: `${IMAGE_STYLE}, a beautiful woman in an ornate palace on the moon, a small white rabbit pounding herbs nearby, crystal palace with jade furnishings, snowy moon surface, lonely but beautiful scene` },
      { pageNumber: 7, text: "后羿回到家，发现嫦娥不见了。他跑出门，看见月亮上有个身影。他明白了是怎么回事，眼泪流了下来。后羿就在院子里摆上嫦娥爱吃的东西，遥望着月亮。", imagePrompt: `${IMAGE_STYLE}, a sad archer standing in a moonlit courtyard with an altar offering fruits and sweets, looking up at the full moon, osmanthus tree, night sky with stars, longing expression` },
      { pageNumber: 8, text: "后来，人们为了纪念嫦娥，就在八月十五这一天拜月亮，感谢她给人间带来美丽的月光和中秋的团圆。现在，每年中秋节，一家人都会一起赏月吃月饼呢。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a happy family sitting together under a bright full moon in a beautiful garden, children pointing at the moon, mooncakes and tea on a table, lanterns glowing, warm family atmosphere, Chinese Mid-Autumn Festival` }
    ]
  },
  {
    id: "cowherd-weaver",
    title: "牛郎织女",
    category: "中国经典",
    categoryEmoji: "🇨🇳",
    description: "一年只能相见一次的浪漫爱情故事",
    ageRange: "4-8岁",
    pages: [
      { pageNumber: 1, text: "很久以前，有个孤儿叫牛郎。他心地善良，帮哥哥嫂子放牛，虽然日子辛苦，但他从不抱怨。一天，他救了一头受伤的老牛。", imagePrompt: `${IMAGE_STYLE}, a kind young man in traditional Chinese farmer clothes tending to a buffalo lying in a green meadow, gentle concerned expression, rolling hills and blue sky, pastoral countryside scene` },
      { pageNumber: 2, text: "老牛其实是天上金牛星变的，它感激牛郎的善良，悄悄告诉他：明天天上的仙女会来河里洗澡，你拿走那件红色的衣裳，她就会嫁给你。", imagePrompt: `${IMAGE_STYLE}, an old wise buffalo talking to a young man, magical sparkles around them, the buffalo winking, mysterious forest clearing, sunset light through trees, fairy tale atmosphere` },
      { pageNumber: 3, text: "第二天，牛郎照着老牛的话做，果然看见一群美丽的仙女在河里嬉戏。牛郎拿走了红色的衣裳，仙女们吓得飞走了，只有一位仙女留了下来——她叫织女。", imagePrompt: `${IMAGE_STYLE}, a river in a magical meadow with beautiful fairy women bathing, one in a red robe being startled, a young man hiding behind bushes nearby, willows and lotus flowers, ethereal atmosphere` },
      { pageNumber: 4, text: "织女生气地问牛郎要回衣服，牛郎为难地说：如果你嫁给我，我就还给你。织女觉得牛郎虽然穷，但很真诚，就红着脸答应了。", imagePrompt: `${IMAGE_STYLE}, a young couple talking by a river, the young man looking apologetic holding red robes, the young woman blushing shyly, love beginning to bloom, sunset reflecting on water` },
      { pageNumber: 5, text: "牛郎和织女结了婚，过上了男耕女织的幸福生活。他们有了一双可爱的儿女。老牛临死前说：我死后，你们披上我的皮就能飞起来。", imagePrompt: `${IMAGE_STYLE}, a happy family of four in a cozy cottage, a young man weaving, a beautiful woman sewing, two cute children playing, a contented buffalo lying nearby, warm homey atmosphere` },
      { pageNumber: 6, text: "天上的王母娘娘发现织女下凡了，大发雷霆。她派天兵天将去抓织女，眼看就要追上了，牛郎想起老牛的话，披上牛皮，挑起一双儿女就飞了起来。", imagePrompt: `${IMAGE_STYLE}, a young man carrying two children in baskets on a shoulder pole, flying through clouds with magical cape, fierce heavenly soldiers chasing behind, dramatic sky with lightning, epic scene` },
      { pageNumber: 7, text: "眼看就要追上了，王母娘娘拔下头上的金簪，往天上一划——一条银河出现了，把牛郎和织女隔在了两边。他们伤心地哭啊哭，眼泪像雨一样落下来。", imagePrompt: `${IMAGE_STYLE}, a vast silver river in the night sky dividing two lovers, the young man and woman reaching towards each other across the river, tears falling like rain, sad but beautiful scene` },
      { pageNumber: 8, text: "王母娘娘被他们的真情感动，允许他们每年七月七相见一次。那一天，天上的喜鹊会飞来，搭成一座鹊桥，牛郎织女就能团聚了。小宝贝，愿你也能找到真心相爱的人。晚安。", imagePrompt: `${IMAGE_STYLE}, a happy couple meeting on a bridge made of magpies in a beautiful starlit sky, other stars as witnesses, romantic and magical atmosphere,七夕 festival celebration` }
    ]
  },
  {
    id: "monkey-moon",
    title: "猴子捞月",
    category: "中国经典",
    categoryEmoji: "🇨🇳",
    description: "小猴子们想办法捞月亮的有趣故事",
    ageRange: "3-6岁",
    pages: [
      { pageNumber: 1, text: "在一座美丽的大山上，住着一群可爱的猴子。山上有一口清澈的老井，井水里倒映着圆圆的月亮，美得像一面银镜子。", imagePrompt: `${IMAGE_STYLE}, a group of cute monkeys playing on a traditional Chinese well in a mountain forest, moonlight reflection in the well, bamboo trees and rocks, serene night scene with silver moonlight` },
      { pageNumber: 2, text: "一天晚上，小猴子们玩得正开心，一只小猴子低头往井里一看，吓了一跳：哎呀不好！月亮掉进井里啦！", imagePrompt: `${IMAGE_STYLE}, a tiny monkey looking surprised into a well, other curious monkeys gathering around, moonlight on the water, shocked expressions, moon still visible in the real sky above` },
      { pageNumber: 3, text: "猴子们围过来一看，真的呢！月亮在水里晃啊晃的。小猴子急得要哭了：这可怎么办呀？月亮妈妈会着急的！", imagePrompt: `${IMAGE_STYLE}, a group of worried monkeys gathered around a well looking down, one baby monkey crying with worried expression, the moon reflection rippling in the water, concerned monkey faces` },
      { pageNumber: 4, text: "猴大王想了想说：别怕别怕！我们手拉手，一定能把月亮捞上来！猴子们高兴极了，排成一队，一只接一只地往井里伸。", imagePrompt: `${IMAGE_STYLE}, monkeys holding hands forming a chain hanging into the well, the eldest monkey at the top holding on to a tree, determined expressions, teamwork, funny but brave scene` },
      { pageNumber: 5, text: "最下面的小猴子把手伸进冰凉的水里，捞啊捞，忽然碰到了一个又凉又滑的东西。它高兴地喊：我摸到啦！", imagePrompt: `${IMAGE_STYLE}, the smallest monkey at the bottom reaching into the well water with excited expression, ripples spreading, other monkeys straining to hold on, water splashing, eager anticipation` },
      { pageNumber: 6, text: "小猴子一把抓住那东西，举起来一看：哎呀，这不是月亮，是一块亮晶晶的石头！真正的月亮还在天上好好地挂着呢。", imagePrompt: `${IMAGE_STYLE}, a monkey holding up a round stone with confused expression, the real full moon glowing in the sky above the well, other monkeys looking up and laughing, relieved funny moment` },
      { pageNumber: 7, text: "猴子们抬头一看，都愣住了，然后哈哈大笑起来。月亮在天上笑得眯着眼睛，好像在说：小傻瓜们，那是倒影呀！", imagePrompt: `${IMAGE_STYLE}, monkeys laughing and pointing at the sky where the full moon is shining brightly, relieved and happy expressions, all the monkeys having fun together, cheerful scene` },
      { pageNumber: 8, text: "虽然月亮没有捞到，但猴子们发现了一个道理：遇到事情要先动脑筋想清楚，不要盲目去做。小宝贝，你记住了吗？晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, wise old monkey teaching young monkeys under the moonlight, pointing at the moon and the well reflection, a eureka moment, friendly faces learning together, warm and educational` }
    ]
  },
  {
    id: "pony-crossing",
    title: "小马过河",
    category: "中国经典",
    categoryEmoji: "🇨🇳",
    description: "小马要过河，松鼠和大牛给了不同建议",
    ageRange: "3-6岁",
    pages: [
      { pageNumber: 1, text: "从前，有匹可爱的小马住在农村。一天，马妈妈说：小马，你长大了，帮妈妈把这袋麦子驮到磨坊去吧。小马高兴地出发了。", imagePrompt: `${IMAGE_STYLE}, a cute foal saying goodbye to its mother in front of a cozy farmhouse, carrying a sack of wheat, sunny countryside with fields, mother horse looking proud, countryside path ahead` },
      { pageNumber: 2, text: "小马跑啊跑，来到一条小河边。河水哗哗地流着，小马不知道能不能过去。它低下头问牛伯伯：牛伯伯，这条河深吗？我能过去吗？", imagePrompt: `${IMAGE_STYLE}, a small brown pony at a riverbank asking a big friendly cow standing nearby, the cow thinking, clear river water flowing, green grass on both banks, peaceful riverside scene` },
      { pageNumber: 3, text: "牛伯伯抬起头说：河水很浅啊，只到我小腿这里，你可以过去的。小马听了，正准备下水，突然传来一个声音：小马！小马！", imagePrompt: `${IMAGE_STYLE}, a big cow nodding reassuringly while a small squirrel on a nearby tree calls out excitedly, the pony looking between them, calm river with stepping stones, uncertain expression` },
      { pageNumber: 4, text: "是小松鼠！它紧张地跳下来说：不能过不能过！河水可深了！我的小伙伴前两天刚掉进去，差一点就淹死了！", imagePrompt: `${IMAGE_STYLE}, a tiny squirrel with worried expression jumping down from a tree to warn a small pony, tearful eyes, shaking tiny paws, the pony looking surprised and confused, rushing river` },
      { pageNumber: 5, text: "小马不知道该听谁的啦。它看看牛伯伯，牛伯伯说水浅；又看看小松鼠，小松鼠说水很深。小马为难地说：那我该怎么办呢？", imagePrompt: `${IMAGE_STYLE}, a confused little pony standing in the middle thinking hard, big question marks above its head, comparing the tiny squirrel and big cow nearby, river flowing between them` },
      { pageNumber: 6, text: "小马跑回家问妈妈。马妈妈笑着说：傻孩子，遇到问题要自己试着想想。别人的话有道理，但适不适合你，还要自己去试试呀。", imagePrompt: `${IMAGE_STYLE}, a wise mother horse hugging her foal in a warm stable, smiling kindly, stable filled with hay and warmth, mother explaining gently, warm loving scene` },
      { pageNumber: 7, text: "小马明白了。它小心地走进河里，慢慢地、慢慢地试探着前进。原来，河水既不像牛伯伯说的那么浅，也不像小松鼠说的那么深。", imagePrompt: `${IMAGE_STYLE}, a brave little pony wading carefully through a river, water reaching its belly, looking confident, small ripples around it, the squirrel and cow watching proudly from the banks` },
      { pageNumber: 8, text: "小马顺利地过了河，把麦子送到了磨坊。通过这件事，小马学会了一个道理：做事要亲自去试试，才能知道最好的方法。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a happy pony arriving at a flour mill with its delivery, mill wheel turning, grateful miller thanking the pony, sunshine and dust particles, proud achievement, successful ending` }
    ]
  },
  {
    id: "magic-brush",
    title: "神笔马良",
    category: "中国经典",
    categoryEmoji: "🇨🇳",
    description: "穷孩子马良得到神笔，帮助穷人的故事",
    ageRange: "4-8岁",
    pages: [
      { pageNumber: 1, text: "从前有个叫马良的穷孩子，他特别喜欢画画。可是家里穷得连一支笔都买不起，他只能用树枝在沙地上画。", imagePrompt: `${IMAGE_STYLE}, a young boy in poor traditional Chinese clothes drawing on sandy ground with a stick, village huts in background, determined expression, practicing every day, humble beginning` },
      { pageNumber: 2, text: "马良每天放牛、砍柴的时候都在练习画画。日复一日，他的画越来越好，连画出来的牛都能动起来呢！村子里的人都夸他是个小画家。", imagePrompt: `${IMAGE_STYLE}, a boy sketching a buffalo that seems to be coming to life on paper, magical sparkles around the drawing, villagers watching amazed, traditional Chinese village, proud and joyful` },
      { pageNumber: 3, text: "一天晚上，马良做了个梦。梦里一位白胡子老爷爷送给他一支金色的神笔：这是一支有魔法的笔，你画什么，什么就会变成真的！", imagePrompt: `${IMAGE_STYLE}, a young boy sleeping and dreaming, a wise old man with white beard in the dream handing a glowing golden brush, magical light and stars, peaceful night in a simple cottage` },
      { pageNumber: 4, text: "马良醒来，手心里真的握着一支笔！他又惊又喜，拿起笔画了一只小鸟。画完后，小鸟竟然拍拍翅膀，叽叽喳喳地飞上了天！", imagePrompt: `${IMAGE_STYLE}, an amazed boy watching a bird he just drew flying out the window, magical golden brush in his hand, papers and drawings on the floor, wonder and excitement, morning light` },
      { pageNumber: 5, text: "马良心想：我要用这支笔帮助穷苦的乡亲们！他给没有水的人家画了水井，给没有牛的人家画了黄牛。很快，大家都过上了好日子。", imagePrompt: `${IMAGE_STYLE}, a kind boy sharing his magical art with poor villagers, drawing a well with water appearing, drawing an ox that comes to life, grateful villagers, warm village scene` },
      { pageNumber: 6, text: "这件事被贪心的皇帝知道了，他派人把马良抓来，逼他画一座金山。马良摇摇头：我的笔只给穷人画，不给坏人画！", imagePrompt: `${IMAGE_STYLE}, a greedy emperor on a throne with evil ministers, demanding a young boy artist draw, the boy standing bravely with his brush, imposing palace interior, confrontation scene` },
      { pageNumber: 7, text: "皇帝气得脸都绿了，把马良关进大牢。但马良用神笔给自己画了一匹快马，逃了出来。皇帝派兵追来，马良又画了滔滔大海挡住追兵。", imagePrompt: `${IMAGE_STYLE}, a brave boy riding a magical horse escaping through a stormy magical sea he painted, waves rising high, soldiers falling back, dramatic sky, hero's escape` },
      { pageNumber: 8, text: "后来，马良回到村子里，继续用神笔帮助穷人。他的故事传遍了天下，大家都叫他“神笔马良”。小宝贝，也要像马良一样，用自己的本领帮助别人哦。晚安。", imagePrompt: `${IMAGE_STYLE}, a beloved young hero in a village helping everyone, children gathering around him happily, people living well with farm animals and crops, sunset glow, beloved and respected` }
    ]
  },
  {
    id: "nine-colored-deer",
    title: "九色鹿",
    category: "中国经典",
    categoryEmoji: "🇨🇳",
    description: "九色鹿救人不求回报的故事",
    ageRange: "4-7岁",
    pages: [
      { pageNumber: 1, text: "很久以前，有一只神奇的九色鹿。它身上的毛有九种颜色，美得像天上的彩虹。它住在恒河边的森林里，过着平静快乐的生活。", imagePrompt: `${IMAGE_STYLE}, a magnificent nine-colored deer with rainbow fur standing by a crystal river in a mystical forest, other animals nearby, golden sunlight, paradise-like setting, ethereal beauty` },
      { pageNumber: 2, text: "有一天，一个人不小心掉进了河里，他大声呼喊救命。九色鹿听到后，飞快地跑过去，毫不犹豫地跳进水里，把那个人救了上来。", imagePrompt: `${IMAGE_STYLE}, a beautiful deer jumping into a river to save a drowning man, the man reaching for the deer gratefully, clear blue water, concerned expression on deer's face, heroic rescue` },
      { pageNumber: 3, text: "那个人感激地说：谢谢九色鹿，我一定会报答你的！九色鹿摇摇头说：不用谢，只要你别告诉别人我住在这里就好了。", imagePrompt: `${IMAGE_STYLE}, a grateful man kneeling on the riverbank thanking a gentle deer, the deer speaking gently and shaking its head, forest setting with morning mist, trust and kindness` },
      { pageNumber: 4, text: "后来，国王的王后做了一个梦，梦见自己披着一件用九种颜色鹿皮做的斗篷。醒来后，国王贴出告示：谁能找到九色鹿，就重重有赏！", imagePrompt: `${IMAGE_STYLE}, a beautiful queen in a palace bedroom dreaming with the image of a rainbow deer, a golden royal proclamation on the wall, luxurious palace interior, mysterious atmosphere` },
      { pageNumber: 5, text: "那个人看到告示，起了坏心。他想：如果我告诉国王九色鹿在哪里，就能得到一大笔赏金！他跑到皇宫，把九色鹿的住处告诉了国王。", imagePrompt: `${IMAGE_STYLE}, a shifty man greedily pointing at a map in a palace, the king nodding with soldiers ready, bags of gold coins on the table, dark evil expression, betrayal revealed` },
      { pageNumber: 6, text: "国王带着军队来到森林抓九色鹿。九色鹿正在睡觉，士兵们悄悄地包围了它。就在这时，天空中传来一个声音：九色鹿，危险！", imagePrompt: `${IMAGE_STYLE}, soldiers surrounding a sleeping rainbow deer in a misty forest, bows and arrows drawn, a crow cawing warning from above, tense moment, green forest and fog` },
      { pageNumber: 7, text: "九色鹿醒来了，看见那个被自己救过的人站在国王身边，明白了是怎么回事。它勇敢地站出来说：是这个忘恩负义的人出卖了我！", imagePrompt: `${IMAGE_STYLE}, a brave deer standing tall confronting the king and pointing at the betrayer, the man looking guilty and scared, soldiers hesitating, powerful speech moment, righteous` },
      { pageNumber: 8, text: "那个人被揭穿后羞愧地低下了头，国王也被九色鹿的勇敢和善良感动了，下令永远保护九色鹿。九色鹿继续快乐地生活着，帮助每一个需要帮助的人。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a majestic rainbow deer leading happy forest animals in a beautiful paradise, the grateful king standing respectfully, the betrayer walking away ashamed, harmony and peace restored, joyful ending` }
    ]
  }
];

// 伊索寓言 (3个)
const aesopStories: ClassicStory[] = [
  {
    id: "tortoise-hare",
    title: "龟兔赛跑",
    category: "伊索寓言",
    categoryEmoji: "🇬🇷",
    description: "跑得慢的乌龟赢了跑得快的小兔子的故事",
    ageRange: "3-6岁",
    pages: [
      { pageNumber: 1, text: "从前，有一只跑得飞快的小白兔，还有一只走路慢吞吞的小乌龟。兔子总是骄傲地说：哈哈，我跑得最快，谁也比不上我！", imagePrompt: `${IMAGE_STYLE}, a proud white rabbit boasting and flexing muscles on one side, a humble tortoise with a kind smile on the other side, starting line in a meadow, sunny day, contrasting characters` },
      { pageNumber: 2, text: "乌龟听了不服气，说：那我们比一比吧！兔子哈哈大笑：好吧好吧，就让你输得心服口服！它们约好第二天到山脚下比赛。", imagePrompt: `${IMAGE_STYLE}, a humble tortoise challenging a laughing rabbit, both standing at a starting line, mountains in background, a crowd of forest animals watching curiously, friendly competition` },
      { pageNumber: 3, text: "第二天，大象裁判一声令下：预备——跑！小兔子像一阵风一样冲了出去，转眼就跑得老远。小乌龟呢，一步一步地往前爬，慢悠悠的。", imagePrompt: `${IMAGE_STYLE}, a race starting with a big elephant as referee blowing a whistle, a white rabbit racing ahead like wind leaving a trail, a determined tortoise beginning to walk slowly, dusty path` },
      { pageNumber: 4, text: "小兔子跑到半路，回头一看，小乌龟还在后面老远呢。兔子想：反正它追不上我，我先睡一觉也没关系。说着，就在路边的大树下睡着了。", imagePrompt: `${IMAGE_STYLE}, a proud rabbit lying under a big tree yawning and stretching, looking back at a tiny tortoise far behind, confident lazy smile, beautiful countryside road, peaceful moment` },
      { pageNumber: 5, text: "小乌龟可没有放弃，它一步一步地爬啊爬。太阳晒着它，风儿吹着它，但它不叫苦也不叫累。心里只有一个念头：坚持就是胜利！", imagePrompt: `${IMAGE_STYLE}, a determined tortoise crawling alone on a sunny path, passing by the sleeping rabbit, sunflowers and butterflies around, perseverance and dedication, hot afternoon sun` },
      { pageNumber: 6, text: "小乌龟超过了睡觉的小兔子，继续往前爬。爬过了一块大石头，又爬过了一片草地。终点就在前面啦！", imagePrompt: `${IMAGE_STYLE}, a proud tortoise crossing the finish line with a flag, passing by the sleeping rabbit under the tree, cheering animals waiting at the finish, triumphant determined expression` },
      { pageNumber: 7, text: "小乌龟第一个碰到了终点线！大象裁判大声宣布：乌龟赢了！周围的动物们欢呼起来，把乌龟抛得高高地。", imagePrompt: `${IMAGE_STYLE}, a humble tortoise being celebrated as the winner, other animals cheering and throwing confetti, the shocked rabbit waking up and running to the finish, joyful celebration scene` },
      { pageNumber: 8, text: "小兔子醒来了，揉揉眼睛一看：怎么啦？乌龟怎么站在领奖台上？它红着脸说：我……我太骄傲了。小宝贝，记住哦——谦虚使人进步，骄傲使人落后。晚安。", imagePrompt: `${IMAGE_STYLE}, a sheepish rabbit realizing its mistake and bowing its head in apology, a wise owl nearby nodding approvingly, the humble tortoise being celebrated, important lesson learned` }
    ]
  },
  {
    id: "lion-mouse",
    title: "狮子和老鼠",
    category: "伊索寓言",
    categoryEmoji: "🇬🇷",
    description: "小小的老鼠也能帮助大大的狮子",
    ageRange: "3-6岁",
    pages: [
      { pageNumber: 1, text: "有一天，森林之王狮子在树下睡觉。一只小老鼠不小心踩到了狮子的尾巴，狮子被惊醒了，生气地用大爪子抓住了小老鼠。", imagePrompt: `${IMAGE_STYLE}, a huge majestic lion waking up angrily catching a tiny frightened mouse by the tail, forest setting with tall trees, startled expression on lion's face, small mouse trembling` },
      { pageNumber: 2, text: "小老鼠吓得浑身发抖，苦苦哀求：狮子大王，求求你放过我吧！说不定哪天我能帮到你呢！狮子哈哈大笑：这么小的东西，能帮我什么忙？", imagePrompt: `${IMAGE_STYLE}, a tiny mouse begging a big lion with clasped paws, tearful eyes, the lion laughing heartily showing teeth, a forest clearing with sunlight filtering through trees, size contrast` },
      { pageNumber: 3, text: "狮子觉得小老鼠挺好玩的，就把它放了。小老鼠感激地说：谢谢你，大王！我永远不会忘记你的恩情！然后就一溜烟地跑走了。", imagePrompt: `${IMAGE_STYLE}, a grateful mouse bowing and thanking a noble lion who has let it go, the lion looking amused and thoughtful, forest path where the mouse runs away, generous moment` },
      { pageNumber: 4, text: "过了几天，狮子在森林里觅食，不小心被猎人布下的网罩住了。它用力挣扎，可是网越缠越紧。狮子大声吼叫：谁来帮帮我呀！", imagePrompt: `${IMAGE_STYLE}, a powerful lion tangled in a hunter's net trying to escape, vines and ropes tightening, the lion looking distressed and calling for help, dark forest atmosphere, trapped situation` },
      { pageNumber: 5, text: "小老鼠听到了狮子的叫声，赶紧跑过来。它仔细看了看那张网，然后说：大王别急，我有办法！", imagePrompt: `${IMAGE_STYLE}, a tiny mouse arriving to help a trapped lion, brave expression, examining the rope net carefully, the lion looking surprised and hopeful, forest setting, teamwork beginning` },
      { pageNumber: 6, text: "小老鼠用它尖尖的牙齿，一点一点地咬断绳索。咬啊咬啊，咬了好久好久，累得小老鼠满头大汗，但它没有放弃。", imagePrompt: `${IMAGE_STYLE}, a tiny mouse gnawing through thick ropes of a net, determination on its face, sweat drops, the big lion watching with grateful eyes, forest ground level view, patience and effort` },
      { pageNumber: 7, text: "终于，网被咬出了一个大洞！狮子从网里钻出来，高兴地转了一个圈。它感激地对小老鼠说：谢谢你救了我，我再也不小看你了！", imagePrompt: `${IMAGE_STYLE}, a freed lion emerging from a broken net embracing a tiny mouse, joyful tears, forest animals gathering to celebrate, sunlight breaking through clouds, true friendship formed` },
      { pageNumber: 8, text: "小老鼠笑着说：大王，每个人都有自己的长处呀！小看别人可不好哦。它们成为了最好的朋友。小宝贝，每个人都有自己的优点，不要小看任何人哦。晚安。", imagePrompt: `${IMAGE_STYLE}, a big lion and tiny mouse walking together as best friends through a sunny forest, flowers blooming, butterflies following them, moral about friendship and respect, happy ending` }
    ]
  },
  {
    id: "north-wind-sun",
    title: "北风和太阳",
    category: "伊索寓言",
    categoryEmoji: "🇬🇷",
    description: "北风和太阳比赛谁更有力量",
    ageRange: "3-6岁",
    pages: [
      { pageNumber: 1, text: "北风和太阳是好朋友，它们常常在一起聊天。一天，它们为了谁更有本领争吵起来。北风说：我能让树叶落下来，让河流结冰！", imagePrompt: `${IMAGE_STYLE}, personified characters - a strong blue wind spirit and a warm golden sun spirit arguing in the sky, fluffy clouds below, dramatic weather scene, autumn setting with falling leaves` },
      { pageNumber: 2, text: "太阳也不服气：我能让花儿开放，让世界变得温暖明亮！它们吵啊吵，最后决定比试一下，看看谁能让路上的行人脱掉外套。", imagePrompt: `${IMAGE_STYLE}, the wind spirit and sun spirit shaking hands agreeing to a contest, looking down at a lonely traveler on a road below, blue sky with clouds, setting up the challenge` },
      { pageNumber: 3, text: "北风先来。它鼓起大嘴巴，呼——呼——呼——使劲地吹啊吹。风越来越大，冷得刺骨。路上的行人冷得缩成一团，反而把外套裹得更紧了。", imagePrompt: `${IMAGE_STYLE}, a powerful blue wind blowing fiercely across a landscape, a traveler on a path hugging their coat tightly, trees bending in the wind, dark clouds gathering, wind swirling leaves` },
      { pageNumber: 4, text: "北风吹得脸都酸了，可是行人不但不脱外套，还戴上了围巾和帽子。北风失败了，不好意思地说：轮到你了，太阳！", imagePrompt: `${IMAGE_STYLE}, a defeated blue wind spirit sitting on a cloud looking embarrassed, the traveler now wearing more layers and a hat, wind dying down, setting sun, exhausted wind expression` },
      { pageNumber: 5, text: "太阳微微一笑，轻轻地放射出温暖的光芒。一点点，一点点，越来越暖和。阳光照在身上，暖洋洋的，舒服极了。", imagePrompt: `${IMAGE_STYLE}, a gentle warm sun shining golden rays on the earth, flowers beginning to bloom, the same traveler on the path smiling and loosening their coat, butterflies appearing, spring warmth spreading` },
      { pageNumber: 6, text: "路上的行人开始出汗了，热得受不了。一个小朋友说：好热啊！说着就把外套脱了下来。其他行人也纷纷脱掉了外套，高高兴兴地继续赶路。", imagePrompt: `${IMAGE_STYLE}, happy travelers taking off their coats joyfully, wiping sweat and smiling, the warm sun shining down, children laughing, pleasant spring meadow, success achieved gently` },
      { pageNumber: 7, text: "北风看了，低下头说：太阳，你赢了。太阳温柔地说：北风，你也很厉害呀。有时候，温和的方式比强硬的方式更有效果呢。", imagePrompt: `${IMAGE_STYLE}, the wind spirit respectfully bowing to the sun spirit, the sun waving kindly, blue sky clearing up with soft clouds, wisdom shared, friendship strengthened, peaceful reconciliation` },
      { pageNumber: 8, text: "北风和太阳又成了好朋友。小宝贝，你学会了吗？温柔和耐心往往比发脾气更能让别人愿意听你的话哦。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a warm sun and gentle breeze together in a beautiful sky, a child sleeping peacefully below in a cozy bed, stars twinkling as night falls, gentle ending, important life lesson` }
    ]
  }
];

// 一千零一夜 (2个)
const arabianStories: ClassicStory[] = [
  {
    id: "alaaddin",
    title: "阿拉丁神灯",
    category: "一千零一夜",
    categoryEmoji: "🇸🇦",
    description: "穷少年阿拉丁获得神灯，实现愿望的奇妙故事",
    ageRange: "4-8岁",
    pages: [
      { pageNumber: 1, text: "很久以前，有一个叫阿拉丁的穷孩子，他和妈妈住在一间破旧的小屋里。一天，一个神秘的魔法师找到阿拉丁，说要带他去找宝藏。", imagePrompt: `${IMAGE_STYLE}, a poor boy in worn clothes in front of a run-down cottage, a hooded magician approaching with an ominous glow, dark city alley, mysterious atmosphere, middle eastern architecture` },
      { pageNumber: 2, text: "魔法师带阿拉丁走进一座地下洞穴，里面黑漆漆的，好可怕。魔法师念了咒语，洞口打开了。里面有一盏小小的油灯，还有好多好多闪闪发光的宝石。", imagePrompt: `${IMAGE_STYLE}, two figures entering a mysterious cave full of glowing jewels, the magician holding a torch, glittering gems on cave walls, ancient magical underground world, adventure beginning` },
      { pageNumber: 3, text: "阿拉丁捡到了那盏旧油灯，正要交给魔法师，魔法师却不肯上去，想把阿拉丁留在洞里。聪明的阿拉丁用手指摩擦着油灯，突然——轰！冒出了一个巨大的灯神！", imagePrompt: `${IMAGE_STYLE}, a huge blue genie emerging from a magic lamp in a cave, magical smoke swirling, an amazed boy looking up in wonder, glittering treasure around them, magical moment` },
      { pageNumber: 4, text: "灯神说：主人，我可以实现你的愿望！阿拉丁想了想说：我要回家！灯神一挥袖子，呼——的一下，阿拉丁就回到了家里，神灯就在他手里。", imagePrompt: `${IMAGE_STYLE}, a boy transported home in a swirl of magical smoke, appearing in his simple cottage, a glowing lamp in his hands, a kind mother looking surprised, magical teleportation` },
      { pageNumber: 5, text: "阿拉丁用神灯变出了金币和好吃的，妈妈开心得哭了。后来，阿拉丁还娶了一位美丽的公主，他们过上了幸福的生活。", imagePrompt: `${IMAGE_STYLE}, a happy boy and his mother surrounded by gold coins and delicious food, warm cottage interior, joyful tears, prosperity and love, cozy candlelit scene, family happiness` },
      { pageNumber: 6, text: "可是那个坏魔法师又出现了！他用诡计换走了神灯，灯神又变成了他的仆人。阿拉丁失去了神灯，心里很难过。", imagePrompt: `${IMAGE_STYLE}, the evil magician running away with a glowing lamp, a sad boy looking on, heartbroken expression, dramatic scene in palace courtyard, scheming villain` },
      { pageNumber: 7, text: "聪明的公主想出了一个办法。她假装喜欢那盏神灯，亲自照顾它。一天晚上，坏魔法师睡着了，公主悄悄地把神灯换回了真正的那盏。", imagePrompt: `${IMAGE_STYLE}, a clever princess exchanging a real lamp for a fake one while a sleeping magician dreams, stealthy movement, palace bedroom, moonlit scene, brave princess plan` },
      { pageNumber: 8, text: "阿拉丁用神灯消灭了坏魔法师，和公主永远幸福地生活在一起。小宝贝，记住哦：真正的魔法不是灯神，而是善良、勇敢和聪明的心。晚安，小宝贝。", imagePrompt: `${IMAGE_STYLE}, a happy couple - a young man and beautiful princess - living in a magnificent palace together, a magic lamp glowing peacefully on a table, sunshine through windows, good triumphing over evil, happy ending` }
    ]
  },
  {
    id: "ali-baba",
    title: "阿里巴巴与四十大盗",
    category: "一千零一夜",
    categoryEmoji: "🇸🇦",
    description: "阿里巴巴发现强盗宝藏的奇妙故事（儿童版）",
    ageRange: "4-8岁",
    pages: [
      { pageNumber: 1, text: "很久以前，有个善良的穷人和他的哥哥住在一起。穷人叫阿里巴巴，每天上山砍柴为生。他的哥哥却很贪心，总想着发大财。", imagePrompt: `${IMAGE_STYLE}, two brothers - one poor but kind cutting wood on a mountain, one greedy counting coins indoors, contrast between simple mountain cottage and rich house, opposite lifestyles` },
      { pageNumber: 2, text: "一天，阿里巴巴在山上砍柴，突然听到远处传来马蹄声。他赶紧躲到树上，看见四十个骑马的强盗！他们抬着很多很多袋子，走进了一个山洞。", imagePrompt: `${IMAGE_STYLE}, a kind man hiding in a tree watching bandits on horses approaching a mysterious mountain cave, bags of treasure being carried, dramatic mountain landscape, adventure beginning` },
      { pageNumber: 3, text: "强盗们进了山洞，领头的大喊一声：芝麻开门！石门应声打开。阿里巴巴记住了这句话。等强盗们走了，他小声说：芝麻开门！石门真的打开了！", imagePrompt: `${IMAGE_STYLE}, a cave entrance opening with a magical word, golden treasures inside, the kind man about to enter cautiously, sparkles of magic, mysterious ancient cave, discovery moment` },
      { pageNumber: 4, text: "阿里巴巴进去一看，哇！里面全是金子、银子和珠宝！他只拿了一点点金币，装进柴火袋子里，高高兴兴地回家了。", imagePrompt: `${IMAGE_STYLE}, a humble man filling his sack with gold coins inside a magical cave, glittering treasures all around, humble expression despite riches, cave filled with ancient wealth` },
      { pageNumber: 5, text: "阿里巴巴把金币拿给妈妈看，妈妈又高兴又担心。阿里巴巴的嫂子知道后很嫉妒，她让丈夫也去拿金币。可是她丈夫太贪心，拿得太多了。", imagePrompt: `${IMAGE_STYLE}, two families comparing fortunes - one humble and grateful, one jealous and greedy, contrast in expressions and homes, coins being counted, family dynamics` },
      { pageNumber: 6, text: "贪心的哥哥在山洞里待太久，忘了怎么开门，急得大叫：芝麻开门！结果被回家的强盗听到了。强盗们发现有人偷看了秘密，决定要把知道秘密的人都除掉。", imagePrompt: `${IMAGE_STYLE}, a panicked man trapped in a cave as angry bandits surround him outside, danger approaching, tense dramatic moment, mountain night with dark clouds, peril scene` },
      { pageNumber: 7, text: "阿里巴巴和他的仆人想出了一个好办法。他们在装油的罐子里藏了士兵，趁夜色悄悄地靠近强盗的营地。然后——士兵们从油罐里跳出来，把强盗全部抓住了！", imagePrompt: `${IMAGE_STYLE}, clever soldiers emerging from oil jars under cover of night, surprising bandits, dramatic moonlit battle scene,智慧 triumphing, heroic rescue` },
      { pageNumber: 8, text: "阿里巴巴把山洞里的宝藏分给了穷人们，大家都过上了好日子。他明白了：真正的财富不是金子，而是善良和智慧。小宝贝，做一个善良又聪明的人，比什么都重要哦。晚安。", imagePrompt: `${IMAGE_STYLE}, a generous man sharing treasure with grateful villagers, everyone living happily, children laughing and playing, prosperous peaceful village, moral of the story, warm happy ending` }
    ]
  }
];

// 合并所有故事
export const CLASSIC_STORIES: ClassicStory[] = [
  ...andersenStories,
  ...grimmStories,
  ...chineseStories,
  ...aesopStories,
  ...arabianStories
];

// 按分类获取故事
export const getStoriesByCategory = (category: string): ClassicStory[] => {
  return CLASSIC_STORIES.filter(story => story.category === category);
};

// 获取所有分类
export const STORY_CATEGORIES = [
  { name: "安徒生童话", emoji: "🇩🇰", count: andersenStories.length },
  { name: "格林童话", emoji: "🇩🇪", count: grimmStories.length },
  { name: "中国经典", emoji: "🇨🇳", count: chineseStories.length },
  { name: "伊索寓言", emoji: "🇬🇷", count: aesopStories.length },
  { name: "一千零一夜", emoji: "🇸🇦", count: arabianStories.length },
];
