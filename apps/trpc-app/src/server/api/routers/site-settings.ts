
import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";

export const siteSettingsRouter = createTRPCRouter({
  get: publicProcedure.query(async ({ ctx }) => {
    let settings = await ctx.db.siteSettings.findFirst();
    
    // Create default settings if none exist
    if (!settings) {
      settings = await ctx.db.siteSettings.create({
        data: {
          siteName: "LootZone",
          currency: "DZD",
          siteAnnouncementHtml: '<strong class="mr-1">Grand Launch Celebration:</strong> Stand a chance to win Membership giveaways! <a href="#" class="underline ml-2 font-medium hover:text-gray-200">Join Now</a>',
          siteSubAnnouncement: "Sale 21% Off Now",
          supportEmail: "support@lootzone.com",
          whatsappNumber: "+213556032355",
          whatsappLink: "https://wa.me/+213556032355",
          telegramLink: "https://t.me/lootzone",
          primaryColor: "#4618AC",
          accentColor: "#23c299",
        },
      });
    }
    
    return settings;
  }),

  update: protectedProcedure
    .input(z.object({
      siteName: z.string().min(1),
      currency: z.string().min(1),
      siteAnnouncementHtml: z.string(),
      siteSubAnnouncement: z.string(),
      supportEmail: z.string().email(),
      whatsappNumber: z.string(),
      whatsappLink: z.string().url(),
      telegramLink: z.string().url(),
      primaryColor: z.string().min(4),
      accentColor: z.string().min(4),
    }))
    .mutation(async ({ ctx, input }) => {
      const settings = await ctx.db.siteSettings.findFirst();
      
      if (settings) {
        return await ctx.db.siteSettings.update({
          where: { id: settings.id },
          data: input,
        });
      } else {
        return await ctx.db.siteSettings.create({
          data: input,
        });
      }
    }),
});
