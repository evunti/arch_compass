interface HomeProps {
  onStartTest: () => void;
}

export default function Home({ onStartTest }: HomeProps) {
  return (
    <div className="text-center space-y-8">
      <div className="space-y-4">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">
          The Archetype Compass
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Discover your inner archetype through our unique personality
          assessment. Are you a Cowboy, Pirate, Werewolf, or Vampire? Find out
          where you stand.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
        <div className="bg-emerald-100 p-4 rounded-lg border-2 border-emerald-200">
          <div className="text-2xl mb-2">🤠</div>
          <h3 className="font-semibold text-emerald-800">Cowboy</h3>
          <p className="text-sm text-emerald-600">
            Innocent · Optimistic · Trusting
          </p>
        </div>
        <div className="bg-sky-100 p-4 rounded-lg border-2 border-sky-200">
          <div className="text-2xl mb-2">☠️</div>
          <h3 className="font-semibold text-sky-800">Pirate</h3>
          <p className="text-sm text-sky-600">
            Easygoing · Balanced · Free-spirited
          </p>
        </div>
        <div className="bg-orange-100 p-4 rounded-lg border-2 border-orange-200">
          <div className="text-2xl mb-2">🐺</div>
          <h3 className="font-semibold text-orange-800">Werewolf</h3>
          <p className="text-sm text-orange-600">
            Emotional · Reactive · Passionate
          </p>
        </div>
        <div className="bg-purple-100 p-4 rounded-lg border-2 border-purple-200">
          <div className="text-2xl mb-2">🦇</div>
          <h3 className="font-semibold text-purple-800">Vampire</h3>
          <p className="text-sm text-purple-600">
            Controlled · Dominant · Intimidating
          </p>
        </div>
      </div>

      <div className="flex justify-center">
        <button
          onClick={onStartTest}
          className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors shadow-lg hover:shadow-xl"
        >
          Take the Test
        </button>
      </div>

      <h3 className="text-3xl font-bold text-gray-800 mb-4">
        Archetype Results List
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto w-full px-2">
        {/* Archetype Results List */}
        {[
          {
            key: "Cowboy",
            emoji: "🤠",
            title: "The Pure Spirit",
            description:
              "You are optimistic, kind, sincere, and hopeful. Your genuine nature draws people to you, but you may need to work on setting better boundaries to protect your generous heart.",
          },
          {
            key: "Pirate",
            emoji: "☠️",
            title: "The Balanced Rogue",
            description:
              "You are calm, adaptable, funny, and resilient. You navigate life's storms with grace and humor, though you should consider showing your deeper, more vulnerable side more often.",
          },
          {
            key: "Werewolf",
            emoji: "🐺",
            title: "The Wild Heart",
            description:
              "You are intense, emotional, and fiercely loyal. Your passion is your strength, but learning to channel it constructively will help you achieve your goals without burning out.",
          },
          {
            key: "Vampire",
            emoji: "🦇",
            title: "The Power Player",
            description:
              "You are confident, strategic, and naturally influential. Your ability to lead and persuade is remarkable, though showing vulnerability occasionally will deepen your connections.",
          },
          {
            key: "Cowboy + Pirate",
            emoji: "🤠☠️",
            title: "The Peaceful Drifter",
            description:
              "You blend optimism with adaptability, creating a harmonious approach to life. While you value peace and go with the flow, remember that asserting yourself when needed is equally important.",
          },
          {
            key: "Cowboy + Werewolf",
            emoji: "🤠🐺",
            title: "The Tender Wildling",
            description:
              "You combine warmth with intense emotion, making you deeply caring yet sometimes reactive. Finding grounding practices will help you channel your passionate nature more effectively.",
          },
          {
            key: "Cowboy + Vampire",
            emoji: "🤠🦇",
            title: "The Gentle Influencer",
            description:
              "You merge moral conviction with persuasive power, making you a natural leader who inspires through kindness. Leading with transparency will enhance your already strong influence.",
          },
          {
            key: "Pirate + Werewolf",
            emoji: "☠️🐺",
            title: "The Passionate Rebel",
            description:
              "You're adventurous, deeply feeling, and spontaneous. Your zest for life is infectious, but remember to build in time for rest and reflection to sustain your energetic approach.",
          },
          {
            key: "Pirate + Vampire",
            emoji: "☠️🦇",
            title: "The Smooth Operator",
            description:
              "You combine poise with charm, making you naturally magnetic. While your composed exterior serves you well, sharing your honest thoughts and feelings will create deeper connections.",
          },
          {
            key: "Werewolf + Vampire",
            emoji: "🐺🦇",
            title: "The Storm and the Shadow",
            description:
              "You blend emotional intensity with strategic thinking, creating a powerful combination. Balancing your compassionate heart with your desire for control will make you an exceptional leader.",
          },
          {
            key: "Cowboy + Pirate + Werewolf",
            emoji: "🤠☠️🐺",
            title: "The Golden-Hearted Hothead",
            description:
              "You're joyful, passionate, and full of life. Your enthusiasm is contagious, but learning to slow down and think before acting will help you avoid unnecessary conflicts and regrets.",
          },
          {
            key: "Pirate + Werewolf + Vampire",
            emoji: "☠️🐺🦇",
            title: "The Charismatic Wildcard",
            description:
              "You're a magnetic leader with emotional depth and strategic thinking. Your natural charisma draws people in, but creating more structure in your approach will help you achieve lasting success.",
          },
          {
            key: "Cowboy + Pirate + Vampire",
            emoji: "🤠☠️🦇",
            title: "The Gentle Strategist",
            description:
              "You combine kindness with effectiveness, making you both approachable and capable. Your balanced nature is a strength—just remember to maintain firm boundaries when necessary.",
          },
          {
            key: "Cowboy + Werewolf + Vampire",
            emoji: "🤠🐺🦇",
            title: "The Devoted Manipulator",
            description:
              "You blend emotional depth with moral conviction and influence. Your ability to lead with both heart and strategy is powerful—ensure you're always leading with empathy at the forefront.",
          },
          {
            key: "All Four",
            emoji: "⚖️",
            title: "Balanced Soul",
            description:
              "You embody all four archetypes, making you versatile, adaptable, passionate, and wise. Your ability to draw from different aspects of your personality is remarkable—just remember to stay grounded in your core values.",
          },
        ].map(({ key, emoji, title, description }) => (
          <div
            key={key}
            className="bg-white p-8 rounded-3xl border border-gray-200 flex flex-col items-center shadow-lg transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:border-purple-300 min-h-[260px] group"
          >
            <div className="text-5xl mb-4 drop-shadow-sm group-hover:scale-110 transition-transform">
              {emoji}
            </div>
            <div className="text-xs font-mono text-gray-400 mb-1 tracking-wide select-all">
              {key}
            </div>
            <h3 className="font-bold text-xl text-gray-800 mb-2 text-center tracking-tight group-hover:text-purple-700 transition-colors">
              {title}
            </h3>
            <p className="text-base text-gray-600 text-center leading-relaxed group-hover:text-gray-800 transition-colors">
              {description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
