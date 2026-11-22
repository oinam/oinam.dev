# Cloudflare

oinam.dev is a folder of static files on Cloudflare Pages. Nothing should come in but requests for
those files, and nothing should go out but the files. This page says how the zone is set up to keep
it so, and why. The response headers live in `public/_headers`, and a test holds them; everything
here is set in the Cloudflare dashboard, by hand, and is checked by looking.

## The domain sends no mail, and says so

The domain has no mailboxes and sends nothing. Saying so in DNS stops anyone from sending mail that
claims to come from it.

| Type | Name           | Content                                          | Why                                       |
| ---- | -------------- | ------------------------------------------------ | ----------------------------------------- |
| MX   | `oinam.dev`    | `.` at priority 0                                | A null MX: this domain accepts no mail.   |
| TXT  | `oinam.dev`    | `v=spf1 -all`                                    | No server may send mail as this domain.   |
| TXT  | `_dmarc`       | `v=DMARC1; p=reject; sp=reject; adkim=s; aspf=s` | Receivers reject anything that claims to. |
| TXT  | `*._domainkey` | `v=DKIM1; p=`                                    | No key signs mail for it, under any name. |

Email Routing stays off, and no other MX record is added.

Cloudflare's zone-file import refuses the null MX, and drops the whole file with it, so the MX is
added by hand under Add record, and the three TXT records are imported or added on their own.

## One address: www goes to the root

The site lives at `oinam.dev`. `www.oinam.dev` exists only to send people there:

- DNS: `www` is an A record to `192.0.2.1`, proxied. The address is reserved for documentation and
  never reached; the record is there so that requests for `www` arrive at Cloudflare at all.
- Rules, Redirect Rules: `https://www.oinam.dev/*` goes to `https://oinam.dev/${1}` with a 301,
  keeping the query string. A request to `http://www` is first sent to HTTPS by Always Use HTTPS,
  then here, so it takes two steps.

The Pages project is attached to `oinam.dev` only. Attaching `www` to it as well would serve the
site at two addresses.

## Only HTTPS, and only what the site serves

- **SSL/TLS:** Full (strict). Always Use HTTPS on. Minimum TLS 1.2; TLS 1.3 on.
- **HSTS:** sent by the site itself, in `_headers`, for a year and without `includeSubDomains`, so
  a subdomain added later is not bound by it before it is ready.
- **DNSSEC:** on, so the answers about the domain cannot be forged.
- **CAA:** only the authority Cloudflare uses for the certificate may issue one for the domain.
- **Methods:** a WAF custom rule blocks every request that is not `GET` or `HEAD`. The site has no
  forms and no endpoints, so nothing else has a use.
- **Bots:** Bot Fight Mode on. It does not block the AI crawlers the site is written for; those are
  left allowed under AI Crawl Control, on purpose.
- **Pages preview deployments:** each branch gets its own address. They are left public, since the
  repository is public too; they can be put behind Cloudflare Access if that changes.

## Not used

No Workers, no Functions, no KV or databases, no forms, and no analytics script in the pages. If
one is ever needed, it is added here first, with its reason.
