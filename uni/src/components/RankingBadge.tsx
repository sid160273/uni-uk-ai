import { cn } from "@/lib/utils";

interface RankingBadgeProps {
    label: string;
    value: number | string;
    subtext?: string;
    className?: string;
    trend?: "up" | "down" | "stable";
}

export function RankingBadge({ label, value, subtext, className, trend }: RankingBadgeProps) {
    return (
        <div className={cn("flex flex-col items-center justify-center p-4 rounded-xl border bg-card shadow-sm", className)}>
            <span className="text-sm font-medium text-muted-foreground mb-1 text-center">{label}</span>
            <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-primary">
                    {typeof value === 'number' ? '#' : ''}{value}
                </span>
            </div>
            {subtext && (
                <span className="text-xs text-muted-foreground mt-1 text-center">{subtext}</span>
            )}
        </div>
    );
}
