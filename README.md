# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Figma ↔ code sync

```
Figma: publish library ──webhook──▶ figma-webhook-relay (Cloudflare Worker)
        ──repository_dispatch──▶ .github/workflows/figma-sync.yml
        ──▶ Claude updates components, stories, .figma.ts ──▶ pull request
merge to main ──▶ code-connect.yml publishes Code Connect + Storybook redeploys
```

**One-time setup**

1. **Figma token**: Figma → Settings → Security → Personal access tokens, with scopes
   *File content: read*, *Library content: read*, *Code Connect: write*, *Webhooks: write*.
2. **Repo secrets**: `gh secret set FIGMA_ACCESS_TOKEN` and `gh secret set ANTHROPIC_API_KEY`.
3. **Relay**: create a fine-grained GitHub token for this repo with *Contents: read and write*
   (needed for `repository_dispatch`), then:
   ```sh
   cd figma-webhook-relay
   npx wrangler deploy
   npx wrangler secret put GITHUB_TOKEN            # the fine-grained token
   npx wrangler secret put FIGMA_WEBHOOK_PASSCODE  # any random string, e.g. `openssl rand -hex 24`
   ```
4. **Webhook**:
   ```sh
   FIGMA_ACCESS_TOKEN=… FIGMA_WEBHOOK_PASSCODE=<same string> \
     node scripts/figma-sync/register-webhook.mjs https://figma-webhook-relay.<account>.workers.dev
   ```

**Re-sync by hand**: Actions → *Figma → PR sync* → Run workflow, with node ids like `6518-15173`.

Only components with a `.figma.ts` template are updated automatically; new Figma components
are listed in the PR as follow-ups, so connect them (add a template) to bring them into the loop.
