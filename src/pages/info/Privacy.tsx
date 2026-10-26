import { href } from '../../router'
import { CONTACT_EMAIL, SITE_NAME } from '../../site'

export default function Privacy() {
  return (
    <>
      <p className="info-updated">Last updated: 26 October 2026</p>

      <h2>No accounts, no cookies, no tracking</h2>
      <p>
        {SITE_NAME} does not ask you to sign up, and it does not use cookies, analytics, advertising or any other
        tracking tools. We do not collect, sell or share personal data.
      </p>

      <h2>Your progress stays in your browser</h2>
      <p>
        To remember which modules and lessons you have finished, the site saves a small note in your browser's local
        storage. This data never leaves your device: it is not sent to us or to anyone else. You can delete it at any
        time by clearing this site's data in your browser settings. Your progress then starts over.
      </p>

      <h2>Server logs</h2>
      <p>
        Like every website, this site is delivered by a hosting provider. To keep the service secure and reliable, the
        provider may briefly record standard technical information about each request, such as your IP address, browser
        type and the page you asked for. We do not use these logs to identify you.
      </p>

      <h2>Emails</h2>
      <p>
        If you write to us, we use your email address and message only to reply to you, and we do not add you to any
        mailing list.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        If we add new features that handle personal data, such as accounts, we will update this page first and change
        the date at the top.
      </p>

      <h2>Questions</h2>
      <p>
        Write to <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or use the{' '}
        <a href={href('contact')}>contact page</a>.
      </p>
    </>
  )
}
