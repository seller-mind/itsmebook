"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type AgeGroup = "2-3" | "4-6" | "7-9" | "9-12" | "";
type Animal = "dog" | "cat" | "dinosaur" | "rabbit" | "bear" | "dolphin" | "unicorn" | "monkey" | "";
type Color = "red" | "orange" | "yellow" | "green" | "blue" | "purple" | "pink" | "";
type Personality = "brave" | "curious" | "shy" | "active" | "gentle" | "stubborn";
type Theme = "courage" | "friendship" | "sharing" | "bedtime" | "adventure" | "school" | "overcome" | "";
type Location = "ocean" | "space" | "castle" | "volcano" | "forest" | "island" | "circus" | "";
type LifeEvent = "kindergarten" | "new-friend" | "afraid-dark" | "moving" | "new-sibling" | "learning-bike" | "first-day-school" | "losing-tooth" | "starting-hobby" | "";
type HairColor = "black" | "brown" | "blonde" | "red" | "";
type SkinTone = "light" | "natural" | "wheat" | "dark" | "";
type HairStyle = "short" | "ponytail" | "twin-tails" | "curly" | "";

interface ChildProfile {
  name: string;
  ageGroup: AgeGroup;
  favoriteAnimal: Animal;
  favoriteColor: Color;
  personality: Personality[];
  theme: Theme;
  location: Location;
  lifeEvent: LifeEvent;
  hairColor: HairColor;
  skinTone: SkinTone;
  hairStyle: HairStyle;
  hasGlasses: boolean;
}

const ANIMALS: { value: Animal; emoji: string; label: string }[] = [
  { value: "dog", emoji: "🐶", label: "小狗" },
  { value: "cat", emoji: "🐱", label: "猫咪" },
  { value: "dinosaur", emoji: "🦕", label: "恐龙" },
  { value: "rabbit", emoji: "🐰", label: "兔子" },
  { value: "bear", emoji: "🐻", label: "小熊" },
  { value: "dolphin", emoji: "🐬", label: "海豚" },
  { value: "unicorn", emoji: "🦄", label: "独角兽" },
  { value: "monkey", emoji: "🐵", label: "猴子" },
];

const COLORS: { value: Color; emoji: string; label: string }[] = [
  { value: "red", emoji: "❤️", label: "红" },
  { value: "orange", emoji: "🧡", label: "橙" },
  { value: "yellow", emoji: "💛", label: "黄" },
  { value: "green", emoji: "💚", label: "绿" },
  { value: "blue", emoji: "💙", label: "蓝" },
  { value: "purple", emoji: "💜", label: "紫" },
  { value: "pink", emoji: "🩷", label: "粉" },
];

const PERSONALITY: { value: Personality; emoji: string; label: string }[] = [
  { value: "brave", emoji: "💪", label: "勇敢" },
  { value: "curious", emoji: "🔍", label: "好奇" },
  { value: "shy", emoji: "😊", label: "害羞" },
  { value: "active", emoji: "🏃", label: "活泼" },
  { value: "gentle", emoji: "🤗", label: "温柔" },
  { value: "stubborn", emoji: "😤", label: "倔强" },
];

const THEMES: { value: Theme; emoji: string; label: string }[] = [
  { value: "courage", emoji: "🦁", label: "勇气" },
  { value: "friendship", emoji: "🤝", label: "友谊" },
  { value: "sharing", emoji: "🎁", label: "分享" },
  { value: "bedtime", emoji: "🌙", label: "睡前" },
  { value: "adventure", emoji: "🗺️", label: "冒险" },
  { value: "school", emoji: "🎒", label: "上学" },
  { value: "overcome", emoji: "💪", label: "克服恐惧" },
];

