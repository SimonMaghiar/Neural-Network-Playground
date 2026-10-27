import { Term } from '../../ui/Term'
import type { TrackContent } from '../types'
import { Attention } from './sims/Attention'
import { Embeddings } from './sims/Embeddings'
import { KvCache } from './sims/KvCache'
import { NextWord } from './sims/NextWord'
import { Quantize } from './sims/Quantize'
import { Sampling } from './sims/Sampling'
import { Tokenizer } from './sims/Tokenizer'
import { TrainingStages } from './sims/TrainingStages'
import { TransformerStack } from './sims/TransformerStack'

export const content: TrackContent = {
  'next-word': {
    goal: 'Understand the one simple job every LLM does: guess the next word.',
    intro: (
      <>
        <p>
          An <Term t="LLM" /> can write essays, answer questions and write code. Surprisingly, underneath it does just one
          thing, over and over: given the text so far, it predicts <b>what comes next</b>.
        </p>
        <p>
          It doesn't pick one word with certainty. It gives every possible next word a <Term t="probability" />, picks
          one, adds it to the text, and repeats. A long answer is just this loop running hundreds of times.
        </p>
        <p>
          To get a feel for it, here's a tiny model that learned from only twelve sentences. It counts which word
          followed which. You'll write a sentence with it, one word at a time.
        </p>
      </>
    ),
    sim: NextWord,
    task: {
      text: 'Build a sentence of at least 6 words, ending with a full stop. Click the words yourself, or let the model pick.',
      done: 'You just did exactly what an LLM does: look at the probabilities, pick a word, add it, repeat. ChatGPT works the same way, just with a far better sense of what comes next.',
    },
    takeaways: [
      'An LLM predicts the next piece of text, again and again. That loop produces every answer.',
      'For each step it gives every possible next word a probability.',
      'Its "knowledge" comes from patterns in the text it was trained on.',
      'Our toy model only looks at the last word; a real LLM looks at the entire conversation.',
    ],
    quiz: [
      {
        question: 'What does an LLM do at every single step?',
        options: [
          'Looks up the answer in a database',
          'Predicts the probabilities of the next piece of text and picks one',
          'Searches the internet',
          'Writes the whole answer at once',
        ],
        answer: 1,
        explain: 'Everything an LLM writes comes from repeating "predict the next piece, pick one, add it".',
      },
      {
        question: 'Our toy model saw "the cat sat" and "the cat chased". Why can\'t it write "the cat flew"?',
        options: [
          'Cats cannot fly',
          '"flew" never appeared after "cat" in its training text, so its probability is 0',
          'The word is too long',
          'It is a bug',
        ],
        answer: 1,
        explain: 'A model can only predict patterns it learned. Real LLMs learn from so much text that they can combine ideas in new ways.',
      },
    ],
    deepDive: (
      <>
        <p>
          Formally, a language model learns P(next token | all previous tokens). Generation is <i>autoregressive</i>: each
          new token is appended to the input for the next step. The toy model here is a <i>bigram</i> model (it only
          conditions on one previous word); n-gram models like this were state of the art for decades, until neural
          networks took over.
        </p>
        <p>
          Training an LLM means adjusting its weights so the probability it gives to the actual next token in its
          training text goes up. This is the same "nudge the weights to reduce the mistake score" loop from Track 1 (gradient
          descent), with the loss called <i>cross-entropy</i>.
        </p>
      </>
    ),
  },

  tokens: {
    goal: 'See how text becomes the numbers a model can work with, and why words get cut into pieces.',
    intro: (
      <>
        <p>
          Neural networks only work with numbers. So before anything else, a <Term t="tokenizer" /> cuts your text into{' '}
          <Term t="token">tokens</Term> and gives each one an ID number from the model's <Term t="vocabulary" />.
        </p>
        <p>
          Why not use whole words? There are too many of them (plus names, typos, other languages). Why not single
          letters? Then texts become very long and each piece means very little. Tokens are the compromise: common words
          get their own token, rare words are built from smaller pieces.
        </p>
        <p>
          The most common method, <b>byte-pair encoding</b>, learns its vocabulary from text: start from single letters,
          then repeatedly glue together the pair that appears most often. Let's train one.
        </p>
      </>
    ),
    sim: Tokenizer,
    task: {
      text: 'Slide the number of merges up (at least 20) until the text averages 3 or more letters per token.',
      done: 'Each merge adds one token to the vocabulary and makes common words shorter. Real tokenizers do about 100,000 merges, so most English words become one or two tokens.',
    },
    takeaways: [
      'Models read tokens, not letters or words. Each token is an ID number.',
      'Common words become one token; rare words are split into several pieces.',
      'In English, one token is about 4 characters, or roughly ¾ of a word.',
      'Models are priced and limited by tokens, so how text is cut matters.',
    ],
    quiz: [
      {
        question: 'Why do LLMs use tokens instead of whole words?',
        options: [
          'Whole words are too hard to type',
          'There are too many possible words; pieces can build any word, even new ones',
          'Tokens are faster to read for humans',
          'Words cannot be turned into numbers',
        ],
        answer: 1,
        explain: 'With a fixed vocabulary of sub-word pieces, the model can represent any text, including names and typos.',
      },
      {
        question: 'Roughly how many tokens is a 750-word English text?',
        options: ['About 75', 'About 250', 'About 1,000', 'About 10,000'],
        answer: 2,
        explain: 'One token is roughly ¾ of an English word, so 750 words ≈ 1,000 tokens.',
      },
      {
        question: 'What does one "merge" do when training a BPE tokenizer?',
        options: [
          'Deletes a rare word',
          'Glues the most frequent pair of neighbouring tokens into a new token',
          'Splits every word into letters',
          'Translates the text',
        ],
        answer: 1,
        explain: 'Each merge adds one new, longer token to the vocabulary.',
      },
    ],
    deepDive: (
      <>
        <p>
          Modern tokenizers usually run BPE on <i>bytes</i> (UTF-8) rather than letters, so any text, emoji or language can
          be encoded without "unknown" tokens. Vocabulary sizes: GPT-2 used 50,257 tokens; Llama 3 uses about 128,000.
        </p>
        <p>
          Tokenization explains some famous LLM weaknesses: counting the letters in "strawberry" is hard when the model
          sees something like "str" + "aw" + "berry" rather than letters. Languages that are underrepresented in the
          tokenizer's training data need more tokens for the same meaning, which makes them slower and more expensive.
        </p>
      </>
    ),
  },

  embeddings: {
    goal: 'See how a model turns each token into a point on a "map of meaning".',
    intro: (
      <>
        <p>
          A token ID like 3797 says nothing about meaning. So the first layer of an LLM swaps every ID for an{' '}
          <Term t="embedding" />: a list of numbers (a <Term t="vector" />) that the model learned during training.
        </p>
        <p>
          You can picture each embedding as a point on a map. During training, words used in similar ways drift close
          together: "cat" ends up near "kitten", far from "pizza". Even better, <b>directions</b> on the map get meanings,
          such as "male → female" or "adult → young".
        </p>
        <p>
          Real embeddings have thousands of numbers each (thousands of directions). We squeezed a few words onto a 2-D map
          so you can see the idea.
        </p>
      </>
    ),
    sim: Embeddings,
    task: {
      text: 'Do the famous word math: king − man + woman. Which word does it land on?',
      done: 'Queen! Subtracting "man" and adding "woman" moves along the same direction that separates king from queen. The model learns these directions by itself, just from reading text.',
    },
    takeaways: [
      'An embedding is a list of numbers that stands for a token\'s meaning.',
      'Similar meanings = nearby points. Distance on the map measures similarity.',
      'Directions on the map can carry meaning, which allows "word math".',
      'Embeddings are learned during training; nobody hand-labels them.',
    ],
    quiz: [
      {
        question: 'Which pair of words would sit closest together on an embedding map?',
        options: ['cat and kitten', 'cat and pizza', 'banana and queen', 'king and bread'],
        answer: 0,
        explain: '"Cat" and "kitten" appear in similar sentences, so their embeddings end up close.',
      },
      {
        question: 'Where do the numbers in an embedding come from?',
        options: [
          'A dictionary written by linguists',
          'They are learned during training, like every other weight',
          'They are random and never change',
          'They are the token\'s ID number',
        ],
        answer: 1,
        explain: 'The embedding table is part of the model\'s weights, adjusted during training like everything else.',
      },
    ],
    deepDive: (
      <>
        <p>
          The embedding layer is a big table of size vocabulary × width: Llama 3 8B has 128,256 rows of 4,096 numbers,
          about 0.5 billion weights. Similarity is usually measured with <i>cosine similarity</i> (the angle between two
          vectors) rather than plain distance.
        </p>
        <p>
          The "king − man + woman ≈ queen" result became famous with word2vec (2013). Inside an LLM, embeddings are only
          the starting point: every transformer block keeps updating each token's vector using its context, so "bank" in
          "river bank" and "bank account" ends up with different vectors after a few layers.
        </p>
        <p>
          The same idea powers semantic search: embed documents and questions, then retrieve the closest ones. You'll
          meet that again in the "How Do You Give AI Its Own Knowledge?" course.
        </p>
      </>
    ),
  },

  attention: {
    goal: 'Understand attention: how each word gathers information from the words that matter for it.',
    intro: (
      <>
        <p>
          Words need context. In "The animal didn't cross the street because it was too tired", what is "it"? You know
          instantly: the animal. If the sentence ends with "too wide", "it" is the street.
        </p>
        <p>
          <Term t="attention">Attention</Term> is how a model figures this out. For every word, it scores how relevant
          every other word is. A <Term t="softmax" /> turns those scores into percentages, and the word's vector is updated
          with a mix of the other words' information in those proportions.
        </p>
        <p>
          This is the key idea of the <Term t="transformer" />, published in 2017 in a paper called "Attention Is All You
          Need".
        </p>
      </>
    ),
    sim: Attention,
    task: {
      text: 'Click the word "it" in both versions of the sentence ("tired" and "wide"). What does "it" pay attention to?',
      done: 'With "tired", "it" looks at "animal"; with "wide", it looks at "street". One word changed, and the attention moved. That is how context changes meaning.',
    },
    takeaways: [
      'Attention lets every word look at every other word and decide what matters.',
      'Relevance scores are turned into percentages with softmax; the percentages add up to 100%.',
      'Each word\'s vector is then updated with a weighted mix of the information from the others.',
      'A model runs many attention "heads" in parallel, each looking for different relationships.',
    ],
    quiz: [
      {
        question: 'What does attention decide?',
        options: [
          'Which words to delete',
          'How much each other word should influence the current word',
          'How long the answer should be',
          'Which language to answer in',
        ],
        answer: 1,
        explain: 'Attention computes weights for all other words, then mixes their information accordingly.',
      },
      {
        question: 'What does softmax do with the relevance scores?',
        options: [
          'Sorts them alphabetically',
          'Turns them into percentages that add up to 100%',
          'Removes the negative ones',
          'Multiplies them by two',
        ],
        answer: 1,
        explain: 'Softmax makes every weight positive and makes them sum to 1; higher scores get a bigger share.',
      },
      {
        question: 'Why does the attention of "it" change when "tired" becomes "wide"?',
        options: [
          'The model was retrained',
          'The scores depend on the content of all the words, so changing one word changes the scores',
          'It is random',
          'The sentence got longer',
        ],
        answer: 1,
        explain: 'Scores are computed from the words\' vectors. "Tired" fits an animal, "wide" fits a street.',
      },
    ],
    deepDive: (
      <>
        <p>
          Each token's vector is multiplied by three learned matrices to get a <b>query</b> (what am I looking for?), a{' '}
          <b>key</b> (what do I contain?) and a <b>value</b> (what do I pass on?). Then:
        </p>
        <p>
          <code>Attention(Q, K, V) = softmax(Q·Kᵀ / √d) · V</code>
        </p>
        <p>
          In a language model, each token may only attend to earlier tokens (a <i>causal mask</i>), since the future
          hasn't been written yet. Comparing every token with every other costs work proportional to the length
          squared, which is one reason long contexts are expensive; FlashAttention (see tiling in the GPU track) makes this much
          faster on GPUs. <i>Multi-head</i> attention runs many smaller attentions in parallel (GPT-3: 96 heads per layer).
        </p>
      </>
    ),
  },

  transformer: {
    goal: 'See the whole machine: how tokens flow through a tall stack of identical blocks.',
    intro: (
      <>
        <p>
          A <Term t="transformer" /> is surprisingly regular. Tokens become embeddings, and then they pass through a stack
          of identical <b>blocks</b>. Each block has two steps:
        </p>
        <p>
          1) <b>Attention</b>: every token gathers information from the other tokens. 2) <b>Feed-forward</b>: every token
          is processed on its own by two big layers of neurons, just like the hidden layers you met in Track 1. This{' '}
          <Term t="feed-forward" /> part holds most of the model's knowledge.
        </p>
        <p>
          After the last block, the model turns the final vector into a probability for every token in the vocabulary.
          Making a model bigger simply means more blocks and wider vectors.
        </p>
      </>
    ),
    sim: TransformerStack,
    task: {
      text: 'Rebuild GPT-2 small: set 12 blocks and a width of 768. How many parameters does it have?',
      done: 'About 124 million, matching the real GPT-2 small. GPT-3 uses the same design with 96 blocks and width 12,288: 175 billion parameters.',
    },
    takeaways: [
      'A transformer = embeddings → many identical blocks → probabilities for the next token.',
      'Each block: attention (tokens talk to each other) + feed-forward (each token thinks on its own).',
      'Parameters grow with the number of blocks and with the width squared.',
      'Bigger models use the same design, just scaled up.',
    ],
    quiz: [
      {
        question: 'What are the two main steps inside each transformer block?',
        options: [
          'Tokenizing and sampling',
          'Attention and a feed-forward network',
          'Training and testing',
          'Compressing and decompressing',
        ],
        answer: 1,
        explain: 'Attention mixes information between tokens; the feed-forward network processes each token separately.',
      },
      {
        question: 'You double the width of a model and keep the same number of blocks. Its parameters roughly…',
        options: ['stay the same', 'double', 'quadruple', 'halve'],
        answer: 2,
        explain: 'Each block has about 12 × width² weights, so doubling the width multiplies them by about 4.',
      },
    ],
    deepDive: (
      <>
        <p>
          Per block: attention has 4 matrices of width × width (query, key, value, output) = 4d² weights; the feed-forward
          network expands to 4d and back = 8d². Hence ≈ 12d² per block. Small extras (biases, normalisation) are ignored
          here.
        </p>
        <p>
          Two details make deep stacks trainable: a <b>residual connection</b> around each step (each block <i>adds</i>{' '}
          its result to the token's vector instead of replacing it, so the vector becomes a shared "stream" that every
          block reads and writes) and <b>layer normalisation</b>, which keeps the numbers in a stable range.
        </p>
        <p>
          Modern models tweak the recipe (RMSNorm, SwiGLU feed-forward, rotary position embeddings, grouped-query
          attention) but the overall shape is unchanged since 2017. Llama 3 8B: 32 blocks, width 4,096; Llama 3 70B: 80
          blocks, width 8,192.
        </p>
      </>
    ),
  },

  sampling: {
    goal: 'Learn how the model picks one word from its probabilities, and what temperature really does.',
    intro: (
      <>
        <p>
          At the end of each step, the model has a score for every token in its vocabulary. Turning those scores into a
          choice is called <b>sampling</b>, and you control it with a few settings.
        </p>
        <p>
          <Term t="temperature" /> sharpens or flattens the probabilities. At 0, the model always takes the single most
          likely token: predictable, but repetitive. Higher temperatures give unlikely tokens a real chance: more
          creative, but more likely to go off the rails.
        </p>
        <p>
          <Term t="top-p" /> is a safety net: it keeps only the most likely tokens that together reach p (say 90%), and
          throws the long tail of weird options away.
        </p>
      </>
    ),
    sim: Sampling,
    task: {
      text: 'Pick 20 words at temperature 0, then again at temperature 1.5 or higher (with top-p at 1). Compare the results.',
      done: 'At 0 you always get "tea". At 1.5, odd choices like "sand" or "socks" start to slip in. Same model, same scores, very different behaviour.',
    },
    takeaways: [
      'The model produces scores; sampling settings decide how we choose from them.',
      'Temperature 0 = always the top choice. Higher = more variety and more risk.',
      'Top-p cuts off the unlikely tail so high temperatures stay sensible.',
      'This is why the same question can get different answers each time.',
    ],
    quiz: [
      {
        question: 'You need the same answer every time, e.g. for extracting data. Which temperature?',
        options: ['0', '1', '1.5', '2'],
        answer: 0,
        explain: 'At temperature 0, the model always takes the most likely token, so the output is (nearly) repeatable.',
      },
      {
        question: 'What does top-p = 0.9 do?',
        options: [
          'Makes the answer 90% shorter',
          'Keeps only the most likely tokens that together cover 90% of the probability',
          'Uses 90% of the GPU',
          'Raises the temperature by 0.9',
        ],
        answer: 1,
        explain: 'The unlikely tail is removed, and the remaining probabilities are rescaled to add up to 100%.',
      },
    ],
    deepDive: (
      <>
        <p>
          The scores are called <i>logits</i>. Probabilities = softmax(logits / T). As T → 0 this becomes "argmax"
          (greedy decoding); T = 1 uses the model's own distribution; T &gt; 1 flattens it.
        </p>
        <p>
          Other common knobs: <b>top-k</b> (keep only the k most likely tokens), <b>min-p</b> (drop tokens much less
          likely than the best one), and repetition or frequency penalties. Even at temperature 0, results can vary
          slightly between runs, because GPU arithmetic in different batch sizes and orders is not perfectly identical.
        </p>
      </>
    ),
  },

  training: {
    goal: 'Understand the three training stages that turn a text predictor into a helpful assistant.',
    intro: (
      <>
        <p>
          <b>Pre-training</b>: the model reads trillions of words and learns to predict the next token. This{' '}
          <Term t="pre-training" /> stage costs months of time on thousands of GPUs and produces a "base model" that
          knows a lot but just continues text.
        </p>
        <p>
          <b>Fine-tuning</b>: the model then trains on example conversations written by people. This{' '}
          <Term t="fine-tuning" /> teaches it the format of being an assistant: when asked something, answer it.
        </p>
        <p>
          <b>Preference tuning</b>: finally, people compare pairs of answers. A <Term t="reward model" /> learns their
          preferences, and the LLM is tuned to produce answers that score well. This is <Term t="RLHF" />.
        </p>
      </>
    ),
    sim: TrainingStages,
    task: {
      text: 'Visit all three stages to see how the answer to "How do I boil an egg?" changes. In stage 3, rate all three answer pairs.',
      done: 'The knowledge comes from pre-training; fine-tuning teaches the assistant format; your ratings are exactly the kind of signal RLHF uses to shape tone, helpfulness and safety.',
    },
    takeaways: [
      'Pre-training on huge amounts of text gives knowledge, but produces a model that just continues text.',
      'Fine-tuning on example conversations teaches it to act as an assistant.',
      'Preference tuning (RLHF) uses human ratings to make answers more helpful, honest and safe.',
      'Pre-training is by far the most expensive stage; the later stages are much smaller.',
    ],
    quiz: [
      {
        question: 'You ask a base model (only pre-trained) a question. What usually happens?',
        options: [
          'It gives a perfect answer',
          'It continues the text, for example with more questions',
          'It refuses to answer',
          'It crashes',
        ],
        answer: 1,
        explain: 'A base model only learned to continue text, and on the web, questions are often followed by more questions.',
      },
      {
        question: 'What does the reward model in RLHF learn?',
        options: [
          'The grammar of English',
          'To predict which answers people prefer',
          'How to tokenize text',
          'Facts about the world',
        ],
        answer: 1,
        explain: 'It is trained on human comparisons and then scores the LLM\'s answers during tuning.',
      },
      {
        question: 'Which stage uses by far the most computing power?',
        options: ['Pre-training', 'Fine-tuning', 'RLHF', 'They all cost the same'],
        answer: 0,
        explain: 'Pre-training processes trillions of tokens; the later stages use much smaller datasets.',
      },
    ],
    deepDive: (
      <>
        <p>
          Scale: Llama 3 was pre-trained on about 15 trillion tokens. Supervised fine-tuning (SFT) datasets are typically
          thousands to millions of examples. InstructGPT (2022) popularised the SFT → reward model → reinforcement
          learning (PPO) recipe behind ChatGPT.
        </p>
        <p>
          Newer methods such as DPO skip the separate reward model and learn directly from preference pairs. Models that
          "reason" are additionally trained with reinforcement learning on problems with checkable answers (math, code),
          rewarding correct final results.
        </p>
        <p>
          Preference tuning can also cause problems: models may learn to sound confident or flattering because raters
          liked that, which is one source of convincing but wrong answers.
        </p>
      </>
    ),
  },

  'kv-cache': {
    goal: 'Learn the trick that makes generating long answers fast, and why it eats so much memory.',
    intro: (
      <>
        <p>
          In attention, every token produces a <b>key</b> (what it contains) and a <b>value</b> (the information it passes
          on). To write the next token, the model needs the keys and values of <b>all</b> earlier tokens.
        </p>
        <p>
          A naive model would recompute all of them for every new token, which is a huge waste because they never change.
          The <Term t="KV cache" /> stores them, so each step only computes the keys and values of the single newest
          token.
        </p>
        <p>
          The catch is memory. The cache grows with every token in the conversation, the <Term t="context window" />, and
          with every user being served at the same time.
        </p>
      </>
    ),
    sim: KvCache,
    task: {
      text: 'Generate the whole sentence twice: once without the cache, once with it. Compare the work. Then explore the memory calculator.',
      done: 'Without the cache: 44 key/value computations. With it: 9. The gap grows with the square of the length, so for long answers the cache is essential.',
    },
    takeaways: [
      'Keys and values of earlier tokens never change, so they can be stored and reused.',
      'With the cache, each new token costs about the same; without it, every step gets slower.',
      'The cache grows with conversation length and the number of users.',
      'For long conversations, the KV cache can need more memory than the model itself.',
    ],
    quiz: [
      {
        question: 'Why can keys and values be cached?',
        options: [
          'They are always zero',
          'Earlier tokens never change, so their keys and values stay the same',
          'The GPU forgets them otherwise',
          'They are only needed once',
        ],
        answer: 1,
        explain: 'A token can only attend to earlier tokens, so the keys and values of past tokens are fixed once computed.',
      },
      {
        question: 'A chatbot serves twice as many users, each with the same conversation length. The KV cache memory…',
        options: ['stays the same', 'doubles', 'halves', 'grows 4×'],
        answer: 1,
        explain: 'Each user has their own cache, so the total grows in proportion to the number of users.',
      },
    ],
    deepDive: (
      <>
        <p>
          Cache size per token = 2 (K and V) × layers × KV heads × head dimension × bytes. For Llama 3 8B in BF16: 2 × 32
          × 8 × 128 × 2 = 128 KiB per token, so a full 128K-token context needs about 17 GB, more than the 16 GB of
          weights.
        </p>
        <p>
          <b>Grouped-query attention</b> (GQA) shares each key/value head between several query heads (Llama 3: 32 query
          heads, 8 KV heads), cutting the cache 4×. Serving systems also quantize the cache (FP8) and manage it in pages
          to avoid wasted memory (PagedAttention, in the serving track).
        </p>
        <p>
          The work in the simulation counts key/value computations only. Without a cache the total grows as n²/2; with it,
          as n. Attention itself still has to read the whole cache every step, which is why long contexts remain slow.
        </p>
      </>
    ),
  },

  quantization: {
    goal: 'See how models are shrunk to fewer bits per weight, and the trick that keeps them accurate.',
    intro: (
      <>
        <p>
          In the GPU track you saw that fewer bits per number means less memory and faster generation. <Term t="quantization" />{' '}
          applies this to a whole trained model: each weight is rounded to one of a few allowed values. With 4 bits, there
          are only 16 of them!
        </p>
        <p>
          The allowed values are spread evenly between −max and +max, where max is the biggest weight. And there's the
          problem: a few <b>outlier</b> weights are much bigger than the rest. With one shared scale, the allowed values
          are spread so far apart that most normal weights get rounded to zero.
        </p>
        <p>
          The fix: use a separate scale for every small group of weights, so one outlier only spoils its own group.
        </p>
      </>
    ),
    sim: Quantize,
    task: {
      text: 'With the outliers included, choose 4-bit and compare "one scale for the whole layer" with "one scale per group".',
      done: 'With one shared scale, most weights collapse to zero. Per-group scales cut the error about three times, for only half a bit of extra memory per weight. That is the trick behind popular 4-bit formats.',
    },
    takeaways: [
      'Quantization rounds each weight to a small set of allowed values.',
      'Fewer bits = smaller and faster, but bigger rounding errors.',
      'Rare outlier weights stretch the scale and hurt everything else.',
      'Using a separate scale for each small group of weights keeps 4-bit models accurate.',
    ],
    quiz: [
      {
        question: 'How many different values can a 4-bit number take?',
        options: ['4', '8', '16', '256'],
        answer: 2,
        explain: '2⁴ = 16 possible values.',
      },
      {
        question: 'Why do outlier weights cause trouble?',
        options: [
          'They take up more bits',
          'They stretch the range, so the allowed values are too far apart for the many small weights',
          'They are always wrong',
          'GPUs cannot store big numbers',
        ],
        answer: 1,
        explain: 'With one scale set by the biggest weight, small weights fall between allowed values and get rounded badly, often to zero.',
      },
      {
        question: 'A 70B model goes from BF16 (16 bits) to 4 bits per weight. Its memory becomes roughly…',
        options: ['the same', 'half', 'a quarter', 'a tenth'],
        answer: 2,
        explain: '4 bits instead of 16: one quarter, roughly 140 GB → 35 GB (plus a little for the scales).',
      },
    ],
    deepDive: (
      <>
        <p>
          This simulation uses symmetric "absmax" rounding: scale = max|w| / (2^(bits−1) − 1). Real methods are smarter:
          GPTQ adjusts the remaining weights to compensate for each rounding error; AWQ protects the weights that matter
          most for the activations; common group sizes are 32–128 weights.
        </p>
        <p>
          Outliers are a well-documented feature of LLMs (LLM.int8(), 2022), especially in activations. Formats like FP8,
          and newer 4-bit floating-point formats with per-block scales (MXFP4, NVFP4), are supported directly by recent
          GPUs. 8-bit is usually nearly lossless; 4-bit costs a little quality; 3- and 2-bit cost noticeably more.
        </p>
      </>
    ),
  },
}
