import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { LucideHeartHandshake, LucideStars } from "lucide-react";
import Link from "next/link";

type Props = {
  className?: string;
};

export function Credits({ className }: Props) {
  return (
    <Dialog>
      <Button variant="link" asChild className="text-muted-foreground w-max">
        <DialogTrigger>
          <LucideHeartHandshake className="h-4 w-4" /> Credits
        </DialogTrigger>
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Credits</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-y-2">
          <p className="text-muted-foreground flex items-center gap-x-2">
            <LucideStars className="h-4 w-4" /> Assets
          </p>

          <div className={cn("text-muted-foreground text-xs", className)}>
            <Link
              href="https://icons8.com/icon/R59UyFhVgdnm/quill"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Quill Logo
            </Link>{" "}
            by{" "}
            <Link
              href="https://icons8.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Icons8
            </Link>
            <br />
            <Link
              href="https://icons8.com/icon/5j68xrjVSbVw/quill-with-ink"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline underline-offset-2 transition-colors"
            >
              quill favicon
            </Link>{" "}
            by{" "}
            <Link
              href="https://icons8.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-foreground underline underline-offset-2 transition-colors"
            >
              Icons8
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
