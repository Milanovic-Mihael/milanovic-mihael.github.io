# OC Site Starter (Jekyll + GitHub Pages)

This starter turns a local "OC STORAGE" (organized by universes → OCs → images) into a hosted site with:
- A page per OC, with **featured artwork** and a **gallery**
- A homepage listing all OCs with **filters by universe**

## Quick start

1. Create a new GitHub repo (public): e.g., `my-oc-website`
2. Download this folder and push all files to the repo root.
3. Enable GitHub Pages: **Settings → Pages → Deploy from branch → `main` → `/ (root)`**.
4. Run the ingest script locally to import your OC STORAGE.

## Import your OC STORAGE

Folder layout expected:
```
OC STORAGE/
  Universe A/
    OC One/
      featured.jpg
      artwork1.png
      artwork2.png
    OC Two/
      cover.png
      pic1.jpg
  Universe B/
    Another OC/
      img1.jpg
```

Run the script:
```
python scripts/ingest_oc_storage.py "/path/to/OC STORAGE"
```

This will:
- Copy images into `assets/images/<universe>/<oc>/`
- Create one markdown file per OC in `_ocs/`
- Pick a **featured** image automatically, preferring filenames containing `featured` or `cover` (case-insensitive); otherwise uses the first image alphabetically.
- Set `universe`, `title`, `featured`, and `gallery` in front matter. You can edit the generated files to add `species`, `tags`, and `bio`.

Commit + push, then your site will update automatically.
