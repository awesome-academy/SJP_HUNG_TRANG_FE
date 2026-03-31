import { getEmailMessages } from "./emailMessages"

export function getActivateEmailTemplate({
  firstName,
  activateLink,
  locale = "vi"
}: {
  firstName: string
  activateLink: string
  locale?: string
}) {
  const t = getEmailMessages(locale).activate

  return {
    subject: t.subject,
    html: `
      <h2>${t.greeting.replace("{firstName}", firstName)}</h2>
      <p>${t.content}</p>
      <a href="${activateLink}" style="padding:10px 20px;background:black;color:white;text-decoration:none;">
        ${t.button}
      </a>
    `
  }
}