const LOCATIONS: { value: Location; emoji: string; label: string }[] = [
  { value: "ocean", emoji: "🌊", label: "海底" },
  { value: "space", emoji: "🚀", label: "太空" },
  { value: "castle", emoji: "🏰", label: "城堡" },
  { value: "volcano", emoji: "🌋", label: "火山" },
  { value: "forest", emoji: "🌲", label: "森林" },
  { value: "island", emoji: "🏝️", label: "岛屿" },
  { value: "circus", emoji: "🎪", label: "马戏团" },
];

const LIFE_EVENTS: { value: LifeEvent; emoji: string; label: string }[] = [
  { value: "kindergarten", emoji: "🎒", label: "上幼儿园" },
  { value: "new-friend", emoji: "👋", label: "交新朋友" },
  { value: "afraid-dark", emoji: "🌙", label: "怕黑" },
  { value: "moving", emoji: "🏠", label: "搬家" },
  { value: "new-sibling", emoji: "👶", label: "有了弟弟妹妹" },
  { value: "learning-bike", emoji: "🚲", label: "学骑车" },
  { value: "first-day-school", emoji: "🏫", label: "第一天上学" },
  { value: "losing-tooth", emoji: "🦷", label: "换牙了" },
  { value: "starting-hobby", emoji: "🎨", label: "学新才艺" },
];

const HAIR_COLORS: { value: HairColor; label: string; color: string }[] = [
  { value: "black", label: "黑色", color: "bg-gray-900" },
  { value: "brown", label: "棕色", color: "bg-amber-700" },
  { value: "blonde", label: "金色", color: "bg-yellow-300" },
  { value: "red", label: "红色", color: "bg-red-600" },
];

const SKIN_TONES: { value: SkinTone; label: string; color: string }[] = [
  { value: "light", label: "浅", color: "bg-amber-100" },
  { value: "natural", label: "自然", color: "bg-amber-200" },
  { value: "wheat", label: "小麦", color: "bg-amber-400" },
  { value: "dark", label: "深色", color: "bg-amber-800" },
];

const HAIR_STYLES: { value: HairStyle; emoji: string; label: string }[] = [
  { value: "short", emoji: "👦", label: "短发" },
  { value: "ponytail", emoji: "👧", label: "马尾" },
  { value: "twin-tails", emoji: "👧🎀", label: "双辫子" },
  { value: "curly", emoji: "🧒", label: "卷发" },
];

