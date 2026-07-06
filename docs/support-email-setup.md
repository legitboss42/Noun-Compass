# NounCompass Support Email Setup

## Provider selected

- Inbound mail: Namecheap free email forwarding
- Outbound mail: Brevo SMTP
- Reply workflow: forwarded inbox can send as `support@nouncompass.me` through Brevo SMTP after Gmail alias setup

This combination keeps the setup free, works with the current Namecheap DNS and Vercel hosting, and avoids a paid mailbox while still letting the site send from the custom domain.

## DNS records added

- Forwarder:
  - `support@nouncompass.me -> vickysaintbrown02@gmail.com`
- Brevo domain authentication:
  - `TXT @ -> brevo-code:...`
  - `CNAME brevo1._domainkey -> b1.nouncompass-me.dkim.brevo.com`
  - `CNAME brevo2._domainkey -> b2.nouncompass-me.dkim.brevo.com`
  - `TXT _dmarc -> v=DMARC1; p=none; rua=mailto:rua@dmarc.brevo.com`
- Existing forwarding SPF kept in place:
  - `TXT @ -> v=spf1 include:spf.efwd.registrar-servers.com ~all`

## Environment variables used

- `BREVO_SMTP_HOST`
- `BREVO_SMTP_PORT`
- `BREVO_SMTP_LOGIN`
- `BREVO_SMTP_PASSWORD`
- `CONTACT_FORM_FROM`
- `CONTACT_FORM_AUTOREPLY_FROM`
- `CONTACT_FORM_TO`
- `CONTACT_FORM_RATE_LIMIT_WINDOW_MINUTES`
- `CONTACT_FORM_RATE_LIMIT_MAX`
- `CONTACT_FORM_DUPLICATE_WINDOW_MINUTES`

Save real values only in `.env.local`. Keep `.env.example` as placeholders only.

## Contact form integration

- Route: `app/api/contact/route.ts`
- UI: `components/contact-form.tsx`
- Mailer and validation: `lib/contact-mail.ts`

### What the form does

- Sends the message to `support@nouncompass.me`
- Sets `replyTo` to the visitor email
- Sends an automatic acknowledgement to the visitor
- Validates name, email, subject, and message
- Rejects header injection
- Uses a honeypot field for basic bot filtering
- Applies simple rate-limiting and duplicate-submission protection

## Gmail send-as maintenance

If you want replies to leave the forwarded inbox as `support@nouncompass.me`, add that address in Gmail:

1. Open Gmail settings.
2. Go to `Accounts and Import`.
3. Under `Send mail as`, add `support@nouncompass.me`.
4. Use:
   - SMTP server: `smtp-relay.brevo.com`
   - Port: `587`
   - Username: value from `BREVO_SMTP_LOGIN`
   - Password: value from `BREVO_SMTP_PASSWORD`
5. Confirm the alias if Gmail asks for verification.

## Recovery steps

- If outbound mail stops, regenerate the Brevo SMTP key and update `BREVO_SMTP_PASSWORD` in `.env.local`.
- If forwarding stops, recheck Namecheap `Domain -> Redirect Email`.
- If Brevo says the domain is unauthenticated, recheck the four DNS records in Namecheap and wait for propagation.

## Troubleshooting

- `Missing email delivery configuration`
  - One or more SMTP variables are missing from `.env.local`.
- `Too many messages sent recently`
  - The rate limit was triggered. Wait for the configured time window.
- `That message looks like a duplicate`
  - The same message was submitted again too quickly.
- Brevo domain still shows `Not authenticated`
  - Public DNS may already be correct. Wait and refresh Brevo again.
- Messages land in spam
  - Recheck Brevo sender verification, domain authentication, and Gmail alias SMTP settings.
