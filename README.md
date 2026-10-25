# Neural Network Playground

An interactive, beginner-friendly playground for learning how neural networks work. You can watch neurons, weights and biases change as a network trains, and follow an input as it flows through the network to the output.

> **Proprietary software. All rights reserved.** This code may not be copied, reused, modified or redistributed. See [License](#license).

## Features

- **Guided lessons.** Eight short lessons in plain language, each with a hands-on task. They cover what a neuron is, measuring mistakes, learning by small nudges, the step size (learning rate), why the bias matters, yes/no answers, and hidden layers.
- **Free playground.** Six example models: doubling a number (the model from `predit.js`), Celsius to Fahrenheit, AND, XOR, absolute value and a sine wave. You can add or remove hidden layers, change how many neurons they have, and pick each layer's activation function.
- **Live network diagram.** Line colour and thickness show each weight. Neuron colour shows its current output. After a single learning step, every weight and bias shows how much it changed.
- **Forward-pass animation.** Watch an answer flow through the network one layer at a time.
- **Inspector.** Click any neuron or connection to see its calculation with real numbers, which way the next learning step will nudge it, a slider to change it by hand, and a chart of how it changed during training.
- **Charts.** The mistake score (loss) over time, the learned curve against the training data, and a decision map with a truth table for the yes/no models.
- **Glossary.** Hover over any underlined term for a plain-language definition.

## Getting started

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Then open the URL Vite prints, usually <http://localhost:5173>.

| Command           | What it does                              |
| ----------------- | ----------------------------------------- |
| `npm run dev`     | Start the development server              |
| `npm run build`   | Type-check and build for production       |
| `npm run preview` | Serve the production build locally        |
| `npm run lint`    | Run ESLint                                |

`predit.js` is the original standalone single-neuron script. You can run it with `node predit.js`.

## Project structure

```
src/
  nn/
    network.ts      Neural network engine: forward pass, backpropagation, gradient descent
    presets.ts      Example models and training data (free playground and lessons)
  lessons.tsx       Lesson content, tasks and which controls each step shows
  ui/
    Playground.tsx  Main workspace: toolbar, diagram, inputs, charts, inspector
    NetworkView.tsx Network diagram (React Flow)
    Inspector.tsx   Side panel explaining the selected neuron or connection
    LessonPanel.tsx Lesson sidebar with steps, tasks and navigation
    NeuronRecipe.tsx Single-neuron calculation card with hand-tuning sliders
    Charts.tsx      Loss chart, fit chart, decision map and truth table
    useTrainer.ts   Training loop and parameter history
    glossary.ts     Plain-language definitions used by hover tooltips
  App.tsx           Mode switching (lessons / free playground) and saved progress
```

## Built with

React, TypeScript, Vite, [React Flow](https://reactflow.dev/) (`@xyflow/react`), [Recharts](https://recharts.org/) and [Lucide](https://lucide.dev/) icons. These third-party libraries remain under their own licenses.

## License

Copyright © 2026 smbondrnet. All rights reserved.

This is proprietary software. No permission is granted to use, copy, modify, merge, publish, distribute, sublicense or sell any part of this code, or to create derivative works from it, without prior written permission from the copyright holder. See [LICENSE](LICENSE) for the full terms.
