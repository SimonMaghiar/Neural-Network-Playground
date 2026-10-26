export const glossary = {
  'neural network':
    'A program made of many small calculators (neurons) connected together. Instead of being told the rules, it learns them from examples.',
  neuron:
    'One small calculator. It takes numbers in, multiplies each by a weight, adds a bias, and passes the result on.',
  input: 'The number(s) you give the network: the question.',
  output: 'The number the network gives back: its answer.',
  weight:
    'A number on a connection that says how much a signal counts. Big = it matters a lot. Negative = it pushes the answer the other way. Learning = adjusting weights.',
  bias: 'A number each neuron adds at the end, no matter what the input is. Think of it as a starting amount, like a base price.',
  'training data': 'The examples the network learns from: questions together with their correct answers.',
  'mistake score':
    'How wrong the network is on average across all training examples. Each mistake is squared first, so big mistakes count extra. Experts call this the "loss".',
  loss: 'The technical name for the mistake score. Lower is better; 0 means every answer is perfect.',
  training: 'Repeating the learning step many times so the mistake score keeps going down.',
  'learning step':
    'One round of practice: the network checks its answers on all examples, then nudges every weight and bias a little to make fewer mistakes. Experts call one round an "epoch".',
  epoch: 'The technical name for one practice round over all the training examples.',
  'step size':
    'How big each nudge is. Too small and learning is slow. Too big and it overshoots and goes wild. Experts call this the "learning rate".',
  'learning rate': 'The technical name for the step size.',
  nudge:
    'The network works out, for every weight, "if I made this a bit bigger, would the mistakes get smaller or bigger?" and moves it in the helpful direction. Experts call this direction the "gradient".',
  gradient: 'The technical name for the "which way and how much" signal that tells each weight how to change.',
  'squish function':
    'An extra step some neurons do at the end to reshape their result. For example, sigmoid squishes any number into the range 0 to 1, useful for yes/no answers. Experts call this an "activation function".',
  activation: 'The technical name for the squish function a neuron applies to its result.',
  'hidden layer':
    'Neurons between the input and the output. They are "hidden" because you never see their answers directly; they work out helpful in-between ideas.',
  parameter:
    'Any number the model learns: every weight and every bias. "A 70B model" means a model with about 70 billion of them.',
  AI: 'Artificial Intelligence: computer systems that do things we normally think need human intelligence, like recognising faces, translating or answering questions. Today most AI learns from examples instead of following hand-written rules.',
  'traditional software':
    'A program that follows exact step-by-step rules written by a programmer. It does exactly what it was told, and nothing it was not told.',
  'machine learning':
    'A way to build AI where the computer finds the rules itself, by spotting patterns in lots of examples, instead of a programmer writing them.',
  'deep learning':
    'Machine learning with neural networks that have many layers ("deep" means many layers). It powers face recognition, speech recognition, image generators and LLMs.',
  model: 'What learning produces: a program whose behaviour is set by the numbers (parameters) it learned from data. You give it an input and it gives back a prediction.',
  pattern: 'A regularity in data, like "bigger houses usually cost more". Machine learning finds patterns in examples and uses them on new cases.',
  prediction:
    'A model\'s answer for an input it has not seen before, based on the patterns it learned. It can be a number, a label ("spam") or the next word.',
  layer: 'A group of neurons that all work on the same inputs at the same time. A network passes numbers from one layer to the next.',
  'deep neural network':
    'A neural network with many hidden layers. Each layer builds on the one before it, from simple features to complex ideas.',
  'gradient descent':
    'How almost every neural network learns: measure the mistakes, work out which way each weight should move to reduce them (the gradient), take a small step that way, and repeat.',
  'forward pass':
    'Running an input through the network, layer by layer, to get its answer. Every time you use a model, it does a forward pass.',
  'backward pass':
    'The extra step during training: going back through the network to work out how much each weight was to blame for the mistake, so it can be nudged. Experts call it "backpropagation".',
  GPU: 'Graphics Processing Unit. A chip with thousands of simple workers that all do math at the same time. Built for video games, now the engine of AI.',
  CPU: 'Central Processing Unit: the main chip of a computer. It has a few very smart, very fast cores that are great at doing different things one after another.',
  core: 'One worker inside a chip that can do calculations. A CPU has a handful of strong cores; a GPU has thousands of simple ones.',
  parallel: 'Doing many things at the same time instead of one after another.',
  FLOP: 'A FLoating-point OPeration: one multiplication or addition of decimal numbers. "FLOP/s" counts how many a chip can do per second.',
  'matrix multiplication':
    'Multiplying two grids of numbers: each output is a row of one grid times a column of the other, summed up. Almost all of the work in a neural network is this.',
  matrix: 'A grid of numbers with rows and columns. A layer of a network keeps its weights in a matrix.',
  'memory bandwidth':
    'How many bytes per second can travel between memory and the chip. Often the real speed limit for AI, not the math.',
  HBM: 'High Bandwidth Memory: the GPU\'s main memory, stacked right next to the chip. Big (tens of GB) and fast compared to normal memory, but slow compared to the chip itself.',
  cache: 'A small, fast memory close to the chip that keeps copies of recently used data, so it does not have to be fetched from far away again.',
  register: 'The tiniest, fastest memory: a few slots inside each worker that hold the numbers it is calculating with right now.',
  'shared memory':
    'A small fast memory shared by one group of GPU workers (one SM). Programmers fill it on purpose with data the group will reuse.',
  thread: 'One small sequence of instructions run by one GPU worker, usually responsible for one tiny piece of the result.',
  warp: 'A team of 32 threads on an NVIDIA GPU that always execute the same instruction at the same time.',
  SM: 'Streaming Multiprocessor: one "workshop" on an NVIDIA GPU with its own workers, registers and shared memory. An H100 has 132 of them.',
  kernel: 'A program that runs on the GPU. Thousands of threads all run the same kernel, each on its own piece of the data.',
  block: 'A group of threads that runs together on one SM and can share its fast memory. A kernel is split into many blocks.',
  tile: 'A small square piece of a big matrix, sized so it fits in fast memory.',
  'arithmetic intensity':
    'How many calculations you do for each byte you load from memory. High intensity keeps the math units busy; low intensity leaves them waiting.',
  precision: 'How many bits a number uses. More bits = more exact, but more memory and slower math.',
  'floating point':
    'The way computers store decimal numbers: a sign, an exponent (how big) and a mantissa (the digits), like scientific notation (3.14 × 10²).',
  'tensor core':
    'A special unit in modern NVIDIA GPUs that multiplies small matrices in one go, much faster than ordinary cores, especially with low-precision numbers.',
  quantization: 'Storing a model\'s numbers with fewer bits (for example 8 or 4 instead of 16) to save memory and gain speed, at a small cost in accuracy.',
  inference: 'Using a trained model to get answers. The opposite of training.',
  VRAM: 'The memory on a graphics card (on AI GPUs this is HBM). The model must fit in it to run fast.',
  batch: 'A group of inputs processed together in one go. Bigger batches reuse the same weights for more work.',
  token: 'A small piece of text (a word or part of a word) that a language model reads or writes one at a time.',
  LLM: 'Large Language Model: a huge neural network trained on enormous amounts of text to predict the next token. ChatGPT, Claude, Gemini and Llama are LLMs.',
  prompt: 'The text you give a language model: your question or instruction, plus anything else in the conversation.',
  probability: 'How likely something is, from 0% (never) to 100% (certain). An LLM gives every possible next token a probability.',
  vocabulary: 'The fixed list of all tokens a model knows, typically 30,000 to 200,000 of them. Each has an ID number.',
  tokenizer: 'The program that cuts text into tokens and turns them into ID numbers (and back again).',
  embedding:
    'A list of numbers that represents a token\'s meaning. Tokens with similar meanings get similar lists, so they sit close together on a "map of meaning".',
  vector: 'A list of numbers, which you can picture as an arrow or a point in space. Embeddings are vectors.',
  attention:
    'The step where each word looks at the other words and decides which ones matter for understanding it, then mixes in their information.',
  softmax: 'A formula that turns any list of scores into probabilities that add up to 100%. Higher score = bigger share.',
  transformer:
    'The neural network design behind all modern LLMs (2017). It is a tall stack of identical blocks, each with an attention step and a feed-forward step.',
  'feed-forward':
    'The part of each transformer block that processes every token on its own, through two big layers of neurons. It holds most of the model\'s weights.',
  'context window': 'The maximum number of tokens a model can look at at once: your prompt plus its answer so far.',
  temperature:
    'A setting that controls how adventurous the model is when picking the next token. Low = safe and repetitive, high = creative but riskier.',
  'top-p': 'A setting that throws away the unlikely tokens, keeping only the most likely ones that together cover p (for example 90%) of the probability.',
  'pre-training': 'The first and most expensive training stage: learning to predict the next token on trillions of words of text.',
  'fine-tuning': 'Extra training on a small, carefully chosen dataset to teach a pre-trained model a specific behaviour, like answering questions.',
  RLHF: 'Reinforcement Learning from Human Feedback: people rate answers, and the model is tuned to produce the kind of answers people prefer.',
  'reward model': 'A helper model trained on human ratings that predicts how much people would like an answer.',
  'KV cache':
    'Memory where the model keeps the keys and values it already computed for earlier tokens, so it does not redo that work for every new token.',
} as const

export type GlossaryTerm = keyof typeof glossary

/** Anchor of a term on the glossary page, e.g. `KV cache` → `kv-cache`. */
export const glossaryAnchor = (term: string) => term.toLowerCase().replace(/[^a-z0-9]+/g, '-')
