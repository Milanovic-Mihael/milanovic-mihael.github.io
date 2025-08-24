#!/usr/bin/env python3
import sys, shutil, os, re
from pathlib import Path

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

    # Traverse universes → ocs → images
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
                # If file exists, avoid overwrite by appending a number
                if dest_path.exists():
                    stem, ext = img.stem, img.suffix
                    i = 2
                    while True:
                        candidate = dest_dir / f"{stem}-{i}{ext}"
                        if not candidate.exists():
                            dest_path = candidate
                            break
                        i += 1
                shutil.copy2(img, dest_path)
                copied.append(dest_path)

            featured = pick_featured(copied)
            gallery_rel = [str(p.relative_to(site_root).as_posix()) for p in sorted(copied)]
            featured_rel = str(featured.relative_to(site_root).as_posix()) if featured else ""

            # Create OC markdown
            # Prefix filename with universe slug to avoid collisions
            md_name = f"{u_slug}__{oc_slug}.md"
            md_path = ocs_root / md_name

            front_matter = [
                "---",
                f'title: "{oc_name}"',
                f'universe: "{universe_name}"',
                'species: ""',
                "tags: []",
                f'featured: "{featured_rel}"',
                "gallery:",
            ]
            for g in gallery_rel:
                front_matter.append(f'  - "{g}"')
            front_matter += [
                'bio: ""',
                "---",
                ""
            ]

            with open(md_path, "w", encoding="utf-8") as f:
                f.write("\n".join(front_matter))

            print(f"[OK] Imported: {oc_name} ({universe_name}) with {len(copied)} images")

    print("\nDone. Review files in _ocs/ to add species/tags/bio as needed.")
    print("Commit and push your changes to update the site.")

if __name__ == "__main__":
    main()
