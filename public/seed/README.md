# Seed Images

Put local seed photos in one folder per idea, then upload them to Cloudflare Images:

```text
public/seed/
  manastur-trasee-scolare-protejate/
    01.jpg
    02.webp
  canalul-morii-master-plan/
    01.png
```

Then run:

```sh
npm run seed:images
npm run db:seed
```

`npm run seed:images` uploads `.jpg`, `.jpeg`, `.png`, and `.webp` files to Cloudflare Images and writes `public/seed/manifest.json`. `npm run db:seed` reads that manifest and attaches the uploaded Cloudflare URLs to the matching seeded ideas.

Rules:

- Maximum 5 images per idea folder.
- Maximum 5 MB per image.
- Folder names must match an idea `seedKey` in `prisma/seed.mjs`; for older seed ideas without a `seedKey`, use `idea-0`, `idea-1`, etc.
- Existing manifest entries are reused when the same file name and file size are present, so rerunning the upload script does not reupload unchanged files.
