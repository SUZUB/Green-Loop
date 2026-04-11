/**
 * PageBackground — renders nothing on inner pages.
 * The landing page (Index.tsx) uses its own inline ParallaxBg component.
 * All inner pages use the solid #F8FAF9 body background from index.css.
 */
export type BgType = "ocean" | "pollution" | "recycling" | "waste" | "oceanPlastic" | "intro";

export const PageBackground = (_props: {
  type: BgType;
  overlay?: string;
  speed?: number;
}) => null;
