# Portfolio: setup notes

Static site (no build step). Deploy the contents of this folder to Cloudflare Pages
(same as before: push these files to your GitHub repo, Pages redeploys automatically).

## One required step: connect the Contact form to a feedback service

The form sends JSON to Web3Forms (https://web3forms.com) and the message lands in your inbox.

1. Go to https://web3forms.com, enter raphaelmvigafria@gmail.com, and get your free Access Key by email.
2. Open `script.js`, find this line near the "FEEDBACK SERVICE CONFIG" comment:
       const FEEDBACK_ACCESS_KEY = 'YOUR_WEB3FORMS_ACCESS_KEY';
   and paste your key between the quotes. (Web3Forms access keys are meant to be public.)
3. Deploy, open the live site, submit the form once yourself, and confirm the email arrives.

Until a key is set, the form falls back to opening the visitor's email app (the old behaviour).
It never shows a fake "sent" message.

## Not part of this package
`server/` (Express + MySQL experiment, with a `.env` containing database credentials) is
intentionally excluded. It cannot run on Cloudflare Pages. Never upload `.env` to GitHub.