export default function CreatePage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [showAppearance, setShowAppearance] = useState(false);
  const [parentConfirmed, setParentConfirmed] = useState(false); // COPPA年龄门状态

  // 切换步骤时自动滚回顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const [profile, setProfile] = useState<ChildProfile>({
    name: "",
    ageGroup: "",
    favoriteAnimal: "",
    favoriteColor: "",
    personality: [],
    theme: "",
    location: "",
    lifeEvent: "",
    hairColor: "",
    skinTone: "",
    hairStyle: "",
    hasGlasses: false,
  });

  const updateProfile = <K extends keyof ChildProfile>(key: K, value: ChildProfile[K]) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const togglePersonality = (p: Personality) => {
    setProfile((prev) => ({
      ...prev,
      personality: prev.personality.includes(p)
        ? prev.personality.filter((x) => x !== p)
        : prev.personality.length < 2
        ? [...prev.personality, p]
        : prev.personality,
    }));
  };

  const canProceed = () => {
    // 必须先通过年龄门确认
    if (!parentConfirmed) return false;
    if (step === 1) return profile.name.trim() !== "" && profile.ageGroup !== "";
    if (step === 2) return profile.favoriteAnimal !== "" && profile.favoriteColor !== "";
    if (step === 3) return profile.theme !== "";
    return true;
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      // 保存到 sessionStorage 并跳转
      if (typeof window !== "undefined") {
        sessionStorage.setItem("itsmebook_child_profile", JSON.stringify(profile));
      }
      router.push("/story/select");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.push("/");
    }
  };

  const renderStepIndicator = () => (
    <div className="max-w-lg mx-auto px-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 flex-1">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s < step
                    ? "bg-primary-orange text-white"
                    : s === step
                    ? "bg-primary-orange text-white ring-4 ring-orange-100"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s < step ? "✓" : s}
              </div>
              {s < 3 && (
                <div
                  className={`flex-1 h-1 mx-1 rounded-full transition-all ${
                    s < step ? "bg-primary-orange" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex justify-between mt-2 text-xs">
        <span className={step >= 1 ? "text-primary-orange font-medium" : "text-gray-400"}>填信息</span>
        <span className={step >= 2 ? "text-primary-orange font-medium" : "text-gray-400"}>选主题</span>
        <span className={step >= 3 ? "text-primary-orange font-medium" : "text-gray-400"}>听故事</span>
      </div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* 年龄门确认区域 - COPPA/GDPR-K */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
        <h3 className="text-lg font-bold text-blue-800 mb-2">👨‍👩‍👧 家长须知</h3>
        <p className="text-sm text-blue-700 mb-4">
          本产品面向3-12岁儿童，由家长协助使用。请确认您是该儿童的家长或监护人。
        </p>
        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={parentConfirmed}
            onChange={(e) => setParentConfirmed(e.target.checked)}
            className="mt-1 w-5 h-5 text-primary-orange border-blue-300 rounded focus:ring-primary-orange"
          />
          <span className="text-sm text-blue-800">我是孩子的家长或法定监护人</span>
        </label>
      </div>

      {/* 孩子名字 */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          孩子名字 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={profile.name}
          onChange={(e) => updateProfile("name", e.target.value)}
          placeholder="输入孩子的名字，如小禾"
          disabled={!parentConfirmed}
          className={`w-full px-4 py-3 rounded-xl border outline-none transition-all text-gray-900 placeholder:text-gray-400 ${
            parentConfirmed
              ? "border-gray-200 focus:border-primary-orange focus:ring-2 focus:ring-orange-100"
              : "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
          }`}
        />
        <p className="mt-2 text-xs text-gray-400">这个名字会出现在故事的每一页</p>
      </div>

      {/* 年龄段 */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          年龄段 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-3">
          {[
            { value: "2-3" as AgeGroup, emoji: "🍼", label: "2-3岁" },
            { value: "4-6" as AgeGroup, emoji: "🎨", label: "4-6岁" },
            { value: "7-9" as AgeGroup, emoji: "📚", label: "7-9岁" },
            { value: "9-12" as AgeGroup, emoji: "🚀", label: "9-12岁" },
          ].map((age) => (
            <button
              key={age.value}
              onClick={() => updateProfile("ageGroup", age.value)}
              disabled={!parentConfirmed}
              className={`py-4 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                !parentConfirmed
                  ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                  : profile.ageGroup === age.value
                  ? "border-primary-orange bg-orange-50 text-primary-orange"
                  : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
              }`}
            >
              <span className="text-2xl">{age.emoji}</span>
              <span className="text-sm font-medium">{age.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      {/* 最喜欢的动物 */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          最喜欢的动物 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {ANIMALS.map((animal) => (
            <button
              key={animal.value}
              onClick={() => updateProfile("favoriteAnimal", animal.value)}
              className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                profile.favoriteAnimal === animal.value
                  ? "border-primary-orange bg-orange-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <span className="text-xl">{animal.emoji}</span>
              <span className={`text-xs ${profile.favoriteAnimal === animal.value ? "text-primary-orange font-medium" : "text-gray-500"}`}>
                {animal.label}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">故事里会有TA的动物朋友</p>
      </div>

      {/* 最喜欢的颜色 */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          最喜欢的颜色 <span className="text-red-500">*</span>
        </label>
        <div className="flex justify-between gap-2">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => updateProfile("favoriteColor", color.value)}
              className={`w-11 h-11 rounded-full flex items-center justify-center text-lg transition-all ${
                profile.favoriteColor === color.value
                  ? "ring-3 ring-offset-2 ring-primary-orange scale-110"
                  : "hover:scale-105"
              }`}
            >
              {color.emoji}
            </button>
          ))}
        </div>
      </div>

      {/* 性格标签 */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          性格标签 <span className="text-xs text-gray-400 font-normal">（选1-2个）</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PERSONALITY.map((p) => {
            const isSelected = profile.personality.includes(p.value);
            const isMax = profile.personality.length >= 2 && !isSelected;
            return (
              <button
                key={p.value}
                onClick={() => togglePersonality(p.value)}
                disabled={isMax}
                className={`px-4 py-2 rounded-full border-2 transition-all text-sm font-medium ${
                  isSelected
                    ? "border-primary-orange bg-orange-500 text-white"
                    : isMax
                    ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "border-gray-200 bg-gray-50 text-gray-600 hover:border-gray-300"
                }`}
              >
                {p.emoji} {p.label}
              </button>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-gray-400">性格决定故事的走向</p>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      {/* 故事主题 */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          故事主题 <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {THEMES.map((theme) => (
            <button
              key={theme.value}
              onClick={() => updateProfile("theme", theme.value)}
              className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                profile.theme === theme.value
                  ? "border-primary-orange bg-orange-50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <span className="text-xl">{theme.emoji}</span>
              <span className={`text-xs ${profile.theme === theme.value ? "text-primary-orange font-medium" : "text-gray-500"}`}>
                {theme.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 最想去的地方 */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          最想去的地方 <span className="text-xs text-gray-400 font-normal">（可选）</span>
        </label>
        <div className="grid grid-cols-4 gap-2">
          {LOCATIONS.map((loc) => (
            <button
              key={loc.value}
              onClick={() => updateProfile("location", profile.location === loc.value ? "" : loc.value)}
              className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                profile.location === loc.value
                  ? "border-primary-purple bg-purple-50"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              <span className="text-xl">{loc.emoji}</span>
              <span className={`text-xs ${profile.location === loc.value ? "text-primary-purple font-medium" : "text-gray-500"}`}>
                {loc.label}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">可选，故事场景</p>
      </div>

      {/* 正在经历的事 */}
      <div className="bg-white rounded-2xl shadow-md p-5">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          正在经历的事 <span className="text-xs text-gray-400 font-normal">（可选）</span>
        </label>
        <div className="grid grid-cols-3 gap-2">
          {LIFE_EVENTS.map((event) => (
            <button
              key={event.value}
              onClick={() => updateProfile("lifeEvent", profile.lifeEvent === event.value ? "" : event.value)}
              className={`py-3 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                profile.lifeEvent === event.value
                  ? "border-primary-purple bg-purple-50"
                  : "border-gray-200 bg-gray-50 hover:border-gray-300"
              }`}
            >
              <span className="text-xl">{event.emoji}</span>
              <span className={`text-xs ${profile.lifeEvent === event.value ? "text-primary-purple font-medium" : "text-gray-500"}`}>
                {event.label}
              </span>
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-gray-400">可选，融入孩子的真实生活</p>
      </div>

      {/* 角色外观（折叠面板） */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <button
          onClick={() => setShowAppearance(!showAppearance)}
          className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-lg">👤</span>
            <span className="text-sm font-medium text-gray-700">角色外观</span>
            <span className="text-xs text-gray-400">（可选）</span>
          </div>
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${showAppearance ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showAppearance && (
          <div className="px-5 pb-5 space-y-5 border-t border-gray-100">
            {/* 发色 */}
            <div className="pt-4">
              <label className="block text-xs text-gray-500 mb-2">发色</label>
              <div className="flex gap-3">
                {HAIR_COLORS.map((hc) => (
                  <button
                    key={hc.value}
                    onClick={() => updateProfile("hairColor", profile.hairColor === hc.value ? "" : hc.value)}
                    className={`w-11 h-11 rounded-full ${hc.color} transition-all border-2 ${
                      profile.hairColor === hc.value
                        ? "ring-3 ring-offset-2 ring-primary-orange scale-110 border-primary-orange"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    title={hc.label}
                  />
                ))}
              </div>
            </div>

            {/* 肤色 */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">肤色</label>
              <div className="flex gap-3">
                {SKIN_TONES.map((st) => (
                  <button
                    key={st.value}
                    onClick={() => updateProfile("skinTone", profile.skinTone === st.value ? "" : st.value)}
                    className={`w-11 h-11 rounded-full ${st.color} transition-all border-2 ${
                      profile.skinTone === st.value
                        ? "ring-3 ring-offset-2 ring-primary-orange scale-110 border-primary-orange"
                        : "border-gray-300 hover:scale-105"
                    }`}
                    title={st.label}
                  />
                ))}
              </div>
            </div>

            {/* 发型 */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">发型</label>
              <div className="flex gap-2">
                {HAIR_STYLES.map((hs) => (
                  <button
                    key={hs.value}
                    onClick={() => updateProfile("hairStyle", profile.hairStyle === hs.value ? "" : hs.value)}
                    className={`px-3 py-2 rounded-lg border-2 transition-all flex flex-col items-center gap-1 ${
                      profile.hairStyle === hs.value
                        ? "border-primary-orange bg-orange-50"
                        : "border-gray-200 bg-gray-50"
                    }`}
                  >
                    <span className="text-lg">{hs.emoji}</span>
                    <span className={`text-xs ${profile.hairStyle === hs.value ? "text-primary-orange font-medium" : "text-gray-500"}`}>
                      {hs.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* 眼镜 */}
            <div>
              <label className="block text-xs text-gray-500 mb-2">眼镜</label>
              <div className="flex gap-3">
                {[
                  { value: true, label: "有", emoji: "👓" },
                  { value: false, label: "没有", emoji: "😎" },
                ].map((opt) => (
                  <button
                    key={String(opt.value)}
                    onClick={() => updateProfile("hasGlasses", opt.value)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all flex items-center gap-2 ${
                      profile.hasGlasses === opt.value
                        ? "border-primary-orange bg-orange-50 text-primary-orange"
                        : "border-gray-200 bg-gray-50 text-gray-600"
                    }`}
                  >
                    <span>{opt.emoji}</span>
                    <span className="text-sm font-medium">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 via-white to-purple-50">
      {/* 顶部导航 */}
      <div className="px-4 py-4 flex items-center justify-between max-w-lg mx-auto">
        <button
          onClick={handleBack}
          className="flex items-center gap-1 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">返回</span>
        </button>
        <div className="flex items-center gap-1.5">
          <span className="text-xl">✏️</span>
          <span className="font-bold text-gray-900">创建角色</span>
        </div>
        <div className="w-16" />
      </div>

      {/* 进度指示 */}
      {renderStepIndicator()}

      {/* 主内容区 */}
      <div className="max-w-lg mx-auto px-4 pb-28">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
      </div>

      {/* 底部固定按钮 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 p-4">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className={`w-full py-4 rounded-2xl font-semibold text-base transition-all flex items-center justify-center gap-2 ${
              canProceed()
                ? "bg-gradient-to-r from-primary-orange to-primary-dark text-white shadow-lg hover:shadow-xl"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {canProceed()
              ? (step === 3 ? "生成专属绘本 →" : "下一步 →")
              : (step === 1 && !parentConfirmed
                ? "请先勾选家长确认 ☝️"
                : step === 1
                ? "请填写名字和年龄段 ☝️"
                : step === 2
                ? "请选择动物和颜色 ☝️"
                : step === 3
                ? "请选择故事主题 ☝️"
                : "下一步 →")
            }
          </button>
          {step < 3 && (
            <p className="text-center text-xs text-gray-400 mt-2">
              选填信息可以稍后补充
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
