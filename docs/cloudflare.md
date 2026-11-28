# Cloudflare

oinam.dev is a folder of static files on Cloudflare Pages. Nothing should come in but requests for
those files, and nothing should go out but the files. This page says how the zone is set up to keep
it so, and why. The response headers live in `public/_headers`, and a test holds them; everything
here is set in the Cloudflare dashboard, by hand, and is checked by looking.

What other sites may load from the site, and why releases are kept frozen, is in `docs/linking.md`.

## Mail: Cloudflare Email Routing, when it is wanted

The domain has no mailboxes of its own and sends nothing. For now it has no mail records at all.

When an address at oinam.dev is wanted, it is made with Cloudflare Email Routing (Email, Email
Routing in the dashboard), which forwards mail for the address to an inbox that already exists.
Turning it on adds the MX and SPF records Routing needs; let it, and add nothing by hand beside
them. Nothing is ever sent from the domain itself, so no DKIM key is published for it.

If the domain is to stay without mail, the other way is to say so in DNS, so that nobody can send
mail that claims to come from it: a null MX (`.` at priority 0, added by hand, since Cloudflare's
zone-file import refuses it), `v=spf1 -all`, and a DMARC record of `p=reject`. Choose one or the
other: the no-mail records and Email Routing cannot stand together.

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
- **Methods:** a WAF custom rule blocks every request that is not `GET` or `HEAD`. The site has no
  forms and no endpoints, so nothing else has a use.
- **Pages preview deployments:** each branch gets its own address. They are left public, since the
  repository is public too; they can be put behind Cloudflare Access if that changes.

## Not yet

These are worth doing, and are left for later, by choice:

- **DNSSEC**, so the answers about the domain cannot be forged. DNS, Settings, Enable DNSSEC.
- **CAA**, so only the authorities Cloudflare uses may issue a certificate for the domain.
- **Bot Fight Mode**, with the AI crawlers the site is written for left allowed under AI Crawl
  Control.

## Not used

No Workers, no Functions, no KV or databases, no forms, and no analytics script in the pages. If
one is ever needed, it is added here first, with its reason.

A service built on the system, such as a factory that takes design requests, is not a reason to
add them here: it is a separate product, run elsewhere. See `docs/factory.md`.
