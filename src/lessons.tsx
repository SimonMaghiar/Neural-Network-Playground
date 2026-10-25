import type { ReactNode } from 'react'
import type { LayerSpec } from './nn/network'
import { lessonPresets, type Preset } from './nn/presets'
import { SquishCurve } from './ui/SquishCurve'
import { Term } from './ui/Term'

/** Which parts of the playground are visible. Lessons reveal them gradually. */
export interface Features {
  inputs: boolean
  recipe: boolean
  handTune: boolean
  fitChart: boolean
  mistakes: boolean
  stats: boolean
  step: boolean
  train: boolean
  speed: boolean
  learningRate: boolean
  reset: boolean
  newWeights: boolean
  lossChart: boolean
  inspector: boolean
  animate: boolean
  weightLabels: boolean
}

export type Highlight = 'network' | 'inputs' | 'recipe' | 'stats' | 'step' | 'train' | 'learningRate' | 'animate' | 'fitChart'

/** What the learner has done so far in the current lesson; tasks check against this. */
export interface TaskState {
  epoch: number
  loss: number
  inputMoved: boolean
  paramEdits: number
  manualSteps: number
  forwardRuns: number
  allCorrect: boolean
  diverged: boolean
}

export interface LessonStep {
  title: string
  body: ReactNode
  task?: { text: ReactNode; hint?: ReactNode; check: (s: TaskState) => boolean; done: ReactNode }
  features: Partial<Features>
  highlight?: Highlight
}

export interface Lesson {
  id: string
  title: string
  preset: Preset
  hidden?: LayerSpec[]
  speed: number
  steps: LessonStep[]
}

export const stepKey = (lesson: number, step: number) => `${lesson}.${step}`

export const allFeatures: Features = {
  inputs: true,
  recipe: true,
  handTune: false,
  fitChart: true,
  mistakes: false,
  stats: true,
  step: true,
  train: true,
  speed: true,
  learningRate: true,
  reset: true,
  newWeights: true,
  lossChart: true,
  inspector: true,
  animate: true,
  weightLabels: true,
}

export const featuresFor = (step: LessonStep): Features => ({
  ...(Object.fromEntries(Object.keys(allFeatures).map((k) => [k, false])) as unknown as Features),
  ...step.features,
})

const look: Partial<Features> = { inputs: true }
const measure: Partial<Features> = { ...look, recipe: true, handTune: true, fitChart: true, mistakes: true, stats: true }
const nudge: Partial<Features> = { ...look, recipe: true, fitChart: true, mistakes: true, stats: true, step: true, inspector: true }
const practise: Partial<Features> = { ...nudge, train: true, speed: true, lossChart: true, reset: true }

