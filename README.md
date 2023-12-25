This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

## Map format
To store maps we use [Tiled](https://doc.mapeditor.org/en/stable/reference/json-map-format/) json map format. For each map we have a corresponding json (`.tmj`) file, it looks something like:

```json
{
 "height":2,
 "layers":[
    {
     "data":[1, 2, 0
             10, 5, 11],
     "height":2,
     "width":3,
    }   
 ],
 "renderorder":"right-down",
 "orientation":"orthogonal",
 "tilesets":[
    {
     "firstgid":1,
     "source":"tmp.tsj"
    },
    {
     "firstgid":2,
     "source":"tmp2.tsj"
    },
    {
     "firstgid":11,
     "source":"tmp3.tsj"
    }
 ],
 "width":3
}
```

The map itself is stored in `"data"` field. If the value is `0` then this tile is empty otherwise we must find the corresponding tileset. 

`"firstgid"` field shows the first id corresponding to this tileset, `"source"` field shows which file contains information about needed texture.

`.tsj` file looks something like: 

```json
{
 "image":"/path/to/image.png",
 "imageheight":96,
 "imagewidth":96,
 "tilecount":9,
 "tileheight":32,
 "tilewidth":32
}
```

If we have only one tile in this tileset then we can render file stored in `"image"` field as a texture, otherwise we need to get the corresponding tile from the file. In that case the picture from specified file is divided into tiles with specified height and width and tiles' ids ascending from left to right, from top to bottom starting with `"firstgid"` and needed tile is selected.

You can create custom maps using the popular map editor Tiled (https://www.mapeditor.org/). For more information please see [here](TiledDoc.md).
