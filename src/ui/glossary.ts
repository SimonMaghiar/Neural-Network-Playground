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
} as const

export type GlossaryTerm = keyof typeof glossary
