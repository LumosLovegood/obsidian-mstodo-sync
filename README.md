# Microsoft To Do Sync

This plugin allows you to create and synchronize tasks with Microsoft To Do.

## Installation

### Adding plugin via BRAT

1. Install BRAT from the Community Plugins in Obsidian
2. Open the command palette and run the command **BRAT: Add a beta plugin for testing** (If you want the plugin version to be frozen, use the command **BRAT: Add a beta plugin with frozen version based on a release tag**.)
3. Using `LumosLovegood/obsidian-mstodo-sync`, copy that into the modal that opens up
4. Click on **Add Plugin** -- wait a few seconds and BRAT will tell you what is going on
5. After BRAT confirms the installation, in Settings go to the **Community plugins** tab.
6. Refresh the list of plugins
7. Find `obsidian-mstodo-sync` you just installed and Enable it.

### Updating plugin

- Plugin can be updated using the command palette by running the command **Check for updates to all beta plugins and UPDATE**
- Optionally, beta plugins can be configured to auto-update when starting Obsidian. This feature can be enabled in the **Obsidian42- BRAT" tab in settings.  

## Development

If you are working on the plugin, you can use the following commands to build and run the plugin:

```bash
npm install
npm run build
```

### Releasing new releases

- Update your `manifest.json` with your new version number, such as `1.0.1`, and the minimum Obsidian version required for your latest release.
- Update your `versions.json` file with `"new-plugin-version": "minimum-obsidian-version"` so older versions of Obsidian can download an older version of your plugin that's compatible.
- Create new GitHub release using your new version number as the "Tag version". Use the exact version number, don't include a prefix `v`. See here for an example: <https://github.com/obsidianmd/obsidian-sample-plugin/releases>
- Upload the files `manifest.json`, `main.js`, `styles.css` as binary attachments. Note: The manifest.json file must be in two places, first the root path of your repository and also in the release.
- Publish the release.

> You can simplify the version bump process by running `npm version patch`, `npm version minor` or `npm version major` after updating `minAppVersion` manually in `manifest.json`.
> The command will bump version in `manifest.json` and `package.json`, and add the entry for the new version to `versions.json`

### Adding your plugin to the community plugin list

- Check <https://github.com/obsidianmd/obsidian-releases/blob/master/plugin-review.md>
- Publish an initial version.
- Make sure you have a `README.md` file in the root of your repo.
- Make a pull request at <https://github.com/obsidianmd/obsidian-releases> to add your plugin.

### How to use

- Clone this repo.
- `npm i` to install dependencies
- `npm run dev` to start compilation in watch mode.

### Manually installing the plugin

- Copy over `main.js`, `styles.css`, `manifest.json` to your vault `VaultFolder/.obsidian/plugins/your-plugin-id/`.

### Improve code quality with eslint

To look for issues.

```bash
npm run lint
```

To automatically fix issues where possible.

```bash
npm run lint:fix
npm run prettier-format
```

### API Documentation

See <https://github.com/obsidianmd/obsidian-api>
