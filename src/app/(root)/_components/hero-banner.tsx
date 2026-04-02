import { ArrowRight, Sparkles } from "lucide-react";
import { LinkButton } from "@/components/link-button";

export function HeroBanner() {
  return (
    <section className="relative flex h-screen min-h-[600px] w-full items-center justify-center overflow-hidden pt-10 pb-20">
      {/* BACKGROUND DECORATIVE ELEMENTS */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient orbs */}
        <div className="bg-primary/10 absolute -top-40 -right-40 h-80 w-80 rounded-full blur-3xl" />
        <div className="bg-primary/5 absolute -bottom-40 -left-40 h-80 w-80 rounded-full blur-3xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-30" />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center md:px-8">
        {/* BADGE */}
        <div className="bg-secondary/60 border-primary/20 text-foreground mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium">
          <Sparkles size={16} className="text-primary" />
          Welcome to Premium Shopping
        </div>

        {/* HEADLINE */}
        <h1 className="text-foreground mb-6 text-5xl leading-tight font-bold text-balance md:text-7xl">
          Discover Curated Excellence
        </h1>

        {/* SUBHEADLINE */}
        <p className="text-muted-foreground mx-auto mb-8 max-w-2xl text-lg leading-relaxed text-balance md:text-xl">
          Shop from the finest vendors and discover handpicked products that
          elevate your lifestyle. Premium quality, exceptional value.
        </p>

        {/* CTA BUTTONS */}
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <LinkButton
            // className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 cursor-pointer"
            href="/products"
          >
            Shop Now
            <ArrowRight size={20} className="ml-2" />
          </LinkButton>
          <LinkButton
            variant="outline"
            size="lg"
            href="#categories"
            // className="border-primary text-primary hover:bg-primary/5 cursor-pointer border-2 px-8 font-semibold"
          >
            Explore Categories
          </LinkButton>
        </div>

        {/* TRUST INDICATORS */}
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-3 gap-8">
          <div className="text-center">
            <p className="text-foreground text-2xl font-bold">1000+</p>
            <p className="text-muted-foreground text-sm">Premium Products</p>
          </div>
          <div className="text-center">
            <p className="text-foreground text-2xl font-bold">50+</p>
            <p className="text-muted-foreground text-sm">Trusted Vendors</p>
          </div>
          <div className="text-center">
            <p className="text-foreground text-2xl font-bold">4.8★</p>
            <p className="text-muted-foreground text-sm">Customer Rating</p>
          </div>
        </div>
      </div>
    </section>
  );
}