export const lessons: Lesson[] = [
  {
    id: 'neuron',
    title: 'Meet the neuron',
    preset: lessonPresets.double,
    speed: 10,
    steps: [
      {
        title: 'Welcome!',
        body: (
          <>
            <p>
              A <Term t="neural network" /> is a program that <b>learns from examples</b> instead of being given rules.
              It powers things like photo recognition, translation and chatbots.
            </p>
            <p>
              In these short lessons you'll see, step by step, how that learning works. No maths background needed:
              if you can multiply and add, you're ready.
            </p>
            <p>
              The picture shows the smallest possible network: one input, one <Term t="neuron" />, one output. Our first
              goal: <b>teach it to double a number</b>.
            </p>
          </>
        ),
        features: {},
        highlight: 'network',
      },
      {
        title: 'Ask it a question',
        body: (
          <>
            <p>
              The square on the left is the <Term t="input" />: the question we ask. The circle on the right is the
              neuron, and the number inside it is its answer, the <Term t="output" />.
            </p>
            <p>The line between them is a connection. It carries the number from the input to the neuron.</p>
          </>
        ),
        task: {
          text: 'Move the input slider below the picture and watch the answer change.',
          check: (s) => s.inputMoved,
          done: 'The answer changes, but it isn\'t double yet. For 3 it should say 6. We have to teach it.',
        },
        features: look,
        highlight: 'inputs',
      },
      {
        title: "What's inside a neuron?",
        body: (
          <>
            <p>A neuron only does two things:</p>
            <ol>
              <li>
                It <b>multiplies</b> the input by a number called the <Term t="weight" />.
              </li>
              <li>
                It <b>adds</b> another number called the <Term t="bias" />.
              </li>
            </ol>
            <p>
              The card below the picture shows this calculation with the real numbers. Right now the weight is 0.5 and
              the bias is 1, and that is why the answers are wrong.
            </p>
          </>
        ),
        features: { ...look, recipe: true },
        highlight: 'recipe',
      },
      {
        title: 'Your turn: be the network',
        body: (
          <>
            <p>
              <b>Learning just means finding good values for the weight and the bias.</b> Before the computer does it,
              try it yourself!
            </p>
            <p>
              In the chart, the <span className="c-green">green dots</span> are the correct answers we want (0 → 0, 1 →
              2, 2 → 4, …). The <span className="c-blue">blue line</span> shows what your neuron answers right now.
            </p>
          </>
        ),
        task: {
          text: 'Drag the weight and bias sliders until the blue line goes through every green dot.',
          hint: 'Hint: what do you multiply a number by to double it? And should anything be added at the end?',
          check: (s) => s.paramEdits > 0 && s.loss < 0.01,
          done: (
            <>
              You found it: <b>weight 2, bias 0</b>. That's exactly what learning is: finding the right weights. Next,
              let's see how a computer does it automatically, without guessing.
            </>
          ),
        },
        features: { ...look, recipe: true, handTune: true, fitChart: true },
        highlight: 'recipe',
      },
    ],
  },
  {
    id: 'mistakes',
    title: 'Measuring mistakes',
    preset: lessonPresets.double,
    speed: 10,
    steps: [
      {
        title: 'How wrong is it?',
        body: (
          <>
            <p>
              You could <i>see</i> in the chart when the line was right. A computer can't look at a chart. It needs{' '}
              <b>one number that says how wrong it is</b>.
            </p>
            <p>
              So for every example it compares its answer with the correct one. The{' '}
              <span className="c-red">red lines</span> in the chart are those mistakes.
            </p>
            <p>
              Then it squares each mistake (so big mistakes count extra, and "too high" and "too low" don't cancel out)
              and averages them. The result is the <Term t="mistake score" />, shown at the top right.
            </p>
          </>
        ),
        task: {
          text: 'Drag the weight slider back and forth a few times. Watch the red lines and the mistake score.',
          check: (s) => s.paramEdits >= 4,
          done: (
            <>
              Shorter red lines = smaller mistake score. <b>Learning means making this number as small as possible.</b>
            </>
          ),
        },
        features: measure,
        highlight: 'stats',
      },
    ],
  },
  {
    id: 'nudges',
    title: 'Learning by tiny nudges',
    preset: lessonPresets.double,
    speed: 10,
    steps: [
      {
        title: 'One learning step',
        body: (
          <>
            <p>Here's the trick computers use. For each weight and bias, the network asks:</p>
            <blockquote>"If I made you a tiny bit bigger, would the mistake score go up or down?"</blockquote>
            <p>
              Then it <Term t="nudge">nudges</Term> each one a little in the direction that <b>lowers</b> the score.
              That's one <Term t="learning step" />.
            </p>
            <p>The panel on the right tells you which way the next step will nudge the bias, and by how much.</p>
          </>
        ),
        task: {
          text: 'Press "1 learning step" three times. Watch the weight and bias change and the red lines shrink.',
          check: (s) => s.manualSteps >= 3,
          done: (
            <>
              Each step made the mistakes smaller. The <span className="c-green">green</span>/
              <span className="c-red">red</span> numbers in the picture show how much each value just changed.
            </>
          ),
        },
        features: nudge,
        highlight: 'step',
      },
      {
        title: 'Let it practise',
        body: (
          <>
            <p>
              <Term t="training">Training</Term> is just repeating that step over and over. Each repetition is one round
              of practice (experts call it an <Term t="epoch" />).
            </p>
            <p>The new chart at the bottom tracks the mistake score over time.</p>
          </>
        ),
        task: {
          text: 'Press "Start learning" and watch until the network has learned to double.',
          check: (s) => s.loss < 0.001,
          done: (
            <>
              The mistake score dropped to almost 0, and the weight settled at 2 and the bias at 0. The computer found
              the same answer you did, <b>all by itself</b>.
            </>
          ),
        },
        features: practise,
        highlight: 'train',
      },
      {
        title: 'How big should a nudge be?',
        body: (
          <>
            <p>
              The size of each nudge is the <Term t="step size" /> (experts say <Term t="learning rate" />
              ).
            </p>
            <ul>
              <li>Small steps: safe, but slow.</li>
              <li>
                Too-big steps <b>overshoot</b>: the value jumps past the target, then even further back the other way,
                and the numbers explode.
              </li>
            </ul>
          </>
        ),
        task: {
          text: 'Press "Start over", drag the step size to 0.3, then press "Start learning". What happens?',
          check: (s) => s.diverged,
          done: (
            <>
              It blew up! Every nudge overshot more than the one before. Choosing a good step size matters. (Set it back
              to 0.05 and press Start over to see it work again.)
            </>
          ),
        },
        features: { ...practise, learningRate: true },
        highlight: 'learningRate',
      },
    ],
  },
  {
    id: 'bias',
    title: 'Why the bias matters',
    preset: lessonPresets.pizza,
    speed: 20,
    steps: [
      {
        title: 'Pizza prices',
        body: (
          <>
            <p>
              A pizzeria charges <b>€5 for a plain pizza, plus €2 per topping</b>. So 0 toppings costs €5 and 3 toppings
              cost €11. We'll give the network these prices and let it work out the rule.
            </p>
            <p>
              Without a bias, the neuron could only compute <i>toppings × weight</i>. With 0 toppings that's always 0,
              never €5! The <Term t="bias" /> is the <b>starting amount</b> that gets added no matter what, like a base
              price.
            </p>
          </>
        ),
        task: {
          text: 'Press "Start learning". Which number becomes 2, and which becomes 5?',
          check: (s) => s.loss < 0.001,
          done: (
            <>
              The <b>weight became 2</b> (the price per topping) and the <b>bias became 5</b> (the base price). The
              network found the pricing rule from just 6 examples.
            </>
          ),
        },
        features: practise,
        highlight: 'train',
      },
    ],
  },
  {
    id: 'yesno',
    title: 'Yes-or-no questions',
    preset: lessonPresets.beach,
    speed: 20,
    steps: [
      {
        title: 'Making a decision',
        body: (
          <>
            <p>
              Neurons can also make decisions. Should we go to the beach? <b>Only if it's sunny AND warm.</b>
            </p>
            <p>
              We use <b>1 for yes</b> and <b>0 for no</b>. Now there are two inputs, so the neuron has two weights, one
              for each input. It multiplies each input by its own weight, adds them up, then adds the bias.
            </p>
            <p>Try the four combinations with the small buttons under the picture.</p>
          </>
        ),
        features: { ...look, recipe: true },
        highlight: 'inputs',
      },
      {
        title: 'The squish',
        body: (
          <>
            <p>
              A plain sum can be any number, like 7.3 or −2. For a yes/no answer we want something between 0 and 1.
            </p>
            <p>
              So this neuron does one extra step, a <Term t="squish function" /> called <b>sigmoid</b>:
            </p>
            <SquishCurve activation="sigmoid" />
            <ul>
              <li>a big positive sum becomes almost 1 (yes)</li>
              <li>a big negative sum becomes almost 0 (no)</li>
              <li>0 becomes 0.5 (not sure)</li>
            </ul>
            <p>The map at the bottom shows the neuron's answer for every input: blue for yes, orange for no.</p>
          </>
        ),
        features: { ...look, recipe: true, fitChart: true },
        highlight: 'recipe',
      },
      {
        title: 'Train it',
        body: (
          <p>
            The table next to the map lists the 4 examples with their correct answers. Let's see whether the network
            can learn them.
          </p>
        ),
        task: {
          text: 'Press "Start learning" until all four answers have a ✓.',
          check: (s) => s.allCorrect,
          done: (
            <>
              It learned AND! Look at the recipe: both weights became big and positive, and the bias big and negative.
              The sum only gets above 0 when <b>both</b> inputs are 1, so only then does the squish say yes.
            </>
          ),
        },
        features: { ...practise, fitChart: true },
        highlight: 'train',
      },
    ],
  },
  {
    id: 'limits',
    title: "When one neuron isn't enough",
    preset: lessonPresets.hallway,
    speed: 60,
    steps: [
      {
        title: 'The hallway light',
        body: (
          <>
            <p>
              Many homes have a hallway light with a switch at each end. Flipping <i>either</i> switch toggles the
              light. So the light is on when <b>exactly one</b> switch is up.
            </p>
            <p>Let's try to teach this to a single neuron, just like the beach example.</p>
          </>
        ),
        task: {
          text: 'Press "Start learning" and let it run for at least 1000 learning steps.',
          check: (s) => s.epoch >= 1000,
          done: (
            <>
              It gave up and answers about <b>0.5 (not sure)</b> for everything. A single neuron can only split yes
              from no with <b>one straight line</b> on the map, and no straight line can separate these answers. We need
              more neurons.
            </>
          ),
        },
        features: { ...practise, fitChart: true },
        highlight: 'train',
      },
    ],
  },
  {
    id: 'hidden',
    title: 'Teamwork: hidden layers',
    preset: lessonPresets.hallway,
    hidden: [{ size: 3, activation: 'tanh' }],
    speed: 20,
    steps: [
      {
        title: 'Add some helpers',
        body: (
          <>
            <p>
              The fix: put <b>helper neurons</b> between the input and the output. Together they form a{' '}
              <Term t="hidden layer" />.
            </p>
            <p>
              Each helper learns a simpler question, for example "is at least one switch up?" or "are both up?". The
              output neuron then combines their answers.
            </p>
            <p>Every line is a connection with its own weight. Thicker lines are bigger weights; blue lines are positive and orange lines are negative.</p>
          </>
        ),
        task: {
          text: 'Press "Start learning" until all four answers are right.',
          check: (s) => s.allCorrect,
          done: 'Teamwork wins! With helpers, the network can draw a curved boundary on the map that fits the light.',
        },
        features: { ...practise, recipe: false, fitChart: true, weightLabels: true },
        highlight: 'train',
      },
      {
        title: 'Follow an answer',
        body: (
          <p>
            Let's watch one question flow through the network, layer by layer. Each neuron waits for the layer before
            it, then does its multiply, add and squish.
          </p>
        ),
        task: {
          text: 'Press "Watch the answer flow" and follow the dots.',
          check: (s) => s.forwardRuns >= 1,
          done: (
            <>
              That left-to-right flow is called a <b>forward pass</b>. Every answer a neural network gives, even from
              huge chatbots, is computed exactly like this, just with billions of neurons instead of five.
            </>
          ),
        },
        features: { ...practise, recipe: false, fitChart: true, weightLabels: true, animate: true },
        highlight: 'animate',
      },
      {
        title: 'Look inside',
        body: (
          <>
            <p>
              <b>Click any helper circle</b> to see exactly what it calculates, and <b>click any line</b> to see its
              weight. The panel on the right explains it in plain words.
            </p>
            <p>You can even drag a weight yourself and watch the answers change.</p>
          </>
        ),
        features: { ...practise, recipe: false, fitChart: true, weightLabels: true, animate: true },
        highlight: 'network',
      },
    ],
  },
  {
    id: 'done',
    title: "You did it!",
    preset: lessonPresets.hallway,
    hidden: [{ size: 3, activation: 'tanh' }],
    speed: 60,
    steps: [
      {
        title: 'What you learned',
        body: (
          <>
            <ul className="recap">
              <li>
                A <b>neuron</b> multiplies its inputs by <b>weights</b>, adds a <b>bias</b>, and sometimes{' '}
                <b>squishes</b> the result.
              </li>
              <li>
                The network measures how wrong it is with a <b>mistake score</b>.
              </li>
              <li>
                <b>Learning</b> = nudging every weight and bias a little to shrink that score, again and again.
              </li>
              <li>
                The <b>step size</b> decides how big the nudges are. Too big and it blows up.
              </li>
              <li>
                <b>Hidden layers</b> of helper neurons let a network learn patterns one neuron can't.
              </li>
            </ul>
            <p>
              Next, open the <b>Free playground</b>: try more examples (like your <code>predit.js</code> model and a
              sine wave), add layers, and experiment.
            </p>
          </>
        ),
        features: { ...allFeatures, recipe: false },
      },
    ],
  },
]
