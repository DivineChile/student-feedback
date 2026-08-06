export default function RatingDots({ rating }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${i <= rating ? "bg-accent" : "bg-rule"}`}
        />
      ))}
      <span className="text-xs font-outlier text-muted ml-1">{rating}/5</span>
    </div>
  );
}
