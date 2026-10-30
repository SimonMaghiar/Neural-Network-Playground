import { Term } from '../../ui/Term'

export function BigQuestionIntro() {
  return (
    <div className="bq-story">
      <figure className="story-comic">
        <RoomOfComputers />
        <figcaption>
          In the 1940s, <b>computer</b> was a job title. Rooms full of people, many of them women, worked out long
          sums by hand for engineers and astronomers. Then machines took over the job, and nobody called those
          machines intelligent.
        </figcaption>
      </figure>

      <div className="story-nope">
        <div className="story-stamp" aria-hidden="true">
          <span>Not</span>
          <span>AI</span>
        </div>
        <p>
          So <b>“a machine doing a person’s work”</b> can’t be what AI means.
        </p>
      </div>

      <div className="story-head">
        <h2 className="story-kicker">A sharper test</h2>
        <p className="story-lead">Some tasks come with a recipe. Others make you guess.</p>
      </div>

      <div className="story-split">
        <article className="story-beat is-recipe">
          <RecipeArt />
          <h3>
            <span className="story-ico" aria-hidden="true">
              📋
            </span>
            Exact recipe
          </h3>
          <p>Fixed steps that always give the right answer.</p>
          <ul>
            <li>
              <span className="story-ico" aria-hidden="true">
                ➕
              </span>
              <span>Adding numbers</span>
            </li>
            <li>
              <span className="story-ico" aria-hidden="true">
                🏷️
              </span>
              <span>Finding a price</span>
            </li>
            <li>
              <span className="story-ico" aria-hidden="true">
                📖
              </span>
              <span>Checking whether a word is in the dictionary</span>
            </li>
          </ul>
          <p className="story-foot">Fast and reliable. It never has to decide anything.</p>
        </article>

        <article className="story-beat is-judge">
          <JudgeArt />
          <h3>
            <span className="story-ico" aria-hidden="true">
              🤔
            </span>
            Judgment call
          </h3>
          <p>Nobody can write down every right answer in advance.</p>
          <ul>
            <li>
              <span className="story-ico" aria-hidden="true">
                😎
              </span>
              <span>Is that your face, in bad light, with new glasses?</span>
            </li>
            <li>
              <span className="story-ico" aria-hidden="true">
                ♟️
              </span>
              <span>What’s the best chess move, when there are more possible games than atoms?</span>
            </li>
            <li>
              <span className="story-ico" aria-hidden="true">
                ✏️
              </span>
              <span>Did “teh” mean “the” or “tea”?</span>
            </li>
          </ul>
          <p className="story-foot">Weigh it up, and pick the most likely answer.</p>
        </article>
      </div>

      <section className="story-land">
        <TerritoryArt />
        <div>
          <h2>The territory of AI</h2>
          <p>
            That is <Term t="AI">artificial intelligence</Term>: building machines that do things that would take
            intelligence if a person did them, like recognising, reasoning and using language.
          </p>
          <div className="story-pills">
            <span className="story-pill">
              <span aria-hidden="true">🎲 </span>It can be wrong, because it judges
            </span>
            <span className="story-pill">
              <span aria-hidden="true">🧮 </span>A calculator never judges, so it can’t misjudge
            </span>
          </div>
        </div>
      </section>

      <p className="story-closer">
        How a machine gets good at judging is what the rest of this course is about.
        <span aria-hidden="true"> 👇</span>
      </p>
    </div>
  )
}

