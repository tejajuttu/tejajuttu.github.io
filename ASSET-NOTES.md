# Website photo assets

These files are derived from Teja's original photographs, with their complete compositions preserved. They contain no baked-in crops; responsive layout may choose a crop with CSS. Use the dimensions below as the image's intrinsic aspect ratio and provide `srcset`/`sizes` for each format.

| Subject | Source in Downloads | Output names in `assets/img/` | Dimensions at 800 / 1600 / 2400 widths |
| --- | --- | --- | --- |
| Portrait | `IMG_6666.HEIC` | `portrait-{800,1600,2400}.{webp,jpg}` | 800×600 / 1600×1200 / 2400×1800 |
| Climbing | `IMG_2588.HEIC` | `climbing-{800,1600,2400}.{webp,jpg}` | 800×1066 / 1600×2134 / 2400×3200 |
| Snowboarding | `IMG_6401.HEIC` | `snowboarding-{800,1600,2400}.{webp,jpg}` | 800×600 / 1600×1200 / 2400×1800 |

Suggested alt text, adaptable to context:

- Portrait: “Teja smiling outdoors with a bay and city skyline in the distance.”
- Climbing: “Teja holding a rock overhang above a river canyon.”
- Snowboarding: “Teja on a snowboard with snowy peaks and a lake behind him.”

Original HEIC files were decoded at full resolution, the climbing image's EXIF orientation was applied to pixels, and images were resized and re-encoded. JPEG APP1–APP15 and comment segments were removed; WebP was encoded with metadata disabled. Validation inspected JPEG markers and WebP RIFF chunks for EXIF, XMP, ICC profiles, and comments. No GPS or other source metadata is present. Visual inspection checked orientation and composition. Original HEICs and temporary metadata-bearing conversion files are not included in the repository.
