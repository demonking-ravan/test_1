import { defineCollection, z, reference } from 'astro:content';
// 1. Import the glob loader
import { glob } from 'astro/loaders';

const blog = defineCollection({
    // 2. Use the loader to pick up Markdown files
    loader: glob({ pattern: "**/*.md", base: "./src/content/blog" }),
    schema: z.object({
        title: z.string(),
        pubDate: z.coerce.date(), // Coerce strings into Date objects
        description: z.string(),
        tags: z.array(z.string()),
        image: z.string(),
        topic: z.string(),
    }),
});

const work = defineCollection({
    loader: glob({ pattern: "**/*.md", base: "./src/content/work" }),
    schema: z.object({
        title: z.string(),
        location: z.string(),
        description: z.string(),
        image: z.string(),
        gallery: z.array(z.string()),
        nextProject: z.object({
            id: z.string(),
            title: z.string()
        }).optional(),
    }),
});

const locations = defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/locations" }),
    schema: z.object({
        name: z.string(),
        isIndia: z.boolean(),
        hotelCount: z.number(),
        featuredImage: z.string(),
    }),
});

const hotels = defineCollection({
    loader: glob({ pattern: "**/*.json", base: "./src/content/hotels" }),
    schema: z.object({
        name: z.string(),
        locationId: reference('locations'),
        mainImage: z.string(),
        gallery: z.array(z.string()),
        amenities: z.array(z.string()),
        eventSpace: z.array(z.object({
            name: z.string().optional(),
            capacity: z.string().optional(),
            image: z.string().optional(),
        })),
        roomDetails: z.array(z.object({
            roomType: z.string(),
            description: z.string(),
            roomImages: z.array(z.string()),
        })),
        nearbyPlaces: z.array(z.object({
            name: z.string(),
            distance: z.string().optional(),
        })),
        contact: z.object({
            address: z.string(),
            phone: z.string(),
            email: z.string().email(),
        }),
    }),
});

export const collections = { blog, work, locations, hotels };