function Person({
  x,
  shirt,
  hair,
  sum,
  glasses,
}: {
  x: number
  shirt: string
  hair: 'bun' | 'bob' | 'crop'
  sum: string
  glasses?: boolean
}) {
  return (
    <g transform={`translate(${x} 24)`}>
      <path
        d="M30 150v-36c0-20 14-30 28-30s28 10 28 30v36z"
        fill={shirt}
        stroke="#231f20"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path d="M82 114c10 8 16 16 18 24" fill="none" stroke="#f3c7a0" strokeWidth="8" strokeLinecap="round" />
      <rect x="10" y="146" width="100" height="16" rx="4" fill="#fc7428" stroke="#231f20" strokeWidth="3" />
      <rect x="22" y="162" width="8" height="22" fill="#231f20" />
      <rect x="90" y="162" width="8" height="22" fill="#231f20" />
      <g transform="rotate(-7 56 136)">
        <rect x="34" y="118" width="46" height="32" rx="3" fill="#f9f4da" stroke="#231f20" strokeWidth="2.5" />
        <text x="57" y="139" textAnchor="middle" fill="#231f20" fontFamily="Outfit, sans-serif" fontSize="13" fontWeight="700">
          {sum}
        </text>
      </g>
      <path d="M98 132l16-8" stroke="#fcba28" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M112 122l5-2.5" stroke="#ed203d" strokeWidth="3" strokeLinecap="round" />
      <circle cx="58" cy="62" r="24" fill="#f3c7a0" stroke="#231f20" strokeWidth="3" />
      {hair === 'bun' && (
        <g fill="#231f20">
          <path d="M36 58c2-22 10-36 22-36s20 14 22 36c-7-8-14-11-22-11s-15 3-22 11z" />
          <circle cx="58" cy="22" r="8" stroke="#231f20" strokeWidth="3" />
        </g>
      )}
      {hair === 'bob' && (
        <path d="M34 56c1-24 12-36 24-36s23 12 24 36c-1 3-8 1-12 2-5-6-16-6-22 0-5-1-13 1-14-2z" fill="#231f20" />
      )}
      {hair === 'crop' && <path d="M38 54c1-18 8-28 20-28s19 10 20 28c-4-5-11-7-20-7s-16 2-20 7z" fill="#231f20" />}
      <circle cx="49" cy="64" r="2.4" fill="#231f20" />
      <circle cx="67" cy="64" r="2.4" fill="#231f20" />
      <path d="M50 76c5 5 12 5 17 0" fill="none" stroke="#231f20" strokeWidth="2.2" strokeLinecap="round" />
      {glasses && (
        <g fill="none" stroke="#231f20" strokeWidth="2.2">
          <circle cx="49" cy="64" r="7.5" />
          <circle cx="67" cy="64" r="7.5" />
          <path d="M56.5 64h4" />
        </g>
      )}
    </g>
  )
}

