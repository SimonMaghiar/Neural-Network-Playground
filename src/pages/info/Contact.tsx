import { Mail } from 'lucide-react'
import { href } from '../../router'
import { CONTACT_EMAIL } from '../../site'

export default function Contact() {
  return (
    <>
      <p>
        <a className="btn primary big" href={`mailto:${CONTACT_EMAIL}`}>
          <Mail size={18} /> {CONTACT_EMAIL}
        </a>
      </p>

      <h2>What to write about</h2>
      <ul>
        <li>
          <strong>Mistakes.</strong> If an explanation, a number or a simulation looks wrong, tell us which page and
          what you expected. Accuracy matters a lot to us.
        </li>
        <li>
          <strong>Confusing parts.</strong> If something did not click, that is useful feedback too: it helps us
          explain it better.
        </li>
        <li>
          <strong>Ideas.</strong> Topics you would like a course on, or a simulation that would have helped you.
        </li>
        <li>
          <strong>Permissions.</strong> If you would like to use any of our content, please ask first: everything on
          this site is protected by copyright (see the <a href={href('terms')}>terms of use</a>).
        </li>
      </ul>
    </>
  )
}
