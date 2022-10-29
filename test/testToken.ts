import { getTokenPath } from "./token";
import { App } from 'obsidian';

const app = new App();
console.log(getTokenPath(app.vault))