function RoomOfComputers() {
  return (
    <svg className="story-art" viewBox="0 0 640 220" role="img" aria-label="Three people working sums by hand, then a machine that only follows steps">
      <text x="14" y="18" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="13">
        1940s
      </text>
      <g>
        <rect x="118" y="2" width="108" height="24" rx="12" fill="#fcba28" stroke="#231f20" strokeWidth="2.5" />
        <text x="172" y="19" textAnchor="middle" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="12">
          THE JOB
        </text>
      </g>
      <Person x={0} shirt="#12b5e5" hair="bob" sum="17×4" />
      <Person x={116} shirt="#0ba95b" hair="bun" sum="√81" glasses />
      <Person x={232} shirt="#7b5ea7" hair="crop" sum="2+2" />
      <path d="M358 118h46" stroke="#231f20" strokeWidth="4" strokeLinecap="round" />
      <path d="M394 106l18 12-18 12" fill="none" stroke="#231f20" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <g>
        <rect x="448" y="26" width="116" height="24" rx="12" fill="#f9f4da" stroke="#231f20" strokeWidth="2.5" />
        <text x="506" y="43" textAnchor="middle" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="12">
          A MACHINE
        </text>
      </g>
      <g transform="translate(430 52)">
        <rect width="150" height="156" rx="16" fill="#12b5e5" stroke="#231f20" strokeWidth="4" />
        <rect x="16" y="16" width="118" height="48" rx="8" fill="#231f20" />
        <text x="122" y="50" textAnchor="end" fill="#7dffa1" fontFamily="Paytone One, sans-serif" fontSize="26">
          4
        </text>
        <circle cx="54" cy="80" r="5.5" fill="#231f20" />
        <circle cx="98" cy="80" r="5.5" fill="#231f20" />
        <path d="M62 102h28" stroke="#231f20" strokeWidth="4" strokeLinecap="round" />
        <rect x="28" y="118" width="24" height="14" rx="3" fill="#fcba28" stroke="#231f20" strokeWidth="2.5" />
        <rect x="64" y="118" width="24" height="14" rx="3" fill="#f38ba3" stroke="#231f20" strokeWidth="2.5" />
        <rect x="100" y="118" width="24" height="14" rx="3" fill="#f9f4da" stroke="#231f20" strokeWidth="2.5" />
      </g>
      <g transform="translate(524 186) rotate(-12)">
        <rect x="-52" y="-16" width="104" height="34" rx="7" fill="#ed203d" stroke="#231f20" strokeWidth="3" />
        <text x="0" y="7" textAnchor="middle" fill="#f9f4da" fontFamily="Paytone One, sans-serif" fontSize="15">
          NOT AI
        </text>
      </g>
      <path d="M16 212h608" stroke="#231f20" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function RecipeArt() {
  return (
    <svg className="story-art" viewBox="0 0 360 148" aria-hidden="true">
      <g transform="rotate(-5 96 78)">
        <rect x="12" y="18" width="156" height="114" rx="12" fill="#f9f4da" stroke="#231f20" strokeWidth="3" />
        <path d="M12 44h156" stroke="#231f20" strokeWidth="3" />
        <text x="90" y="38" textAnchor="middle" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="14">
          RECIPE
        </text>
        {[0, 1, 2].map((i) => (
          <g key={i} transform={`translate(32 ${66 + i * 22})`}>
            <circle cx="0" cy="0" r="8" fill="#0ba95b" stroke="#231f20" strokeWidth="2" />
            <path d="M-4 0l2.5 3 6-7" fill="none" stroke="#f9f4da" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            <rect x="16" y="-4" width={78 - i * 14} height="8" rx="3" fill="#231f20" />
          </g>
        ))}
      </g>
      <g transform="translate(188 26)">
        <rect width="112" height="102" rx="14" fill="#12b5e5" stroke="#231f20" strokeWidth="3" />
        <rect x="12" y="12" width="88" height="28" rx="6" fill="#231f20" />
        <text x="92" y="33" textAnchor="end" fill="#7dffa1" fontFamily="Paytone One, sans-serif" fontSize="18">
          4
        </text>
        <path d="M38 58c8 8 28 8 36 0" fill="none" stroke="#231f20" strokeWidth="3" strokeLinecap="round" />
        <circle cx="44" cy="50" r="2.4" fill="#231f20" />
        <circle cx="68" cy="50" r="2.4" fill="#231f20" />
        {[0, 1, 2].map((col) =>
          [0, 1].map((row) => (
            <rect
              key={`${col}-${row}`}
              x={14 + col * 30}
              y={70 + row * 16}
              width="22"
              height="10"
              rx="2"
              fill="#f9f4da"
              stroke="#231f20"
              strokeWidth="2"
            />
          )),
        )}
      </g>
      <g transform="translate(318 36) rotate(12)">
        <circle r="28" fill="#0ba95b" stroke="#231f20" strokeWidth="3" />
        <text y="-3" textAnchor="middle" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="9">
          ALWAYS
        </text>
        <text y="12" textAnchor="middle" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="13">
          RIGHT
        </text>
      </g>
    </svg>
  )
}

function JudgeArt() {
  return (
    <svg className="story-art" viewBox="0 0 360 150" aria-hidden="true">
      <circle cx="64" cy="82" r="48" fill="#f9f4da" stroke="#231f20" strokeWidth="3" />
      <g transform="rotate(-12 64 78)">
        <g fill="none" stroke="#231f20" strokeWidth="3">
          <circle cx="46" cy="76" r="14" />
          <circle cx="82" cy="76" r="14" />
          <path d="M60 76h8" />
        </g>
        <circle cx="46" cy="76" r="2.6" fill="#231f20" />
        <circle cx="82" cy="76" r="2.6" fill="#231f20" />
      </g>
      <path d="M48 104c8 6 24 6 32-2" fill="none" stroke="#231f20" strokeWidth="3" strokeLinecap="round" />
      <g transform="translate(112 14)">
        <circle r="13" fill="#fcba28" stroke="#231f20" strokeWidth="3" />
        <text y="6" textAnchor="middle" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="16">
          ?
        </text>
      </g>
      <rect x="128" y="60" width="62" height="32" rx="8" fill="#231f20" />
      <text x="159" y="82" textAnchor="middle" fill="#fcba28" fontFamily="Paytone One, sans-serif" fontSize="16">
        teh
      </text>
      <path d="M190 70C214 70 220 28 236 28" fill="none" stroke="#231f20" strokeWidth="2.5" strokeDasharray="4 3" />
      <path d="M190 76h46" fill="none" stroke="#231f20" strokeWidth="2.5" strokeDasharray="4 3" />
      <path d="M190 84C214 84 220 124 236 124" fill="none" stroke="#231f20" strokeWidth="2.5" strokeDasharray="4 3" />
      <g>
        <rect x="236" y="12" width="68" height="28" rx="8" fill="#0ba95b" stroke="#231f20" strokeWidth="2.5" />
        <text x="270" y="31" textAnchor="middle" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="14">
          the
        </text>
        <rect x="236" y="62" width="68" height="28" rx="8" fill="#fcba28" stroke="#231f20" strokeWidth="2.5" />
        <text x="270" y="81" textAnchor="middle" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="14">
          tea
        </text>
        <rect x="236" y="110" width="68" height="28" rx="8" fill="#12b5e5" stroke="#231f20" strokeWidth="2.5" />
        <text x="270" y="129" textAnchor="middle" fill="#231f20" fontFamily="Paytone One, sans-serif" fontSize="14">
          ten
        </text>
      </g>
      <g transform="translate(6 8)">
        {[0, 1, 2, 3].map((row) =>
          [0, 1, 2, 3].map((col) => (
            <rect
              key={`${row}-${col}`}
              x={col * 9}
              y={row * 9}
              width="9"
              height="9"
              fill={(row + col) % 2 ? '#231f20' : '#f9f4da'}
              stroke="#231f20"
              strokeWidth="1"
            />
          )),
        )}
        <circle cx="13" cy="13" r="3.2" fill="#f9f4da" stroke="#231f20" strokeWidth="1.5" />
        <circle cx="27" cy="22" r="3.2" fill="#ed203d" stroke="#231f20" strokeWidth="1.5" />
      </g>
    </svg>
  )
}

function TerritoryArt() {
  return (
    <svg className="story-art" viewBox="0 0 120 120" aria-hidden="true">
      <g transform="translate(74 2)" fill="none" stroke="#f9f4da" strokeWidth="2.5" strokeLinecap="round">
        <path d="M6 18H0" />
        <path d="M10 8L6 2" />
        <path d="M22 4l2-6" />
        <path d="M30 14l6-2" />
      </g>
      <g transform="translate(78 10)">
        <circle cx="14" cy="16" r="13" fill="#f9f4da" stroke="#231f20" strokeWidth="3" />
        <path
          d="M10 13c1.6 2 1.6 5 0 7M14 10v9M18 13c-1.6 2-1.6 5 0 7"
          fill="none"
          stroke="#231f20"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <rect x="9" y="28" width="10" height="5" rx="1.5" fill="#231f20" />
      </g>
      <circle cx="48" cy="74" r="36" fill="#fcba28" stroke="#231f20" strokeWidth="3" />
      <circle cx="36" cy="68" r="4" fill="#231f20" />
      <circle cx="60" cy="68" r="4" fill="#231f20" />
      <path d="M36 84c7 8 16 8 24 0" fill="none" stroke="#231f20" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
