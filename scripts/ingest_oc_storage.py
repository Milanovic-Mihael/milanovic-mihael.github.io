#!/usr/bin/env python3
import sys, shutil, os, re
from pathlib import Path
import yaml

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".gif", ".webp"}

def slugify(text):
    text = text.strip().lower()
    text = re.sub(r"[^\w\s-]", "", text, flags=re.UNICODE)
    text = re.sub(r"[\s_-]+", "-", text)
    text = re.sub(r"^-+|-+$", "", text)
    return text or "untitled"

def pick_featured(files):
    # Prefer names containing 'featured' or 'cover'
    pri = [f for f in files if re.search(r"(featured|cover)", f.name, re.I)]
    if pri:
        return sorted(pri)[0]
    return sorted(files)[0] if files else None

def load_existing_yaml(md_path):
    if not md_path.exists():
        return {}
    with open(md_path, "r", encoding="utf-8") as f:
        content = f.read()
        # Extract first YAML block between ---
        match = re.search(r"^---\s*(.*?)\s*---", content, re.DOTALL | re.MULTILINE)
        if match:
            try:
                data = yaml.safe_load(match.group(1))
                if isinstance(data, dict):
                    return data
            except Exception:
                pass
    return {}

def main():
    if len(sys.argv) < 2:
        print("Usage: python scripts/ingest_oc_storage.py '/path/to/OC STORAGE'")
        sys.exit(1)

    src_root = Path(sys.argv[1]).expanduser().resolve()
    site_root = Path(__file__).resolve().parents[1]
    images_root = site_root / "assets" / "images"
    ocs_root = site_root / "_ocs"
    images_root.mkdir(parents=True, exist_ok=True)
    ocs_root.mkdir(parents=True, exist_ok=True)

    if not src_root.exists():
        print(f"Source folder not found: {src_root}")
        sys.exit(1)

    # Traverse universes → OCs → images
    for universe_dir in [p for p in src_root.iterdir() if p.is_dir()]:
        universe_name = universe_dir.name
        u_slug = slugify(universe_name)

        for oc_dir in [p for p in universe_dir.iterdir() if p.is_dir()]:
            oc_name = oc_dir.name
            oc_slug = slugify(oc_name)

            # Collect images
            imgs = [p for p in oc_dir.iterdir() if p.suffix.lower() in IMAGE_EXTS]
            if not imgs:
                print(f"[WARN] No images found for OC: {oc_name} (universe: {universe_name})")
                continue

            # Destination for images
            dest_dir = images_root / u_slug / oc_slug
            dest_dir.mkdir(parents=True, exist_ok=True)

            copied = []
            for img in imgs:
                dest_path = dest_dir / img.name
                shutil.copy2(img, dest_path)  # overwrite if exists
                copied.append(dest_path)

            featured = pick_featured(copied)
            gallery_rel = [str(p.relative_to(site_root).as_posix()) for p in sorted(copied)]
            featured_rel = str(featured.relative_to(site_root).as_posix()) if featured else ""

            # Prepare OC markdown
            md_name = f"{u_slug}__{oc_slug}.md"
            md_path = ocs_root / md_name

            # Load existing data
            data = load_existing_yaml(md_path)

            # Fill default fields if missing
            data.setdefault("title", oc_name)
            data.setdefault("universe", universe_name)
            data.setdefault("species", "")
            data.setdefault("tags", [])
            data.setdefault("bio", "")

            # Automatically assign 'order' if missing
            if "order" not in data:
                existing_orders = [
                    load_existing_yaml(p).get("order", 0)
                    for p in ocs_root.glob("*.md")
                    if p != md_path
                ]
                data["order"] = max(existing_orders, default=0) + 1

            # Always refresh featured + gallery
            data["featured"] = featured_rel
            data["gallery"] = gallery_rel

            # Write back to file
            with open(md_path, "w", encoding="utf-8") as f:
                f.write("---\n")
                yaml.safe_dump(data, f, sort_keys=False)
                f.write("---\n")

            print(f"[OK] Imported: {oc_name} ({universe_name}) with {len(copied)} images")

    print("\nDone. Review files in _ocs/ to add species/tags/bio/order as needed.")
    print("Commit and push your changes to update the site.")

if __name__ == "__main__":
    main()
