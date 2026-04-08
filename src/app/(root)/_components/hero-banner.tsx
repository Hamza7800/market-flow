import { ArrowRight, Sparkles, ShoppingBag, Star } from "lucide-react";
import { LinkButton } from "@/components/link-button";

export function HeroBanner() {
  return (
    <section className="relative w-full overflow-hidden pt-10 pb-24 lg:flex lg:min-h-[90vh] lg:items-center">
      {/* BACKGROUND DECORATIVE ELEMENTS */}
      {/* <div className="absolute inset-0 z-0">
        <div className="bg-primary/10 absolute top-0 left-1/4 h-[500px] w-[500px] rounded-full blur-[120px]" />
        <div className="bg-accent/10 absolute right-1/4 bottom-0 h-[400px] w-[400px] rounded-full blur-[100px]" />
      </div> */}

      <div className="relative z-10 container mx-auto">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* LEFT CONTENT: GENERAL FASHION FOCUS */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="border-primary/20 text-primary mb-6 inline-flex items-center gap-2 rounded-full border bg-white/50 px-4 py-2 text-sm font-medium">
              {/* <Sparkles size={16} /> */}
              New Season Collection
            </div>

            <h1 className="mb-6 text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl md:text-7xl">
              Timeless Style <br />
              <span className="from-foreground to-foreground/70 bg-gradient-to-r bg-clip-text text-transparent">
                Modern Comfort
              </span>
            </h1>

            <p className="text-muted-foreground text-md mb-8 max-w-xl leading-relaxed sm:text-lg md:text-xl">
              Redefine your wardrobe with pieces that blend premium materials
              with sophisticated design. Quality apparel for every occasion.
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <LinkButton
                href="/products"
                className="h-14 w-full px-10 text-lg font-semibold sm:w-auto"
              >
                Explore
                <ArrowRight size={20} className="ml-2" />
              </LinkButton>

              <LinkButton
                variant="outline"
                href="/products"
                className="h-14 w-full bg-white px-10 text-lg sm:w-auto"
              >
                View Lookbook
              </LinkButton>
            </div>

            {/* TRUST INDICATORS */}
            <div className="mt-12 flex flex-wrap justify-center gap-8 lg:justify-start">
              <div className="group cursor-default">
                <p className="group-hover:text-primary text-2xl font-bold transition-colors">
                  500+
                </p>
                <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                  Unique Styles
                </p>
              </div>
              <div className="bg-border hidden h-10 w-px sm:block" />
              <div className="group cursor-default">
                <p className="group-hover:text-primary text-2xl font-bold transition-colors">
                  25k+
                </p>
                <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                  Orders Shipped
                </p>
              </div>
              <div className="bg-border hidden h-10 w-px sm:block" />
              <div className="group cursor-default">
                <p className="group-hover:text-primary flex items-center gap-1 text-2xl font-bold transition-colors">
                  4.9{" "}
                  <Star
                    size={18}
                    className="fill-warning text-warning border-none"
                  />
                </p>
                <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                  Rating
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGE COMPOSITION: APPAREL FOCUS */}
          <div className="relative hidden lg:block">
            {/* Background Decorative Frame */}
            <div className="border-primary/10 absolute -inset-4 rounded-[3rem] border opacity-50" />

            {/* Main Image: Editorial Apparel */}
            <div className="border-card bg-accent relative aspect-[4/5] overflow-hidden rounded-[2.5rem] border-8 shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=1000&auto=format&fit=crop"
                alt="High-end Fashion"
                className="h-full w-full object-cover"
              />

              {/* Floating Badge */}
              <div className="absolute top-8 right-8">
                <div className="bg-background/80 rounded-2xl border border-white/20 px-5 py-3 shadow-xl backdrop-blur-md">
                  <p className="text-primary text-xs font-bold tracking-widest uppercase">
                    Featured
                  </p>
                  <p className="text-xl font-bold">2026 Edition</p>
                </div>
              </div>
            </div>

            {/* Detail Image: Texture/Layering */}
            <div className="border-card absolute -bottom-12 -left-12 h-60 w-60 overflow-hidden rounded-3xl border-4 bg-white shadow-md">
              <img
                src="https://images.unsplash.com/photo-1740711152088-88a009e877bb?q=80&w=880&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                alt="Clothing Texture Detail"
                className="h-full w-full object-cover"
              />
            </div>

            {/* Floating Icon */}
            <div className="bg-background text-foreground absolute -top-6 -left-6 flex h-16 w-16 -rotate-6 items-center justify-center rounded-2xl shadow-md">
              <ShoppingBag size={28} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
