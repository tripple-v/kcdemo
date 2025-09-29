# Keycloak demo with Apache (mod_auth_openidc)

A ready-to-run Docker Compose environment to demonstrate OpenID Connect (OIDC) authentication with Keycloak and Apache (mod_auth_openidc) over HTTPS.

- Static website served by Apache (HTTPS):
  - Public page: https://app.kcdemo.local/
  - Protected page (OIDC): https://app.kcdemo.local/protected/
- Keycloak (HTTPS): https://auth.kcdemo.local:8443 (admin/admin)
- Realm imported automatically: `KCDEMO` (test user: `demo` / `demo`)

Note: This setup uses self-signed certificates for local development. Your browser will warn you the first time; you can proceed/trust locally.

## 1. Prerequisites
- Docker Desktop or Docker Engine + Docker Compose
- Free ports on the host: 443 (Apache), 8443 (Keycloak), 8025 (MailHog UI), 1025 (MailHog SMTP)
- Add the following entries to your hosts file (e.g., /etc/hosts on macOS/Linux, C:\Windows\System32\drivers\etc\hosts on Windows WSL2 host):
  - `127.0.0.1 app.kcdemo.local`
  - `127.0.0.1 auth.kcdemo.local`

## 2. Environment variables
- Copy the provided sample file and adjust if needed:
  ```bash
  cp .env.sample .env
  ```
- The .env file is used by the Apache container to configure OIDC endpoints and client credentials. The sample contains working defaults for this repository.
- Note: .env is git-ignored in this repository. If it was previously tracked, run:
  ```bash
  git rm --cached .env
  ```

## 3. Quick start
```bash
# From the project root
docker compose up --build
```

Wait a few seconds for the services to start, then open:
- Site: https://app.kcdemo.local/
- Protected page: https://app.kcdemo.local/protected/
- Keycloak Admin Console: https://auth.kcdemo.local:8443/
- MailHog UI (captures all outgoing emails): http://localhost:8025/

Default accounts:
- Keycloak Admin: `admin` / `admin`
- Demo user (realm `KCDEMO`): `demo` / `demo`

## 4. Usage
1. Visit the public page: https://app.kcdemo.local/
2. Go to the protected page: https://app.kcdemo.local/protected/
3. You will be redirected to Keycloak (realm `KCDEMO`) at https://auth.kcdemo.local:8443. Sign in with `demo` / `demo`.
4. Because this demo user is not email-verified on import, Keycloak will ask you to verify the email address. Open MailHog (http://localhost:8025), find the verification email, and click the link to proceed.
5. You will be redirected back to the protected page.

Tip: You can also test the "Forgot Password" flow on the Keycloak login page; the reset email will appear in MailHog as well.

## 5. Architecture and components
- Keycloak (quay.io/keycloak/keycloak:26.3)
  - Starts in dev mode and imports the `KCDEMO` realm from `keycloak/realm-export/KCDEMO-realm.json`.
  - Includes a confidential client `kcdemo-portal` (secret provided via .env).
  - Exposed on host port 8443 using a self-signed certificate from `keycloak/certs/`.
- Apache (image: bellackn/httpd_oidc)
  - Serves pages from `web/html/`.
  - Protects the `/protected` path via OIDC.
  - SSL virtual host configured in `web/apache/conf/extra/kcdemo-ssl.conf` and included from `web/apache/conf/httpd.conf`.
  - Uses self-signed certificate/key `my-ssl.crt` / `my-ssl.key` mounted into the container.
- MariaDB
  - Provides the Keycloak database. Configuration is internal to docker-compose.
- MailHog (mock SMTP)
  - SMTP server exposed on port 1025, Web UI on http://localhost:8025.
  - Keycloak is preconfigured to send all realm emails (verification, reset password, etc.) to MailHog.

Networking: services run on the same Docker network. Apache reaches Keycloak via container name `keycloak-https` over HTTPS (8443). SSL verification for the internal call is disabled for local development in Apache config (OIDCSSLValidateServer Off). Keycloak reaches SMTP via container name `mailhog` on port 1025.

## 6. Customization
- Environment variables (from `.env`):
  - `OIDC_PROVIDER_INTERNAL`: Internal base URL for Keycloak within Docker.
  - `OIDC_PROVIDER`: External base URL for Keycloak as seen by the browser.
  - `OIDC_REALM`: Realm name (default `KCDEMO`).
  - `OIDC_CRYPT`: Passphrase for OIDC cookie/session crypto.
  - `OIDC_CLIENT`: OIDC client ID (default `kcdemo-portal`).
  - `OIDC_SECRET`: OIDC client secret.
  - `SERVER_NAME`: Public server name for Apache (default `app.kcdemo.local`).
  - `API_BASE_URL`: Base host for a backend API proxy (if used).
- If you change domain/port, update both Keycloak client settings in `KCDEMO-realm.json` (redirectUris, rootUrl) and your `.env` values.

## 7. Email OTP note (optional)
This demo focuses on demonstrating email capabilities (verification and reset password) via MailHog. If you specifically want an email-based One-Time Password (OTP) step during login, Keycloak versions may require enabling or installing an email-OTP authenticator. Options include:
- Using a built-in Email OTP authenticator if available in your Keycloak distribution/version (configure it in Authentication Flows by adding the Email OTP execution to the Browser flow).
- Installing a community email-otp authenticator provider compatible with your Keycloak version.

With the current realm export, you can still demonstrate email usage via:
- Email verification (triggered on first login because the demo user's email is not verified).
- Forgot password / reset credentials flow.

## 8. Useful commands
- Start (includes build):
  ```bash
  docker compose up --build
  ```
- Stop (without removing):
  ```bash
  docker compose stop
  ```
- Stop and remove containers/networks:
  ```bash
  docker compose down
  ```
- View logs:
  ```bash
  docker compose logs -f
  ```

## 8. Troubleshooting
- Browser shows certificate warning:
  - Accept/trust the self-signed certificate locally or import it into your system keychain for development.
- Redirect or login loop:
  - Ensure your hosts entries are set and you are using the exact hostnames/ports from `.env` and the Keycloak client.
- Keycloak not reachable from Apache:
  - The Apache config targets the container `keycloak-https` over 8443. Do not replace internal endpoints with localhost.

## 9. Project structure
```
.
├─ docker-compose.yml
├─ .env.sample (copy to .env)
├─ keycloak/
│  ├─ certs/
│  │  ├─ tls.crt
│  │  └─ tls.key
│  └─ realm-export/
│     └─ KCDEMO-realm.json
├─ web/
│  ├─ apache/
│  │  └─ conf/
│  │     ├─ httpd.conf
│  │     └─ extra/
│  │        ├─ kcdemo-ssl.conf
│  │        └─ kcdemo-ssl.conf.save
│  └─ html/
│     ├─ index.html
│     └─ protected/
│        └─ index.html
├─ my-ssl.crt
└─ my-ssl.key
```

## 10. License and credits
- Keycloak: https://www.keycloak.org/
- mod_auth_openidc: https://github.com/zmartzone/mod_auth_openidc
- Images and dependencies under their respective licenses.
