import type { PublicReview } from "@/lib/types";

export const fallbackReviews: PublicReview[] = [
  {
    id: "demo-1",
    name: "Michael Carter",
    rating: 5,
    comment:
      "The project felt organized from day one. The team delivered a clean modern pool and kept communication clear the whole time.",
    photoUrls: [
      "https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "demo-2",
    name: "Laura Bennett",
    rating: 5,
    comment:
      "They upgraded our older pool and patio area beautifully. It looks more elegant, and the maintenance plan has been excellent.",
    photoUrls: [
      "https://images.unsplash.com/photo-1562778612-e1e0cda9915c?auto=format&fit=crop&q=80",
    ],
  },
  {
    id: "demo-3",
    name: "David Reynolds",
    rating: 5,
    comment:
      "Professional work, premium finish, and fast follow-up. This is the kind of service homeowners want when investing in a pool.",
    photoUrls: [],
  },
];
