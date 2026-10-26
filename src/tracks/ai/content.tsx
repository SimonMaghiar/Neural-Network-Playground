import { Term } from '../../ui/Term'
import type { TrackContent } from '../types'
import { AiFamily } from './sims/AiFamily'
import { GradientDescent } from './sims/GradientDescent'
import { HiddenLayers } from './sims/HiddenLayers'
import { NeuronDecision } from './sims/NeuronDecision'
import { PatternFit } from './sims/PatternFit'
import { SpamSorter } from './sims/SpamSorter'
import { TrainVsInfer } from './sims/TrainVsInfer'

export const content: TrackContent = {
  'what-is-ai': {
    goal: 'Understand the big difference between AI and normal software: AI learns its rules from examples.',
    intro: (
      <>
        <p>
          Most software is <Term t="traditional software" />: a programmer writes exact rules, step by step, and the
          computer follows them. "If the total is over €50, shipping is free." It is fast, reliable and predictable, but
          it can only do what someone managed to describe in rules.
        </p>
        <p>
          Some problems are almost impossible to write rules for. Try writing the rules for "is this a photo of a cat?"
          or "is this email spam?". There are too many cases, and every rule has exceptions.
        </p>
        <p>
          Modern <Term t="AI" /> turns the job around. Instead of writing the rules, we show the computer lots of{' '}
          <b>examples with the right answers</b>, and it works out the rules by itself. The result is called a{' '}
          <Term t="model" />. The catch: it is only as good as its examples, and it can still be wrong.
        </p>
      </>
    ),
    sim: SpamSorter,
    task: {
      text: 'Switch on some spam rules and see how they do on the new emails. Then let the computer learn from all 12 examples.',
      done: 'Your hand-written rules trip over tricky emails ("FREE coffee" is not spam). The learned model gets all 6 right, and nobody wrote a single rule.',
    },
    takeaways: [
      'Traditional software follows rules that a person wrote. It does exactly what it was told.',
      'AI learns its own rules from examples with the right answers.',
      'Learning wins on fuzzy problems (spam, faces, speech, language) where rules are impossible to write.',
      'A learned model is only as good as its examples, and it can make mistakes.',
    ],
    quiz: [
      {
        question: 'What is the main difference between traditional software and modern AI?',
        options: [
          'AI runs faster',
          'In traditional software people write the rules; AI learns the rules from examples',
          'AI never makes mistakes',
          'Traditional software cannot do math',
        ],
        answer: 1,
        explain: 'A programmer writes the rules of traditional software. An AI model finds its rules in examples.',
      },
      {
        question: 'Which task is the best fit for AI rather than hand-written rules?',
        options: [
          'Adding up a shopping bill',
          'Recognising whether a photo shows a cat',
          'Sorting names alphabetically',
          'Converting euros to cents',
        ],
        answer: 1,
        explain: 'The others have simple exact rules. Nobody can write all the rules for "what a cat looks like", but a model can learn it from photos.',
      },
      {
        question: 'Why did the learned spam filter do better on the new emails?',
        options: [
          'It was given more rules',
          'It found which words usually appear in spam and which in normal emails',
          'It read the emails more slowly',
          'It was lucky',
        ],
        answer: 1,
        explain: 'From the examples it learned that words like "claim" and "now" signal spam, while "lunch" and "Friday" signal a normal email.',
      },
    ],
    deepDive: (
      <>
        <p>
          The filter in the simulation is a tiny version of a real classic, the <b>naive Bayes</b> spam filter, which
          became popular around 2002. Real filters use probabilities instead of +1/−1 counts, learn from millions of
          emails, and look at much more than words (sender, links, formatting).
        </p>
        <p>
          "AI" is a broad term: it covers any system that does something we would call intelligent, including systems
          built entirely from hand-written rules (once called "expert systems"). Today, when people say AI, they almost
          always mean systems that learn from data. The next module sorts out these names.
        </p>
      </>
    ),
  },

  'ml-dl-llms': {
    goal: 'Know what AI, machine learning, deep learning and LLMs mean, and how they fit inside each other.',
    intro: (
      <>
        <p>
          These words are often mixed up, but they fit inside each other like nesting boxes. <Term t="AI" /> is the
          biggest box: any computer system that does something that looks intelligent.
        </p>
        <p>
          <Term t="machine learning" /> is the part of AI that <b>learns from examples</b>, like the spam filter in
          Module 1. <Term t="deep learning" /> is the part of machine learning that uses big{' '}
          <Term t="neural network">neural networks</Term> with many layers. That is what recognises faces, understands
          speech and drives most of today's AI.
        </p>
        <p>
          An <Term t="LLM" /> (Large Language Model) such as ChatGPT, Claude or Gemini is one kind of deep learning: a
          huge neural network trained on enormous amounts of text. So every LLM is deep learning, all deep learning is
          machine learning, and all machine learning is AI.
        </p>
      </>
    ),
    sim: AiFamily,
    task: {
      text: 'Sort each system into the smallest box it belongs to. Get all 7 right.',
      done: 'You can now tell them apart: rules only (AI), learning from examples (machine learning), with deep neural networks (deep learning), and deep networks trained on text (LLMs).',
    },
    takeaways: [
      'AI is the big umbrella: anything that behaves intelligently.',
      'Machine learning = AI that learns from examples instead of hand-written rules.',
      'Deep learning = machine learning with neural networks that have many layers.',
      'LLMs = deep learning models trained on huge amounts of text to predict the next word.',
    ],
    quiz: [
      {
        question: 'Which statement is true?',
        options: [
          'All AI is deep learning',
          'All deep learning is machine learning',
          'Machine learning and AI are unrelated',
          'LLMs are not neural networks',
        ],
        answer: 1,
        explain: 'Deep learning is a kind of machine learning, which is a kind of AI. The other way round is not true.',
      },
      {
        question: 'What makes deep learning "deep"?',
        options: ['It is very complicated to explain', 'Its neural networks have many layers', 'It runs on deep servers', 'It only works underwater'],
        answer: 1,
        explain: '"Deep" means many layers of neurons stacked on top of each other. You will see why layers matter in Module 6.',
      },
    ],
    deepDive: (
      <>
        <p>
          Machine learning also includes methods that are not neural networks at all, such as linear regression (Module
          3), decision trees and their combinations ("random forests", "gradient boosting"). These are still widely used
          for table-shaped data, like prices, risks and sales forecasts.
        </p>
        <p>
          Deep learning took over around 2012, when a deep network called AlexNet beat every other method at recognising
          images. Three things came together: big datasets, better training tricks, and GPUs, which you will meet in
          Track 2. LLMs arrived after the transformer design was published in 2017 (Track 3).
        </p>
      </>
    ),
  },

  'data-patterns': {
    goal: 'See how a model finds a pattern in data and uses it to make predictions, and why more examples help.',
    intro: (
      <>
        <p>
          Machine learning starts with <Term t="training data">data</Term>: examples with the right answers. Here, sales
          of houses: their size and the price they sold for.
        </p>
        <p>
          The model looks for a <Term t="pattern" /> in those examples, such as "every extra square metre adds about
          €1,800". Then it uses that pattern on a house it has never seen: that is a <Term t="prediction" />. Learning is
          only useful if it works on <b>new</b> cases, not just the examples it already knows.
        </p>
        <p>
          The pattern can only be as good as the data. With two examples, a model can easily find a pattern that is
          simply wrong. With many examples, the random ups and downs of single sales cancel out, and the real pattern
          shows through.
        </p>
      </>
    ),
    sim: PatternFit,
    task: {
      text: 'Look at the pattern found from just 2 examples, then from all 20. Compare how far off the predictions are for the 5 new houses.',
      done: 'With 2 examples the pattern is way off and the predictions miss by around €30k. With 20 examples it misses by less than €10k.',
    },
    takeaways: [
      'Data = examples with the right answers. The model learns from them.',
      'A pattern is the rule the model finds in the data; a prediction is that rule applied to a new case.',
      'What matters is how well predictions work on new cases, not on the examples it learned from.',
      'More (and better) data usually gives a more reliable pattern.',
    ],
    quiz: [
      {
        question: 'What is a prediction?',
        options: [
          'One of the examples in the data',
          'The model\'s answer for a new case, based on the pattern it learned',
          'A guess made without any data',
          'The price of the most expensive house',
        ],
        answer: 1,
        explain: 'The model applies the pattern it learned to a case it has not seen before.',
      },
      {
        question: 'Why did 2 examples give bad predictions?',
        options: [
          'Two houses are too expensive',
          'With so few examples, random quirks of those two sales decide the whole pattern',
          'The model needs at least 3 examples to start',
          'Small houses cannot be predicted',
        ],
        answer: 1,
        explain: 'One house sold a bit high and the other a bit low, so the line through them is tilted. Many examples average such quirks out.',
      },
      {
        question: 'How should you judge whether a model learned well?',
        options: [
          'By how well it fits the examples it learned from',
          'By how well it predicts new cases it has never seen',
          'By how many examples it has',
          'By how fast it learned',
        ],
        answer: 1,
        explain: 'A model could memorise its examples perfectly and still fail on new ones. New cases are the real test.',
      },
    ],
    deepDive: (
      <>
        <p>
          The simulation uses <b>linear regression</b>: the straight line that keeps the squared distances to all the
          points as small as possible. It is one of the oldest machine learning methods (early 1800s) and still the first
          thing many data scientists try.
        </p>
        <p>
          A model that fits its training examples well but fails on new data is <b>overfitting</b>: it learned the noise
          instead of the pattern. That is why practitioners always keep some data aside (a "test set") that the model never
          learns from, just to check it, exactly like the 5 new houses here.
        </p>
      </>
    ),
  },

  neuron: {
    goal: 'See that a neuron just multiplies its inputs by weights, adds them up and adds a bias.',
    intro: (
      <>
        <p>
          A straight line is fine for house prices, but faces, speech and language need far richer patterns. For those we
          use <Term t="neural network">neural networks</Term>, built from tiny calculators called{' '}
          <Term t="neuron">neurons</Term>.
        </p>
        <p>
          A neuron takes a few <Term t="input">inputs</Term> (numbers). It multiplies each input by its own{' '}
          <Term t="weight" />, which says how much that input matters: a big weight means it matters a lot, a negative
          weight means it argues against. Then it adds everything up, plus one extra number, the <Term t="bias" />, a
          starting amount that shifts the result up or down. The total is its <Term t="output" />.
        </p>
        <p>
          That is all a neuron does: multiply, add. Its weights and bias are its <Term t="parameter">parameters</Term>,
          and they are everything it "knows". In the simulation you set them by hand. In the next module, the network
          finds them by itself.
        </p>
      </>
    ),
    sim: NeuronDecision,
    task: {
      text: 'Set the weights and the bias so the neuron says "go to the beach" on Saturday but "stay home" on Tuesday.',
      done: 'Positive weights for sunshine and friends, a negative weight for homework (and maybe a negative bias) do the trick. You just programmed a neuron with 4 numbers.',
    },
    takeaways: [
      'A neuron multiplies each input by a weight, adds them up and adds a bias.',
      'Weights say how much each input matters; negative weights push the answer the other way.',
      'The bias is a starting amount that makes the neuron easier or harder to "switch on".',
      'Weights and biases are the parameters: the only things a network learns.',
    ],
    quiz: [
      {
        question: 'A neuron has inputs 2 and 3, weights 0.5 and −1, and bias 1. What is its output?',
        options: ['−1', '0', '1', '4'],
        answer: 0,
        explain: '2 × 0.5 + 3 × (−1) + 1 = 1 − 3 + 1 = −1.',
      },
      {
        question: 'What does a negative weight mean?',
        options: [
          'The input is ignored',
          'A bigger input pushes the output down',
          'The neuron is broken',
          'The input must be negative',
        ],
        answer: 1,
        explain: 'More homework made the neuron less likely to say "go": the input argues against the answer.',
      },
      {
        question: 'What does a neural network actually learn?',
        options: ['Its inputs', 'Its weights and biases', 'The number of neurons', 'The questions it will be asked'],
        answer: 1,
        explain: 'The design is fixed by people. Learning only adjusts the weights and biases: the parameters.',
      },
    ],
    deepDive: (
      <>
        <p>
          In symbols: <code>output = w₁·x₁ + w₂·x₂ + … + wₙ·xₙ + b</code>. Most neurons then pass this total through a{' '}
          <Term t="squish function" /> (an "activation function") such as ReLU, which turns negative totals into 0, or
          sigmoid, which squishes any total into the range 0 to 1. Without that bend, stacking neurons would only ever
          produce straight lines.
        </p>
        <p>
          The idea goes back to 1943 (McCulloch and Pitts) and the "perceptron" of 1958. Real brain neurons are far more
          complex; artificial neurons only borrowed the rough idea of weighted inputs.
        </p>
      </>
    ),
  },

  learning: {
    goal: 'Understand how a network finds good weights by itself: measure the mistakes, then nudge the weights downhill.',
    intro: (
      <>
        <p>
          Setting weights by hand works for 4 numbers, not for millions. So how does a network learn? With a simple
          loop, repeated over and over: <b>guess, measure the mistake, nudge the weights, repeat</b>.
        </p>
        <p>
          First the network makes its guesses for the examples. Then a <Term t="loss" /> (the{' '}
          <Term t="mistake score" />) measures how wrong they are on average: 0 means perfect, bigger means worse. Picture
          it as a valley: every possible weight has a height, and the lowest point is the best weight.
        </p>
        <p>
          The <Term t="gradient" /> tells you which way is downhill from where you stand. So the network takes a small
          step that way, measures again, and steps again. That is <Term t="gradient descent" />. How big each step is,
          the <Term t="step size" />, matters: too small is slow, too big overshoots and can blow up.
        </p>
      </>
    ),
    sim: GradientDescent,
    task: {
      text: 'This model converts kilometres to miles with one weight. Take steps until the mistake score is below 0.01. Then start over and try steps that are too big.',
      done: 'Good steps reach the bottom (weight ≈ 0.62) in a handful of steps. Steps that are too big jump over the valley, further each time, and the mistakes explode.',
    },
    takeaways: [
      'The loss (mistake score) measures how wrong the model is: lower is better.',
      'The gradient says which way to change each weight to make the loss smaller.',
      'Gradient descent: take a small step downhill, measure again, repeat thousands of times.',
      'The step size (learning rate) must be just right: too small is slow, too big blows up.',
    ],
    quiz: [
      {
        question: 'What does the loss tell you?',
        options: ['How fast the model is', 'How wrong the model\'s answers are', 'How many weights it has', 'How much data it saw'],
        answer: 1,
        explain: 'The loss sums up the mistakes on the examples. Training tries to push it as low as possible.',
      },
      {
        question: 'What happens when the step size is too big?',
        options: [
          'Learning becomes perfect',
          'The weights jump past the best value and can end up further away each step',
          'Nothing changes',
          'The model needs less data',
        ],
        answer: 1,
        explain: 'Each step overshoots the bottom of the valley, landing higher on the other side, and the mistakes grow.',
      },
    ],
    deepDive: (
      <>
        <p>
          The mistake score here is the <b>mean squared error</b>: the average of (guess − right answer)². The gradient
          is its slope with respect to the weight, which calculus gives directly. Each step does{' '}
          <code>weight ← weight − step size × gradient</code>.
        </p>
        <p>
          A real network has millions or billions of weights, so the "valley" has millions of directions. A method called{' '}
          <b>backpropagation</b> works out the gradient for every weight at once, starting at the output and going back
          layer by layer. And instead of using all examples per step, training uses a small random handful each time
          ("stochastic" gradient descent), which is much faster.
        </p>
      </>
    ),
  },

  'hidden-layers': {
    goal: 'See why networks need hidden layers, and how stacking layers makes them deep.',
    intro: (
      <>
        <p>
          One neuron on its own can only split the world with a <b>straight line</b>: "yes" on one side, "no" on the
          other. Many real patterns are not straight. In the simulation, the dots inside the circle are one group and the
          dots outside are another. No straight line can wrap around a circle.
        </p>
        <p>
          The fix is a <Term t="hidden layer" />: a <Term t="layer" /> of neurons between the inputs and the output.
          Each hidden neuron draws its own straight line, and the output neuron combines their answers. A few straight
          lines together can surround a shape; more lines make it smoother.
        </p>
        <p>
          Stack several hidden layers and you get a <Term t="deep neural network" />. Each layer builds on the one before:
          in a photo network the first layers spot edges, the next ones shapes, and the last ones whole faces. More
          neurons and layers mean more <Term t="parameter">parameters</Term>, and today's biggest networks have
          billions of them.
        </p>
      </>
    ),
    sim: HiddenLayers,
    task: {
      text: 'Try the network without a hidden layer, then add hidden neurons until at least 95% of the dots are sorted correctly.',
      done: 'One neuron is stuck with a single straight line. Eight hidden neurons draw eight lines that surround the circle, using 33 parameters instead of 3.',
    },
    takeaways: [
      'A single neuron can only separate things with a straight line.',
      'Hidden neurons each draw a line; the next layer combines them into curved shapes.',
      'Deep networks stack many layers, each building more complex ideas from the one before.',
      'Every neuron adds weights, so bigger networks have many more parameters to learn and compute.',
    ],
    quiz: [
      {
        question: 'Why can\'t a single neuron separate the dots inside the circle from those outside?',
        options: [
          'It has too many weights',
          'It can only draw one straight line, and no straight line surrounds a circle',
          'The dots are too small',
          'It has no bias',
        ],
        answer: 1,
        explain: 'Multiply-and-add gives a straight boundary. Curved shapes need several neurons working together.',
      },
      {
        question: 'A network has 2 inputs, a hidden layer of 3 neurons and 1 output neuron. How many parameters?',
        options: ['5', '9', '13', '18'],
        answer: 2,
        explain: 'Each hidden neuron: 2 weights + 1 bias = 3, so 9. The output neuron: 3 weights + 1 bias = 4. Total 13.',
      },
      {
        question: 'What does "deep" in deep neural network mean?',
        options: ['Many hidden layers', 'Very large numbers', 'Very slow', 'Trained for a long time'],
        answer: 0,
        explain: 'A deep network stacks many hidden layers, each building on the previous one.',
      },
    ],
    deepDive: (
      <>
        <p>
          In the simulation the weights of the hidden neurons were chosen by hand so you can see their lines. In a real
          network, gradient descent finds them, and the lines become soft curves thanks to the{' '}
          <Term t="squish function">squish functions</Term>.
        </p>
        <p>
          A famous result (the "universal approximation theorem", 1989) says that one hidden layer with enough neurons
          can approximate almost any pattern. In practice, deep networks with many smaller layers learn far more
          efficiently than one enormous layer, which is why today's models are deep.
        </p>
      </>
    ),
  },

  'training-vs-inference': {
    goal: 'Know the two jobs of every model, training and inference, and why both need huge amounts of math.',
    intro: (
      <>
        <p>
          A model has two very different lives. <Term t="training" /> is when it learns: it sees an example, makes a guess
          (the <Term t="forward pass" />), compares it with the right answer, then goes back through the network to nudge
          every weight (the <Term t="backward pass" />). This repeats over millions or trillions of examples.
        </p>
        <p>
          <Term t="inference" /> is when it is used: you ask, it answers. Only the forward pass runs, and the weights are
          frozen: the model does not learn from your questions. Every answer from ChatGPT is inference.
        </p>
        <p>
          Both jobs are mountains of multiplications and additions: for every answer, roughly every weight is used. Train
          once (huge cost, done by the model maker), then run inference millions of times (a smaller cost per answer, but
          paid for every single user). That is why AI needs very special hardware, which is exactly where Track 2 picks
          up.
        </p>
      </>
    ),
    sim: TrainVsInfer,
    task: {
      text: 'Train the converter on at least 3 examples, then switch to Inference and ask it a question. Finally pick Llama 3 8B to see the same jobs at real scale.',
      done: 'Training changes the weights; inference only reads them. For Llama 3 8B, one answer needs 16 billion operations and training took about 7 × 10²³. Next up: the chips that make this possible.',
    },
    takeaways: [
      'Training = forward pass + compare + backward pass, repeated over huge amounts of data. The weights change.',
      'Inference = forward pass only. The weights are frozen.',
      'One training step costs about 3 times the math of one answer, and training repeats it over billions of examples.',
      'Every weight must be stored in memory and used for every answer: the reason AI needs special hardware (Track 2).',
    ],
    quiz: [
      {
        question: 'When you ask ChatGPT a question, what is happening?',
        options: ['Training', 'Inference', 'Both at once', 'Neither'],
        answer: 1,
        explain: 'Your question goes through a forward pass with frozen weights. The model is not learning from it.',
      },
      {
        question: 'What does the backward pass do?',
        options: [
          'It produces the answer',
          'It works out how to nudge each weight so the mistake gets smaller',
          'It deletes old examples',
          'It reads the question backwards',
        ],
        answer: 1,
        explain: 'It goes back through the network to find how much each weight contributed to the mistake, then nudges it. It only happens during training.',
      },
      {
        question: 'A model has 8 billion parameters. About how many operations does one forward pass need?',
        options: ['About 8 thousand', 'About 16 billion', 'About 8 trillion', 'About 16'],
        answer: 1,
        explain: 'Roughly 2 per parameter (one multiply, one add): 2 × 8 billion = 16 billion. Track 2 starts from exactly this number.',
      },
    ],
    deepDive: (
      <>
        <p>
          Rules of thumb used by AI engineers: a forward pass costs about <code>2 · N</code> operations for a model with N
          parameters, and a training step about <code>6 · N</code> per example (2 forward, about 4 backward). Training
          also needs much more memory: besides the weights, it keeps the gradients and extra bookkeeping for every
          weight.
        </p>
        <p>
          Training a large model is usually done once, on thousands of chips for weeks or months. Inference runs for the
          rest of the model's life, for every user, so over time the total cost of inference often ends up larger than the
          cost of training.
        </p>
        <p className="muted">Llama 3 8B figures: about 8 billion parameters trained on about 15 trillion tokens (Meta, 2024).</p>
      </>
    ),
  },
}
