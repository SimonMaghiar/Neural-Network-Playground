import { Term } from '../../ui/Term'
import type { TrackContent } from '../types'
import { CpuGpuRace } from './sims/CpuGpuRace'
import { GpuSizer } from './sims/GpuSizer'
import { MatrixLayer } from './sims/MatrixLayer'
import { MemoryLadder } from './sims/MemoryLadder'
import { OpsCounter } from './sims/OpsCounter'
import { Precision } from './sims/Precision'
import { Roofline } from './sims/Roofline'
import { Scheduler } from './sims/Scheduler'
import { Tiling } from './sims/Tiling'

export const content: TrackContent = {
  multiplication: {
    goal: 'See why AI needs an enormous amount of very simple math.',
    intro: (
      <>
        <p>
          AI models are built from tiny calculators called <Term t="neuron">neurons</Term>. Each one multiplies its inputs
          by a <Term t="weight" />, adds them up and adds a <Term t="bias" />. That's it. No magic, just multiplication and
          addition. (Want to build one yourself? Try the Neural Network Lab.)
        </p>
        <p>
          A big AI model is the same idea repeated billions of times. Every number it learned is called a{' '}
          <Term t="parameter" />, and to produce a single word of an answer, a model has to multiply-and-add with roughly{' '}
          <b>every one of its parameters</b>. Each multiply or add is one <Term t="FLOP" />.
        </p>
        <p>
          So the question "how fast can a computer run AI?" mostly becomes "how many multiplications per second can it
          do?" Let's find out how big these numbers really get.
        </p>
      </>
    ),
    sim: OpsCounter,
    task: {
      text: 'Pick bigger and bigger models, and finish with GPT-3. Compare how long one word takes for you, a CPU and a GPU.',
      done: 'One word from GPT-3 needs about 350 billion operations. By hand that would take over 11,000 years!',
    },
    takeaways: [
      'Neural networks do almost nothing except multiply and add, but a staggering number of times.',
      'Producing one word costs about 2 operations per parameter (one multiply and one add).',
      'Training costs vastly more: every example goes forward and backward, over trillions of words.',
      'The math is simple, so the winning chip is the one that can do the most simple operations at once.',
    ],
    quiz: [
      {
        question: 'What is most of the work inside a neural network?',
        options: ['Searching a database', 'Multiplying and adding numbers', 'Comparing text strings', 'Drawing graphics'],
        answer: 1,
        explain: 'Every neuron multiplies inputs by weights and adds them up. Scale that to billions of weights and that is almost all the work.',
      },
      {
        question: 'A model has 8 billion parameters. Roughly how many operations does it need to produce one word?',
        options: ['About 8 thousand', 'About 8 million', 'About 16 billion', 'About 8 quadrillion'],
        answer: 2,
        explain: 'About 2 operations (one multiply, one add) per parameter: 2 × 8 billion = 16 billion.',
      },
      {
        question: 'Why is this a problem for an ordinary computer chip?',
        options: [
          'The math is too complicated for it',
          'It does the operations mostly one after another, and there are billions of them',
          'It cannot store decimal numbers',
          'It overheats after one word',
        ],
        answer: 1,
        explain: 'Each operation is easy. The problem is the sheer number of them, and that is exactly what GPUs are built for.',
      },
    ],
    deepDive: (
      <>
        <p>
          <b>Inference rule of thumb:</b> generating one token costs about <code>2 · N</code> FLOPs, where N is the number
          of parameters (each weight is used in one multiply and one add). Attention adds a little more for long
          contexts.
        </p>
        <p>
          <b>Training rule of thumb:</b> about <code>6 · N · D</code> FLOPs, where D is the number of training tokens: 2
          for the forward pass and about 4 for the backward pass. For GPT-3 (N = 175 billion, D ≈ 300 billion tokens) that
          is roughly 3.1 × 10²³ FLOPs. Even at an ideal 1,000 trillion FLOP/s on one GPU, that is about 10 years of
          nonstop work, which is why it was trained on thousands of GPUs at once.
        </p>
        <p className="muted">Figures are approximate and based on published model sizes (as of 2024–2025).</p>
      </>
    ),
  },

  'cpu-vs-gpu': {
    goal: 'Understand the different design ideas behind a CPU and a GPU, and when each one wins.',
    intro: (
      <>
        <p>
          A <Term t="CPU" /> is like a small team of brilliant experts. It has a few powerful <Term t="core">cores</Term>{' '}
          (often 8 to 64), each extremely fast and clever at jumping between different kinds of tasks.
        </p>
        <p>
          A <Term t="GPU" /> is like a huge army of simple workers: thousands of small cores that are individually slower
          and less clever, but can all work <Term t="parallel">in parallel</Term>, at the same time. It was invented to
          colour millions of screen pixels for video games, which is lots of identical, independent little jobs.
        </p>
        <p>
          A neural network looks exactly like that: millions of multiplications that don't depend on each other. In 2012,
          a network called AlexNet trained on two gaming GPUs crushed an image-recognition contest, and AI has run on GPUs
          ever since.
        </p>
      </>
    ),
    sim: CpuGpuRace,
    task: {
      text: 'Race the CPU against the GPU. Find a setting where the CPU wins, and one where the GPU wins.',
      done: 'The GPU wins on big piles of independent jobs. The CPU wins on small jobs, or when each step has to wait for the one before.',
    },
    takeaways: [
      'CPU: few, fast, flexible cores. Great for varied work and step-by-step logic.',
      'GPU: thousands of simple cores. Great when the same small job is repeated on lots of data.',
      'A GPU has a startup cost, so tiny jobs are not worth sending to it.',
      'If every step depends on the previous one, extra workers cannot help at all.',
    ],
    quiz: [
      {
        question: 'Which job suits a GPU best?',
        options: [
          'Running your web browser',
          'Brightening each of the 8 million pixels in a photo',
          'Following a recipe where each step needs the previous result',
          'Opening a single small file',
        ],
        answer: 1,
        explain: 'Each pixel can be brightened independently, so thousands of workers can all help at once.',
      },
      {
        question: 'Why can a CPU still beat a GPU on a small job?',
        options: [
          'GPUs cannot do multiplication',
          'Getting the GPU started costs time, and with few jobs most of its workers sit idle',
          'CPUs have more cores',
          'GPUs only work at night',
        ],
        answer: 1,
        explain: 'Sending work to a GPU has overhead. With only a few jobs, that overhead is bigger than the time saved.',
      },
    ],
    deepDive: (
      <>
        <p>
          A modern server CPU spends much of its chip area on large caches, branch prediction and out-of-order execution,
          all to make a single thread fast (low <i>latency</i>). A GPU spends its area on many simple arithmetic units and
          hides delays by switching between thousands of threads (high <i>throughput</i>).
        </p>
        <p>
          For example, an NVIDIA H100 has 132 streaming multiprocessors with a total of 16,896 FP32 cores plus 528 tensor
          cores. A fast desktop CPU might reach around 1–2 trillion FP32 operations per second with vector instructions;
          the H100 reaches about 67 trillion in plain FP32 and about 989 trillion with tensor cores in BF16.
        </p>
        <p className="muted">
          The race in the simulation is a toy model with made-up timings chosen to show the trade-off, not a benchmark.
        </p>
      </>
    ),
  },

  matrices: {
    goal: 'See that a whole layer of neurons is one matrix multiplication, which is exactly what GPUs are best at.',
    intro: (
      <>
        <p>
          Put the weights of a layer into a grid: one row per neuron, one column per input. That grid is a{' '}
          <Term t="matrix" />. Now computing every neuron of the layer is one operation:{' '}
          <Term t="matrix multiplication" />.
        </p>
        <p>
          Each output is just "row of weights × column of inputs, summed up". And here is the key: every output can be
          computed <b>independently</b> of the others. That is a perfect job for thousands of GPU workers.
        </p>
        <p>
          Real models also process many inputs at once, called a <Term t="batch" />. Then the inputs become a matrix too,
          and the whole thing is one big grid-times-grid multiplication.
        </p>
      </>
    ),
    sim: MatrixLayer,
    task: {
      text: 'Click every neuron (or every output cell) to see which row and column produce it. Then switch on the batch.',
      done: 'Every output is one row times one column. They are all independent, so a GPU can compute them all at the same time.',
    },
    takeaways: [
      'A layer of neurons = weight matrix × input vector.',
      'With a batch of inputs, it becomes matrix × matrix.',
      'Every output number is independent: perfect for parallel workers.',
      'GPU makers build special hardware just for matrix multiplication (tensor cores, Module 8).',
    ],
    quiz: [
      {
        question: 'In the weight matrix, what does one row hold?',
        options: ['All the inputs', 'The weights of one neuron', 'The outputs of the layer', 'The biases'],
        answer: 1,
        explain: 'Row i holds neuron i\'s weights, one for each input.',
      },
      {
        question: 'A layer has 4 neurons and 3 inputs, and we process a batch of 4 examples. How many output numbers?',
        options: ['3', '4', '12', '16'],
        answer: 3,
        explain: '4 neurons × 4 examples = 16 outputs, each a row-times-column.',
      },
      {
        question: 'Why does batching help a GPU?',
        options: [
          'The same weights get reused for more work, so there is more parallel work to do',
          'It makes the model smaller',
          'It lowers the number of multiplications',
          'It removes the need for memory',
        ],
        answer: 0,
        explain: 'With a batch, each weight loaded from memory is used for several examples. More useful work per byte, and more independent outputs to share among workers.',
      },
    ],
    deepDive: (
      <>
        <p>
          Multiplying an (M × K) matrix by a (K × N) matrix takes <code>2 · M · N · K</code> FLOPs: M·N outputs, each a
          K-long dot product. In a transformer, M is the number of tokens in the batch, K the input width and N the output
          width.
        </p>
        <p>
          Libraries such as cuBLAS and CUTLASS contain hand-tuned kernels for this "GEMM" (GEneral Matrix Multiply)
          operation. In large language models, matrix multiplications usually account for the large majority of FLOPs;
          attention, normalisation and activations make up most of the rest.
        </p>
      </>
    ),
  },

  'memory-wall': {
    goal: 'Discover that a GPU is often waiting for data, not doing math.',
    intro: (
      <>
        <p>
          A GPU is like a super-fast chef. But a chef can only cook what arrives from the storeroom. The speed at which
          ingredients arrive is the <Term t="memory bandwidth" />.
        </p>
        <p>
          The trick question is: <b>how much cooking do you do per ingredient?</b> This is called{' '}
          <Term t="arithmetic intensity" />: operations per byte loaded. If you do lots of math with every number you
          load, the chef is always busy. If you load a number, use it once, and throw it away, the chef mostly waits.
        </p>
        <p>
          The chart below is called a <b>roofline</b>. On the left, the speed of memory limits you. On the right, the speed
          of math limits you. Where does AI land?
        </p>
      </>
    ),
    sim: Roofline,
    task: {
      text: 'Find a workload where the GPU is less than 1% busy, and one where it reaches 100%.',
      done: 'A chatbot answering one user at a time uses well under 1% of the GPU\'s math! Serving many users at once (a bigger batch) is what fills it up.',
    },
    takeaways: [
      'A GPU can do far more math than its memory can feed it.',
      'Arithmetic intensity = operations per byte loaded. Low intensity = waiting for memory.',
      'Writing a reply for one user is memory-bound: each weight is loaded and used just once per word.',
      'Batching many users or examples raises the intensity, which is why AI services process requests together.',
    ],
    quiz: [
      {
        question: 'A workload does 1 operation per byte loaded on an H100. What limits it?',
        options: ['The math speed', 'The memory speed', 'The CPU', 'Nothing, it runs at full speed'],
        answer: 1,
        explain: 'It needs data much faster than memory can deliver it, so the math units sit idle most of the time.',
      },
      {
        question: 'How can you get more math done per byte when serving a chatbot?',
        options: [
          'Use a bigger font',
          'Process many users\' requests together, so each loaded weight is used many times',
          'Use a faster CPU',
          'Load the weights twice',
        ],
        answer: 1,
        explain: 'Batching reuses each weight for every request in the batch, raising the arithmetic intensity.',
      },
    ],
    deepDive: (
      <>
        <p>
          <b>Roofline model:</b> attainable FLOP/s = min(peak FLOP/s, bandwidth × intensity). For an H100 SXM (≈989
          TFLOP/s dense BF16, 3.35 TB/s HBM3) the "ridge point" is about 989 / 3.35 ≈ 295 FLOPs per byte. Below that, a
          kernel is memory-bound.
        </p>
        <p>
          <b>Decoding one token at batch size 1:</b> each BF16 weight (2 bytes) is used for 2 FLOPs, so the intensity is
          about 1 FLOP/byte. The GPU reaches at most 3.35 TFLOP/s of its 989, about 0.3%. With a batch of B requests,
          intensity grows roughly to B.
        </p>
        <p>
          <b>The memory wall is getting worse:</b> from A100 to H100, peak dense BF16 compute grew about 3.2× (312 → 989
          TFLOP/s) while bandwidth grew about 1.7× (2.0 → 3.35 TB/s).
        </p>
        <p className="muted">Spec-sheet numbers; real kernels reach somewhat less.</p>
      </>
    ),
  },

  'memory-hierarchy': {
    goal: 'Learn the layers of memory in a GPU, and why "close and small" beats "far and big".',
    intro: (
      <>
        <p>
          Memory can't be big, fast and cheap at the same time. So computers use a ladder of memories: tiny and very fast
          ones close to the workers, and huge but slow ones further away.
        </p>
        <p>
          On a GPU, from fastest to slowest: <Term t="register">registers</Term> inside each worker,{' '}
          <Term t="shared memory" /> and an L1 <Term t="cache" /> next to each group of workers, a bigger L2 cache shared
          by the whole chip, and then the main GPU memory, <Term t="HBM" /> (also called <Term t="VRAM" />). Beyond the
          GPU are the computer's normal memory and its disk.
        </p>
        <p>
          The whole model has to live in HBM. Every time a worker needs a number, it hopes the number is already close by.
        </p>
      </>
    ),
    sim: MemoryLadder,
    task: {
      text: 'Fetch data from the registers, from GPU memory (HBM) and from the SSD. Compare the waiting times.',
      done: 'If reading a register took 1 second, reading HBM would take minutes and the SSD would take days. Keeping data close is everything.',
    },
    takeaways: [
      'Faster memory is smaller and closer to the workers; bigger memory is slower and further away.',
      'The model\'s weights live in HBM, the GPU\'s main memory. If they don\'t fit, things get very slow.',
      'Copying data from the CPU side (over PCIe) is far slower than reading HBM.',
      'Good GPU programs copy data into fast memory once and reuse it as much as possible (Module 7).',
    ],
    quiz: [
      {
        question: 'Which memory is the fastest?',
        options: ['HBM', 'L2 cache', 'Registers', 'SSD'],
        answer: 2,
        explain: 'Registers sit inside each worker and are available almost instantly, but each worker only has a few.',
      },
      {
        question: 'Where do the model\'s weights normally live while it runs on a GPU?',
        options: ['In the registers', 'In the GPU\'s main memory (HBM)', 'On the SSD', 'In the CPU cache'],
        answer: 1,
        explain: 'HBM is big enough (tens of GB) to hold the model, and still fast enough to stream the weights.',
      },
      {
        question: 'Why is it bad if a model doesn\'t fit in GPU memory?',
        options: [
          'The GPU refuses to start',
          'Parts must keep travelling over the much slower link from CPU memory',
          'The answers become random',
          'It is not a problem at all',
        ],
        answer: 1,
        explain: 'PCIe moves tens of GB/s versus thousands of GB/s for HBM. Offloading works, but is dramatically slower.',
      },
    ],
    deepDive: (
      <>
        <p>H100 SXM, approximately:</p>
        <ul>
          <li>Registers: 64K × 32-bit = 256 KB per SM, 132 SMs.</li>
          <li>L1 / shared memory: 256 KB per SM combined, up to 228 KB usable as shared memory.</li>
          <li>L2 cache: 50 MB.</li>
          <li>HBM3: 80 GB at about 3.35 TB/s.</li>
          <li>PCIe Gen5 x16 to the CPU: about 64 GB/s per direction; NVLink between GPUs: about 900 GB/s total.</li>
        </ul>
        <p>
          The cycle counts in the simulation are rough orders of magnitude; real latencies depend on access patterns and
          contention.
        </p>
      </>
    ),
  },

  threads: {
    goal: 'Understand how work is organised on a GPU: threads, warps, blocks and SMs.',
    intro: (
      <>
        <p>
          A GPU program is called a <Term t="kernel" />. When it runs, thousands of copies of it start at once. Each copy
          is a <Term t="thread" /> that handles one small piece of the result, for example one output number.
        </p>
        <p>
          Threads are grouped in teams of 32 called a <Term t="warp" />. A warp always executes the <b>same instruction</b>{' '}
          at the same moment, like rowers in a boat. Warps are packed into a <Term t="block" />, and each block runs on one{' '}
          <Term t="SM" />, a "workshop" with its own workers and fast memory. An H100 has 132 SMs.
        </p>
        <p>Two things can waste this army: SMs with nothing to do, and threads in a warp that want to do different things.</p>
      </>
    ),
    sim: Scheduler,
    task: {
      text: 'In Part 1, choose a number of blocks (8 or more) that keeps every SM busy in every round. Then explore Part 2.',
      done: 'When the blocks divide evenly over the SMs, no workshop is left idle in the last round. On a real H100 you\'d think in multiples of 132.',
    },
    takeaways: [
      'Thread = one small piece of work. Warp = 32 threads moving in lockstep. Block = a group of warps on one SM.',
      'If the work doesn\'t split evenly over the SMs, the last round leaves workshops idle (the "tail effect").',
      'If threads in a warp take different branches of an "if", the warp runs both branches one after the other.',
      'Neural network math has almost no "ifs", which is one more reason it suits GPUs so well.',
    ],
    quiz: [
      {
        question: 'How many threads are in a warp on an NVIDIA GPU?',
        options: ['4', '32', '132', '1,024'],
        answer: 1,
        explain: '32 threads that execute the same instruction together.',
      },
      {
        question: 'A GPU has 4 SMs and you launch 5 equal blocks. What happens?',
        options: [
          'All 5 run at once',
          'It takes 2 rounds, and in the second round 3 SMs sit idle',
          'One block is skipped',
          'The GPU splits the 5th block perfectly',
        ],
        answer: 1,
        explain: '4 blocks run in round 1; the 5th runs alone in round 2. That is only 62.5% of the GPU used overall.',
      },
      {
        question: 'Half the threads of a warp take the "if" branch, the other half take the "else". What happens?',
        options: [
          'Both halves run at the same time',
          'The warp runs the "if" part, then the "else" part, so it takes about twice as long',
          'The program crashes',
          'The "else" part is skipped',
        ],
        answer: 1,
        explain: 'This is called warp divergence: the warp runs each path in turn while the other threads wait.',
      },
    ],
    deepDive: (
      <>
        <p>
          In CUDA, you launch a <i>grid</i> of blocks; each block can have up to 1,024 threads. An SM can hold several
          blocks at once (up to 2,048 resident threads on H100), and switches between warps every cycle to hide memory
          delays. How many fit depends on how many registers and how much shared memory each block uses ("occupancy").
        </p>
        <p>
          The "wave quantisation" or tail effect is real: a matrix multiply split into 133 tiles on a 132-SM GPU needs two
          waves, the second almost empty. Library authors pick tile sizes partly to avoid this.
        </p>
      </>
    ),
  },

  tiling: {
    goal: 'Learn the most important trick in GPU programming: load a piece of data once, then reuse it many times.',
    intro: (
      <>
        <p>
          To multiply two matrices, every number gets used many times. The naive approach fetches each number from slow
          memory every single time it's needed. That's like walking to the cellar for each pinch of salt.
        </p>
        <p>
          The smarter approach: copy a small square piece, a <Term t="tile" />, of each matrix into fast{' '}
          <Term t="shared memory" />, do every calculation that needs those numbers, then move on to the next tiles.
          Bigger tiles mean fewer trips, but the tiles must still fit in the small fast memory.
        </p>
      </>
    ),
    sim: Tiling,
    task: {
      text: 'Multiply with 1×1 tiles, then try bigger tiles. Run the biggest tile that still fits in fast memory.',
      done: 'With 4×4 tiles you need only 256 trips to slow memory instead of 1,024: four times fewer, for the exact same result.',
    },
    takeaways: [
      'The same answer can cost very different amounts of memory traffic depending on the order of the work.',
      'Tiling loads a block of data into fast memory once and reuses it for many calculations.',
      'Doubling the tile size roughly halves the trips to slow memory, until the tiles no longer fit.',
      'Fast AI libraries (cuBLAS, FlashAttention, …) are largely clever tiling.',
    ],
    quiz: [
      {
        question: 'What is the main goal of tiling?',
        options: [
          'To do fewer multiplications',
          'To reuse data from fast memory instead of re-fetching it from slow memory',
          'To make the matrices smaller',
          'To use less precision',
        ],
        answer: 1,
        explain: 'The number of multiplications stays the same; the trips to slow memory go down.',
      },
      {
        question: 'Why not just use one gigantic tile?',
        options: [
          'It would give a wrong answer',
          'The tile has to fit in the small fast memory',
          'GPUs only support 2×2 tiles',
          'Bigger tiles mean more multiplications',
        ],
        answer: 1,
        explain: 'Shared memory and registers are tiny (kilobytes per SM). The tile size is limited by them.',
      },
    ],
    deepDive: (
      <>
        <p>
          For an N × N matrix multiply with T × T tiles, each output tile needs N/T pairs of input tiles, so the slow-memory
          loads are about <code>2N³ / T</code> numbers instead of <code>2N³</code>. The arithmetic intensity grows in
          proportion to T, which moves the kernel to the right on the roofline from Module 4.
        </p>
        <p>
          Real kernels tile at several levels at once: blocks tile into shared memory, warps tile into registers, and
          tensor cores work on small fixed tiles (for example 16 × 8 × 16). FlashAttention applies the same idea to
          attention, so the large attention matrix never has to be written to HBM.
        </p>
      </>
    ),
  },

  precision: {
    goal: 'See how storing numbers with fewer bits saves memory and gains speed, and what it costs.',
    intro: (
      <>
        <p>
          Computers store decimal numbers in <Term t="floating point" /> format: a sign, an exponent (how big the number
          is) and a mantissa (its digits). The classic format, FP32, uses 32 bits (4 bytes) per number.
        </p>
        <p>
          Neural networks turn out to be surprisingly tolerant of small rounding errors. So we can use fewer bits:
          16 (BF16 or FP16), 8 (FP8, INT8) or even 4 (INT4). Fewer bits means less memory, less data to move, and much
          faster math on <Term t="tensor core">tensor cores</Term>. Storing a model with fewer bits is called{' '}
          <Term t="quantization" />.
        </p>
        <p>
          The catch: fewer exponent bits mean a smaller range (big numbers overflow), and fewer mantissa bits mean less{' '}
          <Term t="precision" />.
        </p>
      </>
    ),
    sim: Precision,
    task: {
      text: 'Find a number that FP16 can\'t store at all (it overflows), but BF16 can.',
      done: 'FP16 tops out at 65,504. BF16 keeps FP32\'s 8 exponent bits, so it covers the same huge range, just with fewer digits. That\'s why it\'s popular for training.',
    },
    takeaways: [
      'Exponent bits = range (how big or small). Mantissa bits = precision (how many digits).',
      'BF16 has FP32\'s range with fewer digits; FP16 has more digits but a much smaller range.',
      'Halving the bits halves the memory and the data to move, and roughly doubles tensor-core speed.',
      'INT8 and INT4 store a scaled whole number per weight, which is great for running models, with a small loss of accuracy.',
    ],
    quiz: [
      {
        question: 'A 7-billion-parameter model is stored in BF16. How much memory do the weights need?',
        options: ['7 GB', '14 GB', '28 GB', '56 GB'],
        answer: 1,
        explain: 'BF16 uses 2 bytes per number: 7 billion × 2 = 14 GB.',
      },
      {
        question: 'Why is BF16 often preferred over FP16 for training?',
        options: [
          'It has more digits of precision',
          'It has the same range as FP32, so large values don\'t overflow',
          'It uses fewer bits',
          'It is the only format GPUs support',
        ],
        answer: 1,
        explain: 'BF16 keeps 8 exponent bits like FP32. FP16 overflows above 65,504, which can happen during training.',
      },
      {
        question: 'What do you lose by going from 16 to 4 bits per weight?',
        options: ['Nothing at all', 'Some accuracy, since each weight is rounded more coarsely', 'The model stops working', 'Speed'],
        answer: 1,
        explain: 'Each weight can only take 16 different values, so it is rounded more. Good quantization methods keep the damage small.',
      },
    ],
    deepDive: (
      <>
        <ul>
          <li>FP32: 1 sign, 8 exponent, 23 mantissa bits. About 7 decimal digits.</li>
          <li>BF16: 1 / 8 / 7. Same range as FP32, about 2–3 digits.</li>
          <li>FP16: 1 / 5 / 10. Max 65,504, about 3–4 digits.</li>
          <li>FP8 E4M3: 1 / 4 / 3, max 448. FP8 E5M2: 1 / 5 / 2, max 57,344.</li>
          <li>INT8 / INT4: integers with a scale factor (here one scale for the range ±10; real methods use per-channel or per-group scales).</li>
        </ul>
        <p>
          H100 SXM dense tensor-core throughput: about 989 TFLOP/s in BF16/FP16 and 1,979 in FP8 (twice that with 2:4
          sparsity). Training typically keeps an FP32 "master copy" of the weights (mixed precision); inference often runs
          in BF16, FP8 or 4-bit formats.
        </p>
        <p className="muted">The simulation rounds to nearest and ignores subnormal and special-value details.</p>
      </>
    ),
  },

  sizing: {
    goal: 'Put it all together: estimate the memory, the number of GPUs and the speed for real models.',
    intro: (
      <>
        <p>
          Now you can answer the practical question: <b>what hardware does a model need?</b> For <Term t="inference" />,
          the main cost is storing the weights: number of parameters × bytes per parameter, plus some extra room for
          working memory.
        </p>
        <p>
          Speed for a single user follows from Module 4: to write each <Term t="token" />, the GPU must read all the
          weights from memory once. So tokens per second ≈ memory bandwidth ÷ model size.
        </p>
        <p>
          Training is a different beast: besides the weights, the GPU must store gradients and optimizer memory, around 16
          bytes per parameter, which is why big models are trained on thousands of GPUs.
        </p>
      </>
    ),
    sim: GpuSizer,
    task: {
      text: 'Make a 70B model run on a single GPU. Which number format and GPU do you need?',
      done: 'With 4-bit weights, a 70B model needs about 42 GB, so it fits on one 80 GB GPU. In BF16 (168 GB) it would need several.',
    },
    takeaways: [
      'Memory for running a model ≈ parameters × bytes per parameter, plus about 20% extra.',
      'Single-user speed ≈ memory bandwidth ÷ model size, because each token reads every weight.',
      'Quantization lets big models fit on fewer GPUs and run faster.',
      'Training needs roughly 8× more memory than running in BF16, before even counting activations.',
    ],
    quiz: [
      {
        question: 'Roughly how much memory do the weights of an 8B model in BF16 need?',
        options: ['8 GB', '16 GB', '32 GB', '128 GB'],
        answer: 1,
        explain: '8 billion × 2 bytes = 16 GB (plus extra room for working memory).',
      },
      {
        question: 'A GPU reads 3.35 TB/s and the model weights are 16 GB. About how many tokens per second for one user?',
        options: ['About 2', 'About 20', 'About 200', 'About 20,000'],
        answer: 2,
        explain: '3,350 GB/s ÷ 16 GB ≈ 209 tokens per second, an upper bound because each token reads all weights once.',
      },
    ],
    deepDive: (
      <>
        <p>
          <b>Inference memory</b> = weights + KV cache + activations + framework overhead. The KV cache grows with context
          length and the number of concurrent users, and can rival the weights in size (more in the serving track). The
          flat 20% in the calculator is a simplification.
        </p>
        <p>
          <b>Training memory with Adam in mixed precision:</b> 2 bytes (BF16 weights) + 2 (gradients) + 4 (FP32 master
          weights) + 8 (two FP32 optimizer states) = 16 bytes per parameter, plus activations. Techniques like ZeRO/FSDP
          shard this across GPUs.
        </p>
        <p>
          <b>Real scale:</b> Meta reported training Llama 3 405B on up to 16,384 H100 GPUs, using about 3.8 × 10²⁵ FLOPs.
        </p>
        <p className="muted">
          GPU specs (approximate): RTX 4090 24 GB / 1.0 TB/s, A100 80 GB / 2.0 TB/s, H100 80 GB / 3.35 TB/s, H200 141 GB /
          4.8 TB/s, B200 192 GB / 8 TB/s.
        </p>
      </>
    ),
  },
}
