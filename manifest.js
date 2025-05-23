{
  "manifest_version": 3,
  "name": "Paper Notebook",
  "version": "1.0",
  "description": "Local-only digital notebook with real paper feel",
  "permissions": [
    "sidePanel",
    "storage",
    "activeTab"
  ],
  "side_panel": {
    "default_path": "sidepanel.html"
  },
  "action": {
    "default_title": "Open Paper Notebook"
  },
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"]
    }
  ]
}
