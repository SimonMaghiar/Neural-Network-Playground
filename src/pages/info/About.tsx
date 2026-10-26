import { href } from '../../router'
import { OWNER, SITE_NAME } from '../../site'
import { courses, labs } from '../../tracks/catalog'
import { isAvailable } from '../../tracks/types'

export default function About() {
  return (
    <>
      <h2>Why this site exists</h2>
      <p>
        AI is changing how we work and live, yet most explanations either stay vague ("it's like a brain") or jump
        straight into equations. {SITE_NAME} sits in between: it explains how modern AI really works, from the chips it
        runs on to the language models you chat with, in plain words and without assuming any math background.
      </p>

      <h2>Who it is for</h2>
      <p>
        Complete beginners who are curious about AI and want to reach a solid, advanced understanding: students,
        developers moving into AI, product people, and anyone who wants to know what happens behind the chat window.
      </p>

      <h2>How the courses work</h2>
      <ul>
        <li>
          <strong>Read.</strong> Each module explains one idea in a few short paragraphs, with every technical term
          explained when you hover over it.
        </li>
        <li>
          <strong>Try it.</strong> Every module has its own interactive simulation with a small task, so you see the
          idea at work instead of taking it on trust.
        </li>
        <li>
          <strong>Check.</strong> A short quiz confirms you got it. For the curious, a "Go deeper" section adds the
          technical details.
        </li>
      </ul>

      <h2>What's inside</h2>
      <p>The courses form one path, each building on the ones before it:</p>
      <ul>
        {courses.map((t) => (
          <li key={t.id}>
            {isAvailable(t) ? <a href={href(t.id)}>{t.title}</a> : t.title} ({t.label}
            {isAvailable(t) ? '' : ', coming soon'}): {t.description}
          </li>
        ))}
      </ul>
      <p>
        Next to the courses, the <strong>Lab</strong> offers hands-on workshops you can do any time, such as{' '}
        {labs.map((t) => (
          <a key={t.id} href={href(t.id)}>
            {t.title}
          </a>
        ))}
        , where you build and train small neural networks yourself.
      </p>

      <h2>Who makes it</h2>
      <p>
        {SITE_NAME} is created and maintained by {OWNER}. Questions, corrections and ideas are always welcome on the{' '}
        <a href={href('contact')}>contact page</a>.
      </p>
    </>
  )
}
