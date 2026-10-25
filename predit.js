// A one-neuron model that learns y = 2x with gradient descent.
// prediction = weight * (x / inputScale) + bias

const weight = { value: Math.random() };
const bias = { value: Math.random() };

const learningRate = 0.1;
const epochs = 800;
// Inputs are divided by this so 0..20 sits near 0..1.
// Large raw inputs make the weight step dwarf the bias step.
const inputScale = 20;

function predict(x) {
  return weight.value * (x / inputScale) + bias.value;
}

function train(examples) {
  for (let epoch = 0; epoch < epochs; epoch++) {
    let totalLoss = 0;
    let weightGradient = 0;
    let biasGradient = 0;

    for (const { x, y } of examples) {
      const guess = predict(x);
      const error = guess - y;

      const scaledX = x / inputScale;
      totalLoss += error * error;
      weightGradient += 2 * error * scaledX;
      biasGradient += 2 * error;
    }

    const n = examples.length;
    weight.value -= learningRate * (weightGradient / n);
    bias.value -= learningRate * (biasGradient / n);

    if (epoch % 100 === 0 || epoch === epochs - 1) {
      const avgLoss = totalLoss / examples.length;
      console.log(
        `epoch ${epoch}: loss=${avgLoss.toFixed(6)} weight=${weight.value.toFixed(4)} bias=${bias.value.toFixed(4)}`
      );
    }
  }
}

const trainingData = [];
for (let x = 0; x <= 20; x++) {
  trainingData.push({ x, y: x * 2 });
}

console.log("Training on numbers 0 through 20...");
train(trainingData);

console.log("\nPredictions (should be close to double):");
for (const x of [3, 7, 11, 25, 100, -4]) {
  const doubled = predict(x);
  console.log(`${x} -> ${doubled.toFixed(2)} (exact: ${x * 2})`);
}
