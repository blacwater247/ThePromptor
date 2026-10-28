<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Public music guides use standalone, server-rendered content routes with leaf metadata and explicit sitemap entries, so their content is discoverable without signing in.
- Remote agent tools use the MCP SDK's generated TanStack transport with managed OAuth; tools stay in src/lib/mcp and never read browser-local storage or use privileged database clients.
- Browser agent tools register in the screen owning the visible state using useWebMCP and the shared fail-open telemetry helper; they remain separate from remote tools.
- Auth return targets are canonical same-origin paths preserved through every login method, so integration consent is not lost after sign-in.
