import { href } from '../../router'
import { CONTACT_EMAIL, OWNER, SITE_NAME } from '../../site'

export default function Terms() {
  return (
    <>
      <p className="info-updated">Last updated: 26 October 2026</p>

      <h2>Using the site</h2>
      <p>
        You are welcome to use {SITE_NAME} to learn, for your own personal and non-commercial purposes. By using the
        site you agree to these terms.
      </p>

      <h2>Copyright</h2>
      <p>
        All content on this site, including the texts, simulations, quizzes, illustrations, design and source code, is
        © {OWNER}. All rights reserved. You may not copy, reproduce, modify, republish, distribute or reuse any of it,
        in whole or in part, without written permission. Linking to any page of the site is welcome.
      </p>

      <h2>Accuracy</h2>
      <p>
        The courses are made for learning. Hardware specifications, model sizes and other figures are approximate and
        simplified on purpose, and may change as technology moves on. Nothing on this site is professional advice:
        please check official sources before making technical or purchasing decisions.
      </p>

      <h2>Availability</h2>
      <p>
        We work to keep the site available and correct, but we provide it "as is", without guarantees. We may change,
        add or remove content and features at any time.
      </p>

      <h2>Liability</h2>
      <p>
        To the extent permitted by law, {OWNER} is not liable for any loss or damage arising from the use of this site
        or from relying on its content.
      </p>

      <h2>Changes to these terms</h2>
      <p>We may update these terms. The date at the top always shows the latest version.</p>

      <h2>Contact</h2>
      <p>
        Questions about these terms or permission requests: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, or
        see the <a href={href('contact')}>contact page</a>.
      </p>
    </>
  )
}
