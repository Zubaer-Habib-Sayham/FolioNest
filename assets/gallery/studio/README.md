# Creative Studio sample imagery

These fictional sample images were generated with the built-in image generation tool on 2026-10-11. They illustrate a layout, not the developer's appearance, credentials or client work. The gallery identifies them as AI-generated sample imagery.

| Asset | Dimensions | Bytes | Purpose |
| --- | --- | --- | --- |
| portrait.webp | 1000 × 1200 | 87,700 | Transparent professional portrait over the template's circular accent |
| interior.jpg | 960 × 640 | 80,021 | Illustrative architecture project cover |
| branding.jpg | 960 × 640 | 67,758 | Illustrative packaging project cover |

The original generated rasters are preserved locally. These optimized files satisfy the application's existing raster validation. Encoding only resizes the images and removes encoding metadata; the portrait keeps its transparent background. `scripts/gallery-samples.js` reads them during preview generation. Visitors load one 220,613-byte flattened gallery JPEG rather than three full images. Selecting the template preserves the visitor's own draft and photos.

## Generation prompts

Portrait: Create an editorial photograph of a fictional South Asian male creative professional around 30, with short natural dark hair, a subtle beard and a charcoal tailored overshirt. Show a seated waist-up three-quarter pose, shoulders and arms within the frame, looking slightly toward the viewer's left. Use warm, soft side lighting and natural skin and fabric detail, suited to a cream, charcoal and terracotta portfolio. Keep a clean transparent background and natural hair edges, the body meeting the bottom edge, with no external shadows, props, text, logos or watermark.

Interior: Create a premium editorial architectural photograph of a cream boucle lounge chair beside a walnut plinth and terracotta vase. Include a cream plaster arch and soft daylight, warm materials and a quiet professional composition. Center the objects safely for a 3:2 landscape crop. No people, text, logos or interface elements.

Branding: Create a photoreal editorial still life of an unbranded terracotta skincare bottle, cream carton and black cap on a warm stone plinth. Use a cream background with a charcoal panel, geometric soft afternoon shadows and a restrained professional composition. Center the objects safely for a 3:2 landscape crop. No people, text, logos or interface elements.
