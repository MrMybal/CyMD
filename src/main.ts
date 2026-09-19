import './styles/theme.css'
import './styles/app.css'
import './styles/markdown.css'
import { App } from './app'
import { detectPlatform } from './platform'

const app = new App(detectPlatform(), document.getElementById('app')!)
if (import.meta.env.DEV) (window as unknown as { cymd: App }).cymd = app
